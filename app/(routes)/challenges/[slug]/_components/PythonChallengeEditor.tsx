"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Play, RotateCcw, Terminal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/shadcn/button";
import { getChallengeDraftKey } from "@/lib/challenges/draft";
import type { ChallengeDefinition } from "@/lib/challenges/types";

import ChallengeSubmitButton from "./ChallengeSubmitButton";
import { useChallengeCompletion } from "./useChallengeCompletion";

interface PythonChallengeEditorProps {
  challenge: ChallengeDefinition;
  initialCompleted: boolean;
  onCompletionChange: (isCompleted: boolean) => void;
}

type WorkerMessage =
  | { type: "loading"; message: string }
  | { type: "ready" }
  | { type: "result"; output: string; runId: number }
  | { type: "error"; error: string; runId?: number };

const RUN_TIMEOUT_MS = 10_000;
const RUNTIME_TIMEOUT_MS = 45_000;

export default function PythonChallengeEditor({
  challenge,
  initialCompleted,
  onCompletionChange,
}: PythonChallengeEditorProps) {
  const pythonEntry = useMemo(
    () =>
      Object.entries(challenge.starterCode).find(([filename]) =>
        filename.toLowerCase().endsWith(".py"),
      ) ?? ["/main.py", ""],
    [challenge.starterCode],
  );
  const [filename, starterCode] = pythonEntry;

  const [code, setCode] = useState(starterCode);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("Downloading Python runtime...");
  const [isRuntimeReady, setIsRuntimeReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [workerVersion, setWorkerVersion] = useState(0);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [lastSuccessfulCode, setLastSuccessfulCode] = useState<string | null>(
    null,
  );

  const workerRef = useRef<Worker | null>(null);
  const runTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runtimeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);
  const activeRunCodeRef = useRef("");
  const codeRef = useRef(code);
  const stdinRef = useRef(stdin);

  const { completeChallenge, isSubmitting, isCompleted } =
    useChallengeCompletion({
      slug: challenge.slug,
      initialCompleted,
      onCompletionChange,
    });

  const clearRunTimeout = () => {
    if (runTimeoutRef.current) {
      clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    stdinRef.current = stdin;
  }, [stdin]);

  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(
        getChallengeDraftKey(challenge.slug),
      );

      if (rawDraft) {
        const draft = JSON.parse(rawDraft) as {
          files?: Record<string, unknown>;
          stdin?: unknown;
        };
        const savedCode = draft.files?.[filename];

        if (typeof savedCode === "string") {
          setCode(savedCode);
          codeRef.current = savedCode;
        }

        if (typeof draft.stdin === "string") {
          setStdin(draft.stdin);
          stdinRef.current = draft.stdin;
        }
      }
    } catch {
      localStorage.removeItem(getChallengeDraftKey(challenge.slug));
    } finally {
      setHasLoadedDraft(true);
    }
  }, [challenge.slug, filename]);

  useEffect(() => {
    if (!hasLoadedDraft) {
      return;
    }

    const timer = window.setTimeout(() => {
      const draftKey = getChallengeDraftKey(challenge.slug);

      if (
        isCompleted ||
        (code.trim() === starterCode.trim() && !stdin.trim())
      ) {
        localStorage.removeItem(draftKey);
        return;
      }

      localStorage.setItem(
        draftKey,
        JSON.stringify({
          files: { [filename]: code },
          stdin,
        }),
      );
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    challenge.slug,
    code,
    filename,
    hasLoadedDraft,
    isCompleted,
    starterCode,
    stdin,
  ]);

  useEffect(() => {
    const worker = new Worker(new URL("./python.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    const startRun = (codeToRun: string, stdinToUse: string) => {
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      activeRunCodeRef.current = codeToRun;
      setIsRunning(true);
      setLastSuccessfulCode(null);
      setOutput("Running...");

      worker.postMessage({
        type: "run",
        code: codeToRun,
        stdin: stdinToUse,
        runId,
      });

      clearRunTimeout();
      runTimeoutRef.current = setTimeout(() => {
        worker.terminate();
        workerRef.current = null;
        setIsRunning(false);
        setIsRuntimeReady(false);
        setLastSuccessfulCode(null);
        setOutput(
          "Execution stopped after 10 seconds. Check your loops and try again.",
        );
        setWorkerVersion((current) => current + 1);
      }, RUN_TIMEOUT_MS);
    };

    runtimeTimeoutRef.current = setTimeout(() => {
      worker.terminate();
      workerRef.current = null;
      setIsRuntimeReady(false);
      setIsRunning(false);
      setOutput(
        "Python could not load within 45 seconds. Check the connection and reload the page.",
      );
    }, RUNTIME_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      if (message.type === "loading") {
        setOutput(message.message);
        return;
      }

      if (message.type === "ready") {
        if (runtimeTimeoutRef.current) {
          clearTimeout(runtimeTimeoutRef.current);
          runtimeTimeoutRef.current = null;
        }

        setIsRuntimeReady(true);
        startRun(codeRef.current, stdinRef.current);
        return;
      }

      if (message.runId !== undefined && message.runId !== runIdRef.current) {
        return;
      }

      clearRunTimeout();
      setIsRunning(false);

      if (message.type === "result") {
        setOutput(message.output);
        setLastSuccessfulCode(activeRunCodeRef.current);
      } else {
        setOutput(message.error);
        setLastSuccessfulCode(null);
      }
    };

    worker.onerror = (event) => {
      clearRunTimeout();
      setIsRunning(false);
      setIsRuntimeReady(false);
      setLastSuccessfulCode(null);
      setOutput(event.message || "The Python worker failed to start.");
    };

    return () => {
      clearRunTimeout();

      if (runtimeTimeoutRef.current) {
        clearTimeout(runtimeTimeoutRef.current);
        runtimeTimeoutRef.current = null;
      }

      worker.terminate();
      workerRef.current = null;
    };
  }, [challenge.slug, workerVersion]);

  const runCode = () => {
    if (!workerRef.current || !isRuntimeReady || isRunning) {
      return;
    }

    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    activeRunCodeRef.current = code;
    setIsRunning(true);
    setLastSuccessfulCode(null);
    setOutput("Running...");

    workerRef.current.postMessage({
      type: "run",
      code,
      stdin,
      runId,
    });

    clearRunTimeout();
    runTimeoutRef.current = setTimeout(() => {
      workerRef.current?.terminate();
      workerRef.current = null;
      setIsRunning(false);
      setIsRuntimeReady(false);
      setLastSuccessfulCode(null);
      setOutput(
        "Execution stopped after 10 seconds. Check your loops and try again.",
      );
      setWorkerVersion((current) => current + 1);
    }, RUN_TIMEOUT_MS);
  };

  const reset = () => {
    setCode(starterCode);
    codeRef.current = starterCode;
    setStdin("");
    stdinRef.current = "";
    setLastSuccessfulCode(null);
    setOutput("Starter code restored. Run it to refresh the output.");
    localStorage.removeItem(getChallengeDraftKey(challenge.slug));
  };

  return (
    <div className="grid h-full min-h-0 bg-[#07080C] text-white lg:grid-cols-2">
      <section className="flex min-h-0 flex-col border-b border-[#899DFF]/30 lg:border-r lg:border-b-0">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#899DFF]/25 bg-[#10152A] px-4 py-3">
          <div className="flex items-center gap-2 font-pixel text-base text-[#FFD400]">
            <span className="size-2 bg-[#62FB60]" aria-hidden="true" />
            {filename.replace(/^\//, "")}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              disabled={isSubmitting}
              className="h-9 cursor-pointer rounded-none border-[#899DFF] bg-transparent px-3 font-pixel text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C]"
            >
              <RotateCcw className="size-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>

            <Button
              type="button"
              disabled={!isRuntimeReady || isRunning}
              onClick={runCode}
              className="h-9 cursor-pointer rounded-none border-2 border-[#FFD400] bg-[#FFD400] px-4 font-pixel text-[#07080C] shadow-[3px_3px_0_0_#899DFF] hover:translate-x-px hover:translate-y-px hover:bg-[#FFD400] hover:shadow-[1px_1px_0_0_#899DFF] disabled:pointer-events-none disabled:opacity-50"
            >
              <Play className="size-4" />
              {isRunning ? "Running..." : isRuntimeReady ? "Run" : "Loading..."}
            </Button>
          </div>
        </header>

        <label htmlFor="challenge-python-editor" className="sr-only">
          Python code
        </label>
        <textarea
          id="challenge-python-editor"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setLastSuccessfulCode(null);
          }}
          spellCheck={false}
          className="min-h-0 flex-1 resize-none overflow-auto bg-[#090B14] p-5 font-mono text-[15px] leading-7 text-[#E7E9F8] outline-none selection:bg-[#899DFF]/35"
        />

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#899DFF]/25 bg-[#10152A] px-4 py-3">
          <p className="hidden font-pixel text-xs text-white/30 xl:block">
            Draft saved automatically
          </p>
          <div className="ml-auto">
            <ChallengeSubmitButton
              isSubmitting={isSubmitting}
              isCompleted={isCompleted}
              onClick={() => {
                if (code.trim() === starterCode.trim()) {
                  toast.error("Change the starter code first");
                  return;
                }

                if (lastSuccessfulCode !== code) {
                  toast.error(
                    "Run the current code successfully before submitting it",
                  );
                  return;
                }

                void completeChallenge(
                  { [filename]: code },
                  { executionOutput: output, stdin },
                );
              }}
            />
          </div>
        </footer>
      </section>

      <section className="grid min-h-0 grid-rows-[minmax(110px,30%)_1fr] bg-[#050609]">
        <div className="flex min-h-0 flex-col border-b border-[#899DFF]/25">
          <label
            htmlFor="challenge-python-stdin"
            className="flex shrink-0 items-center gap-2 bg-[#10152A] px-4 py-2 font-pixel text-sm text-[#AAB6FF]"
          >
            <Keyboard className="size-4 text-[#FFD400]" />
            Program input
          </label>
          <textarea
            id="challenge-python-stdin"
            value={stdin}
            onChange={(event) => {
              setStdin(event.target.value);
              setLastSuccessfulCode(null);
            }}
            placeholder="Enter one input value per line..."
            spellCheck={false}
            className="min-h-0 flex-1 resize-none overflow-auto bg-[#090B14] p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-white/25"
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex shrink-0 items-center gap-2 bg-[#10152A] px-4 py-2 font-pixel text-sm text-[#AAB6FF]">
            <Terminal className="size-4 text-[#62FB60]" />
            Terminal output
          </div>
          <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-sm leading-6 text-[#62FB60]">
            {output}
          </pre>
        </div>
      </section>
    </div>
  );
}
