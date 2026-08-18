"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Keyboard,
  Play,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/shadcn/button";

import CompleteExerciseButton from "./CompleteExerciseButton";
import type { ExerciseData } from "./types";
import { useExerciseCompletion } from "./useExerciseCompletion";

interface PythonCodeEditorProps {
  exerciseTitle: string;
  exercise: ExerciseData;
  onCompletionChange?: (
    isCompleted: boolean,
  ) => void;
}

type WorkerMessage =
  | {
      type: "loading";
      message: string;
    }
  | {
      type: "ready";
    }
  | {
      type: "result";
      output: string;
      runId: number;
    }
  | {
      type: "error";
      error: string;
      runId?: number;
    };

const RUN_TIMEOUT_MS = 10_000;
const RUNTIME_TIMEOUT_MS = 45_000;

export default function PythonCodeEditor({
  exerciseTitle,
  exercise,
  onCompletionChange,
}: PythonCodeEditorProps) {
  const { t } = useI18n();
  const pythonEntry = useMemo(() => {
    const entry = Object.entries(
      exercise.starterCode,
    ).find(([file]) =>
      file.toLowerCase().endsWith(".py"),
    );

    return entry ?? ["/main.py", ""];
  }, [exercise.starterCode]);

  const [filename, starterCode] = pythonEntry;

  const [code, setCode] =
    useState(starterCode);

  const [stdin, setStdin] = useState("");

  const [output, setOutput] = useState(
    t("Downloading Python runtime..."),
  );

  const [isRuntimeReady, setIsRuntimeReady] =
    useState(false);

  const [isRunning, setIsRunning] =
    useState(false);

  const [workerVersion, setWorkerVersion] =
    useState(0);

  const [
    lastSuccessfulCode,
    setLastSuccessfulCode,
  ] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(
    null,
  );

  const runTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const runtimeTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const runIdRef = useRef(0);
  const activeRunCodeRef = useRef("");

  const codeRef = useRef(code);
  const stdinRef = useRef(stdin);

  const {
    completeExercise,
    isChecking,
    isCompleting,
    isCompleted,
  } = useExerciseCompletion(
    onCompletionChange,
  );

  const clearRunTimeout = useCallback(() => {
    if (!runTimeoutRef.current) {
      return;
    }

    clearTimeout(runTimeoutRef.current);
    runTimeoutRef.current = null;
  }, []);

  const clearRuntimeTimeout =
    useCallback(() => {
      if (!runtimeTimeoutRef.current) {
        return;
      }

      clearTimeout(
        runtimeTimeoutRef.current,
      );

      runtimeTimeoutRef.current = null;
    }, []);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    stdinRef.current = stdin;
  }, [stdin]);

  useEffect(() => {
    const applyReset = () => {
      setCode(starterCode);
      codeRef.current = starterCode;

      setStdin("");
      stdinRef.current = "";

      setOutput(
        t("Downloading Python runtime..."),
      );

      setIsRuntimeReady(false);
      setIsRunning(false);
      setLastSuccessfulCode(null);
    };

    if (typeof queueMicrotask !== "undefined") {
      queueMicrotask(applyReset);
    } else {
      setTimeout(applyReset, 0);
    }
  }, [exercise.id, starterCode, t]);

  useEffect(() => {
    const worker = new Worker(
  "/python.worker.js",
  {
    type: "module",
  },
);

    workerRef.current = worker;

    runtimeTimeoutRef.current = setTimeout(
      () => {
        worker.terminate();
        workerRef.current = null;

        setIsRuntimeReady(false);
        setIsRunning(false);

        setOutput(
          t(
            "Python could not load within 45 seconds. Check whether cdn.jsdelivr.net is blocked by your browser or Content Security Policy, then reload the page.",
          ),
        );
      },
      RUNTIME_TIMEOUT_MS,
    );

    worker.onmessage = (
      event: MessageEvent<WorkerMessage>,
    ) => {
      const message = event.data;

      if (message.type === "loading") {
        setOutput(
          message.message === "Loading Python module..."
            ? t("Loading Python module...")
            : message.message === "Starting Python runtime..."
              ? t("Starting Python runtime...")
              : message.message,
        );
        return;
      }

      if (message.type === "ready") {
        clearRuntimeTimeout();

        setIsRuntimeReady(true);

        setOutput(
    t("Python is ready. Click Run."),
  );

        return;
      }

      if (
        message.runId !== undefined &&
        message.runId !==
          runIdRef.current
      ) {
        return;
      }

      clearRunTimeout();
      setIsRunning(false);

      if (message.type === "result") {
        setOutput(
          message.output === "Program finished without output."
            ? t("Program finished without output.")
            : message.output,
        );

        setLastSuccessfulCode(
          activeRunCodeRef.current,
        );

        return;
      }

      setOutput(message.error);
      setLastSuccessfulCode(null);

      if (message.runId === undefined) {
        clearRuntimeTimeout();
        setIsRuntimeReady(false);
      }
    };

    worker.onerror = (event) => {
      clearRunTimeout();
      clearRuntimeTimeout();

      setIsRunning(false);
      setIsRuntimeReady(false);
      setLastSuccessfulCode(null);

      setOutput(
        event.message ||
          t("The Python worker failed to start."),
      );
    };

    return () => {
      clearRunTimeout();
      clearRuntimeTimeout();

      worker.terminate();
      workerRef.current = null;
    };
  }, [
    exercise.id,
    workerVersion,
    clearRunTimeout,
    clearRuntimeTimeout,
    t,
  ]);

  const runCode = () => {
    if (
      !workerRef.current ||
      !isRuntimeReady ||
      isRunning
    ) {
      return;
    }

    const runId =
      runIdRef.current + 1;

    runIdRef.current = runId;
    activeRunCodeRef.current = code;

    setIsRunning(true);
    setLastSuccessfulCode(null);
    setOutput(t("Running..."));

    workerRef.current.postMessage({
      type: "run",
      code,
      stdin,
      runId,
    });

    clearRunTimeout();

    runTimeoutRef.current = setTimeout(
      () => {
        workerRef.current?.terminate();
        workerRef.current = null;

        setIsRunning(false);
        setIsRuntimeReady(false);
        setLastSuccessfulCode(null);

        setOutput(
          t(
            "Execution stopped after 10 seconds. Check your loops and try again.",
          ),
        );

        setWorkerVersion(
          (current) => current + 1,
        );
      },
      RUN_TIMEOUT_MS,
    );
  };

  const resetCode = () => {
    setCode(starterCode);
    codeRef.current = starterCode;

    setLastSuccessfulCode(null);

    setOutput(t("Starter code restored. Run it to refresh the output."));
  };

  const checkSolution = () => {
    if (
      code.trim() === starterCode.trim()
    ) {
      toast.error(t("Change the starter code first"));

      return;
    }

    if (lastSuccessfulCode !== code) {
      toast.error(t("Run the current code successfully before checking it"));

      return;
    }

    void completeExercise(
      {
        [filename]: code,
      },
      {
        executionOutput: output,
        stdin,
      },
    );
  };

  return (
    <div
      role="region"
      aria-label={t("{exercise} Python playground", {
        exercise: exerciseTitle,
      })}
      className="grid h-full min-h-0 bg-[#07080C] text-white lg:grid-cols-2"
    >
      <section className="flex min-h-0 flex-col border-b border-[#899DFF]/30 lg:border-r lg:border-b-0">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#899DFF]/25 bg-[#10152A] px-4 py-3">
          <div className="flex items-center gap-2 font-pixel text-lg text-[#FFD400]">
            <span
              aria-hidden="true"
              className="size-2 bg-[#62FB60]"
            />

            {filename.replace(/^\//, "")}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetCode}
              className="h-9 cursor-pointer rounded-none border-[#899DFF] bg-transparent px-3 font-pixel text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C]"
            >
              <RotateCcw className="size-4" />

              <span className="hidden sm:inline">
                {t("Reset")}
              </span>
            </Button>

            <Button
              type="button"
              disabled={
                !isRuntimeReady ||
                isRunning
              }
              onClick={runCode}
              className="h-9 cursor-pointer rounded-none border-2 border-[#FFD400] bg-[#FFD400] px-4 font-pixel text-[#07080C] shadow-[3px_3px_0_0_#899DFF] hover:translate-x-px hover:translate-y-px hover:bg-[#FFD400] hover:shadow-[1px_1px_0_0_#899DFF] disabled:pointer-events-none disabled:opacity-50"
            >
              <Play className="size-4" />

              {isRunning
                ? t("Running...")
                : isRuntimeReady
                  ? t("Run")
                  : t("Loading...")}
            </Button>
          </div>
        </header>

        <label
          htmlFor="python-editor"
          className="sr-only"
        >
          {t("Python code")}
        </label>

        <textarea
          id="python-editor"
          value={code}
          onChange={(event) => {
            const nextCode =
              event.target.value;

            setCode(nextCode);
            codeRef.current = nextCode;

            setLastSuccessfulCode(null);
          }}
          spellCheck={false}
          className="min-h-72 flex-1 resize-none bg-[#090B14] p-5 font-mono text-[15px] leading-7 text-[#E7E9F8] outline-none selection:bg-[#899DFF]/35 lg:min-h-0"
        />

        <footer className="flex shrink-0 justify-end border-t border-[#899DFF]/25 bg-[#10152A] px-4 py-3">
          <CompleteExerciseButton
            isChecking={isChecking}
            isCompleting={isCompleting}
            isCompleted={isCompleted}
            onClick={checkSolution}
          />
        </footer>
      </section>

      <section className="grid min-h-64 grid-rows-[minmax(110px,30%)_1fr] bg-[#050609] lg:min-h-0">
        <div className="flex min-h-0 flex-col border-b border-[#899DFF]/25">
          <label
            htmlFor="python-stdin"
            className="flex shrink-0 items-center gap-2 bg-[#10152A] px-4 py-2 font-pixel text-sm text-[#AAB6FF]"
          >
            <Keyboard className="size-4 text-[#FFD400]" />

            {t("Program input")}
          </label>

          <textarea
            id="python-stdin"
            value={stdin}
            onChange={(event) => {
              const nextStdin =
                event.target.value;

              setStdin(nextStdin);
              stdinRef.current =
                nextStdin;

              setLastSuccessfulCode(null);
            }}
            placeholder={t("One input() value per line")}
            spellCheck={false}
            className="min-h-0 flex-1 resize-none bg-[#080A11] p-4 font-mono text-sm text-[#E7E9F8] outline-none placeholder:text-white/25"
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <header className="flex shrink-0 items-center gap-2 border-b border-[#899DFF]/25 bg-[#10152A] px-4 py-3 font-pixel text-lg text-[#AAB6FF]">
            <Terminal className="size-5 text-[#FFD400]" />

            {t("Python output")}

            <span className="ml-auto text-xs text-white/35">
              Pyodide · WebAssembly
            </span>
          </header>

          <pre
            aria-live="polite"
            className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-6 text-[#62FB60]"
          >
            {output}
          </pre>
        </div>
      </section>
    </div>
  );
}
