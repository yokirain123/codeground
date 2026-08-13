"use client";

import Editor, {
  type BeforeMount,
  type Monaco,
  type OnMount,
} from "@monaco-editor/react";
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  Keyboard,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/shadcn/button";

import CompleteExerciseButton from "./CompleteExerciseButton";
import type { ExerciseData } from "./types";
import { useExerciseCompletion } from "./useExerciseCompletion";

interface CSharpCodeEditorProps {
  exerciseTitle: string;
  exercise: ExerciseData;
  onCompletionChange?: (isCompleted: boolean) => void;
}

interface RunCSharpResponse {
  success?: boolean;
  output?: string;
  stdout?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
  message?: string | null;
  status?: string;
  time?: string | null;
  memory?: number | null;
  error?: string;
}

interface CompilerDiagnostic {
  line: number;
  column: number;
  severity: "error" | "warning";
  code: string;
  message: string;
}

interface RunMetadata {
  status: string;
  time: string | null;
  memory: number | null;
}

type RunPhase = "idle" | "dirty" | "running" | "success" | "error";

const DEFAULT_OUTPUT =
  "Press Run or Ctrl/⌘ + Enter to compile and run the C# program.";
const MARKER_OWNER = "codequest-csharp-compiler";
const EDITOR_THEME = "codequest-csharp";

const defineCodeQuestTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(EDITOR_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "69728F", fontStyle: "italic" },
      { token: "keyword", foreground: "899DFF", fontStyle: "bold" },
      { token: "number", foreground: "62FB60" },
      { token: "string", foreground: "FFD400" },
      { token: "type", foreground: "FFB347" },
      { token: "type.identifier", foreground: "FFB347" },
      { token: "identifier", foreground: "E7E9F8" },
      { token: "delimiter", foreground: "AAB6FF" },
    ],
    colors: {
      "editor.background": "#090B14",
      "editor.foreground": "#E7E9F8",
      "editor.lineHighlightBackground": "#11172D",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#4F5B85",
      "editorLineNumber.activeForeground": "#FFD400",
      "editorCursor.foreground": "#FFD400",
      "editor.selectionBackground": "#899DFF45",
      "editor.inactiveSelectionBackground": "#899DFF25",
      "editorIndentGuide.background1": "#899DFF18",
      "editorIndentGuide.activeBackground1": "#899DFF55",
      "editorBracketHighlight.foreground1": "#FFD400",
      "editorBracketHighlight.foreground2": "#899DFF",
      "editorBracketHighlight.foreground3": "#62FB60",
      "editorError.foreground": "#FF6B6B",
      "editorWarning.foreground": "#FFD400",
      "editorOverviewRuler.border": "#00000000",
      "editorGutter.background": "#090B14",
      "scrollbar.shadow": "#00000000",
      "scrollbarSlider.background": "#899DFF30",
      "scrollbarSlider.hoverBackground": "#899DFF55",
      "scrollbarSlider.activeBackground": "#FFD40066",
    },
  });
};

function parseCompilerDiagnostics(output: string): CompilerDiagnostic[] {
  const diagnostics: CompilerDiagnostic[] = [];
  const pattern =
    /(?:^|\n)(?:.*?[\\/])?([^\\/\r\n]+\.cs)\s*\((\d+),(\d+)\):\s*(error|warning)\s+([A-Z]{1,4}\d+):\s*([^\r\n]+)/gi;

  for (const match of output.matchAll(pattern)) {
    diagnostics.push({
      line: Number(match[2]),
      column: Number(match[3]),
      severity: match[4].toLowerCase() === "warning" ? "warning" : "error",
      code: match[5],
      message: match[6].trim(),
    });
  }

  return diagnostics;
}

function formatMemory(memory: number | null) {
  if (memory === null) {
    return null;
  }

  if (memory >= 1024) {
    return (memory / 1024).toFixed(1) + " MB";
  }

  return memory + " KB";
}

export default function CSharpCodeEditor({
  exerciseTitle,
  exercise,
  onCompletionChange,
}: CSharpCodeEditorProps) {
  const csharpEntry = useMemo(() => {
    const entry = Object.entries(exercise.starterCode).find(([filename]) =>
      filename.toLowerCase().endsWith(".cs"),
    );

    return entry ?? ["/Program.cs", ""];
  }, [exercise.starterCode]);

  const [filename, starterCode] = csharpEntry;
  const cleanFilename = filename.replace(/^\/+/, "") || "Program.cs";
  const editorPath = "file:///codequest/" + exercise.id + "/" + cleanFilename;

  const [code, setCode] = useState(starterCode);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState(DEFAULT_OUTPUT);
  const [diagnostics, setDiagnostics] = useState<CompilerDiagnostic[]>([]);
  const [runMetadata, setRunMetadata] = useState<RunMetadata | null>(null);
  const [runPhase, setRunPhase] = useState<RunPhase>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [lastSuccessfulCode, setLastSuccessfulCode] = useState<string | null>(
    null,
  );

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const diagnosticsRef = useRef<CompilerDiagnostic[]>([]);
  const runCodeRef = useRef<() => Promise<void>>(async () => undefined);
  const activeRunRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);
  const suppressEditorChangeRef = useRef(false);

  const { completeExercise, isChecking, isCompleting, isCompleted } =
    useExerciseCompletion(onCompletionChange);

  const applyEditorDiagnostics = useCallback((items: CompilerDiagnostic[]) => {
    diagnosticsRef.current = items;
    setDiagnostics(items);

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();

    if (!editor || !monaco || !model) {
      return;
    }

    const markers = items.map((item) => {
      const lineNumber = Math.min(Math.max(item.line, 1), model.getLineCount());
      const maxColumn = model.getLineMaxColumn(lineNumber);
      const startColumn = Math.min(Math.max(item.column, 1), maxColumn);

      return {
        startLineNumber: lineNumber,
        startColumn,
        endLineNumber: lineNumber,
        endColumn: Math.min(startColumn + 1, maxColumn),
        severity:
          item.severity === "warning"
            ? monaco.MarkerSeverity.Warning
            : monaco.MarkerSeverity.Error,
        code: item.code,
        source: "C# compiler",
        message: item.message,
      };
    });

    monaco.editor.setModelMarkers(model, MARKER_OWNER, markers);
  }, []);

  const jumpToDiagnostic = useCallback((diagnostic: CompilerDiagnostic) => {
    const editor = editorRef.current;
    const model = editor?.getModel();

    if (!editor || !model) {
      return;
    }

    const lineNumber = Math.min(
      Math.max(diagnostic.line, 1),
      model.getLineCount(),
    );
    const column = Math.min(
      Math.max(diagnostic.column, 1),
      model.getLineMaxColumn(lineNumber),
    );

    editor.setPosition({ lineNumber, column });
    editor.revealLineInCenter(lineNumber);
    editor.focus();
  }, []);

  useEffect(() => {
    activeRunRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    isRunningRef.current = false;

    setCode(starterCode);
    setStdin("");
    setOutput(DEFAULT_OUTPUT);
    setRunMetadata(null);
    setRunPhase("idle");
    setIsRunning(false);
    setLastSuccessfulCode(null);
    applyEditorDiagnostics([]);

    return () => {
      activeRunRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      isRunningRef.current = false;
    };
  }, [applyEditorDiagnostics, exercise.id, starterCode]);

  const runCode = useCallback(async () => {
    const currentCode = editorRef.current?.getValue() ?? code;

    if (isRunningRef.current || !currentCode.trim()) {
      return;
    }

    const runId = activeRunRef.current + 1;
    activeRunRef.current = runId;
    isRunningRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 25_000);

    setIsRunning(true);
    setRunPhase("running");
    setRunMetadata(null);
    setLastSuccessfulCode(null);
    setOutput("Compiling and running...");
    applyEditorDiagnostics([]);

    try {
      const response = await fetch("/api/code/run/csharp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentCode, stdin }),
        signal: controller.signal,
      });

      const data = (await response
        .json()
        .catch(() => ({}))) as RunCSharpResponse;

      if (!response.ok) {
        throw new Error(data.error || "C# execution failed");
      }

      if (runId !== activeRunRef.current) {
        return;
      }

      const nextOutput =
        data.output || data.status || "Program finished without output.";
      const diagnosticSource =
        data.compileOutput || data.stderr || data.output || "";
      const nextDiagnostics = parseCompilerDiagnostics(diagnosticSource);

      setOutput(nextOutput);
      setRunMetadata({
        status: data.status || "Unknown status",
        time: data.time ?? null,
        memory: data.memory ?? null,
      });
      applyEditorDiagnostics(nextDiagnostics);

      if (data.success) {
        setRunPhase("success");
        setLastSuccessfulCode(currentCode);
      } else {
        setRunPhase("error");

        if (nextDiagnostics[0]) {
          jumpToDiagnostic(nextDiagnostics[0]);
        }
      }
    } catch (error) {
      if (runId !== activeRunRef.current) {
        return;
      }

      const wasAborted = error instanceof Error && error.name === "AbortError";
      const message = wasAborted
        ? "C# execution timed out"
        : error instanceof Error
          ? error.message
          : "C# execution failed";

      setOutput(message);
      setRunMetadata({ status: "Request failed", time: null, memory: null });
      setRunPhase("error");
      toast.error(message);
    } finally {
      window.clearTimeout(timeoutId);

      if (runId === activeRunRef.current) {
        isRunningRef.current = false;
        setIsRunning(false);

        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    }
  }, [applyEditorDiagnostics, code, jumpToDiagnostic, stdin]);

  useEffect(() => {
    runCodeRef.current = runCode;
  }, [runCode]);

  const handleEditorMount = useCallback<OnMount>(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      applyEditorDiagnostics(diagnosticsRef.current);

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => void runCodeRef.current(),
      );
    },
    [applyEditorDiagnostics],
  );

  const markCodeAsDirty = useCallback(() => {
    setLastSuccessfulCode(null);
    setRunPhase("dirty");
    setRunMetadata(null);

    if (diagnosticsRef.current.length > 0) {
      applyEditorDiagnostics([]);
    }
  }, [applyEditorDiagnostics]);

  const resetCode = () => {
    if (editorRef.current) {
      suppressEditorChangeRef.current = true;

      try {
        editorRef.current.setValue(starterCode);
      } finally {
        suppressEditorChangeRef.current = false;
      }
    }

    setCode(starterCode);
    setLastSuccessfulCode(null);
    setOutput("Starter code restored. Run it to refresh the output.");
    setRunMetadata(null);
    setRunPhase("idle");
    applyEditorDiagnostics([]);
    editorRef.current?.focus();
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Console output copied");
    } catch {
      toast.error("Could not copy console output");
    }
  };

  const status =
    runPhase === "running"
      ? {
          label: "Compiling",
          className: "border-[#899DFF]/60 bg-[#899DFF]/10 text-[#AAB6FF]",
        }
      : runPhase === "success"
        ? {
            label: "Passed",
            className: "border-[#62FB60]/60 bg-[#62FB60]/10 text-[#62FB60]",
          }
        : runPhase === "error"
          ? {
              label: "Failed",
              className: "border-[#FF6B6B]/60 bg-[#FF6B6B]/10 text-[#FF8E8E]",
            }
          : runPhase === "dirty"
            ? {
                label: "Not run",
                className: "border-[#FFD400]/50 bg-[#FFD400]/10 text-[#FFD400]",
              }
            : {
                label: "Ready",
                className: "border-white/15 bg-white/5 text-white/45",
              };

  const memoryLabel = formatMemory(runMetadata?.memory ?? null);

  return (
    <div
      role="region"
      aria-label={exerciseTitle + " C# playground"}
      className="grid h-full min-h-0 bg-[#07080C] text-white lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]"
    >
      <section className="flex min-h-0 flex-col border-b border-[#899DFF]/30 lg:border-r lg:border-b-0">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#899DFF]/25 bg-[#10152A] px-3 pt-3">
          <div className="flex min-w-0 items-center self-end border border-b-0 border-[#899DFF]/40 bg-[#090B14] px-3 py-2 font-pixel text-base text-[#FFD400]">
            <Code2 className="mr-2 size-4 shrink-0 text-[#899DFF]" />
            <span className="truncate">{cleanFilename}</span>
            <span
              aria-hidden="true"
              className={
                "ml-2 size-1.5 " +
                (runPhase === "dirty" ? "bg-[#FFD400]" : "bg-[#62FB60]")
              }
            />
          </div>

          <div className="mb-2 flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isRunning}
              onClick={resetCode}
              className="h-9 cursor-pointer rounded-none border-[#899DFF] bg-transparent px-3 font-pixel text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C] disabled:pointer-events-none disabled:opacity-45"
            >
              <RotateCcw className="size-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </header>

        <div className="relative min-h-[420px] flex-1 bg-[#090B14] lg:min-h-0">
          <Editor
            height="100%"
            language="csharp"
            path={editorPath}
            value={code}
            theme={EDITOR_THEME}
            beforeMount={defineCodeQuestTheme}
            onMount={handleEditorMount}
            onChange={(value) => {
              setCode(value ?? "");

              if (!suppressEditorChangeRef.current) {
                markCodeAsDirty();
              }
            }}
            loading={
              <div className="flex h-full items-center justify-center gap-3 bg-[#090B14] font-pixel text-[#899DFF]">
                <Loader2 className="size-5 animate-spin text-[#FFD400]" />
                Loading C# editor...
              </div>
            }
            options={{
              ariaLabel: exerciseTitle + " C# code editor",
              automaticLayout: true,
              autoIndent: "full",
              bracketPairColorization: { enabled: true },
              cursorBlinking: "phase",
              cursorStyle: "block",
              fixedOverflowWidgets: true,
              folding: true,
              fontFamily:
                "JetBrains Mono, SFMono-Regular, Consolas, Liberation Mono, monospace",
              fontLigatures: false,
              fontSize: 15,
              glyphMargin: true,
              guides: {
                bracketPairs: true,
                indentation: true,
                highlightActiveIndentation: true,
              },
              insertSpaces: true,
              lineHeight: 24,
              lineNumbersMinChars: 3,
              minimap: { enabled: false },
              mouseWheelZoom: true,
              overviewRulerBorder: false,
              overviewRulerLanes: 0,
              padding: { top: 16, bottom: 16 },
              quickSuggestions: false,
              renderLineHighlight: "all",
              roundedSelection: false,
              scrollbar: {
                horizontalScrollbarSize: 10,
                useShadows: false,
                verticalScrollbarSize: 10,
              },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              tabSize: 4,
              wordWrap: "off",
            }}
          />
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#899DFF]/25 bg-[#10152A] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 font-mono text-[11px] text-white/35">
            <Keyboard className="size-3.5 shrink-0 text-[#899DFF]" />
            <span className="hidden sm:inline">Ctrl/⌘ + Enter to run</span>
            <span className="hidden h-3 border-l border-white/15 sm:block" />
            <span>C#</span>
            <span>UTF-8</span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              type="button"
              aria-label="Run C# code"
              title="Run C# code (Ctrl/Command + Enter)"
              disabled={isRunning || !code.trim()}
              onClick={() => void runCode()}
              className="h-10 cursor-pointer rounded-none border-2 border-[#FFD400] bg-[#FFD400] px-5 font-pixel text-lg text-[#07080C] shadow-[4px_4px_0_0_#FF8C00] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#FFD400] hover:shadow-[2px_2px_0_0_#FF8C00] disabled:pointer-events-none disabled:opacity-50"
            >
              {isRunning ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
              {isRunning ? "Running..." : "Run"}
            </Button>

            <CompleteExerciseButton
              isChecking={isChecking}
              isCompleting={isCompleting}
              isCompleted={isCompleted}
              onClick={() => {
                if (code.trim() === starterCode.trim()) {
                  toast.error("Change the starter code first");
                  return;
                }

                if (lastSuccessfulCode !== code) {
                  toast.error(
                    "Run the current code successfully before checking it",
                  );
                  return;
                }

                void completeExercise(
                  { [filename]: code },
                  { executionOutput: output, stdin },
                );
              }}
            />
          </div>
        </footer>
      </section>

      <section className="grid min-h-64 grid-rows-[minmax(116px,30%)_1fr] bg-[#050609] lg:min-h-0">
        <div className="flex min-h-0 flex-col border-b border-[#899DFF]/25">
          <label
            htmlFor="csharp-stdin"
            className="flex shrink-0 items-center gap-2 bg-[#10152A] px-4 py-2 font-pixel text-sm text-[#AAB6FF]"
          >
            <Keyboard className="size-4 text-[#FFD400]" />
            Program input
            <span className="ml-auto font-mono text-[10px] text-white/25">
              STDIN
            </span>
          </label>

          <textarea
            id="csharp-stdin"
            value={stdin}
            onChange={(event) => {
              setStdin(event.target.value);
              markCodeAsDirty();
            }}
            placeholder="One Console.ReadLine() value per line"
            spellCheck={false}
            className="min-h-0 flex-1 resize-none bg-[#080A11] p-4 font-mono text-sm text-[#E7E9F8] outline-none placeholder:text-white/25 selection:bg-[#899DFF]/35"
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <header className="flex shrink-0 items-center gap-2 border-b border-[#899DFF]/25 bg-[#10152A] px-4 py-3">
            <Terminal className="size-5 text-[#FFD400]" />
            <span className="font-pixel text-lg text-[#AAB6FF]">Console</span>

            <div className="ml-auto flex items-center gap-2">
              <span
                className={
                  "border px-2 py-1 font-mono text-[10px] uppercase tracking-wider " +
                  status.className
                }
              >
                {status.label}
              </span>

              <button
                type="button"
                onClick={() => void copyOutput()}
                aria-label="Copy console output"
                title="Copy output"
                className="flex size-7 cursor-pointer items-center justify-center border border-[#899DFF]/30 text-[#899DFF] transition-colors hover:border-[#FFD400] hover:text-[#FFD400]"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </header>

          {runMetadata && (
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#899DFF]/15 bg-[#0A0D18] px-4 py-2 font-mono text-[11px] text-white/35">
              <span>{runMetadata.status}</span>
              {runMetadata.time && <span>{runMetadata.time}s</span>}
              {memoryLabel && <span>{memoryLabel}</span>}
              <span className="ml-auto text-[#899DFF]/55">Judge0 sandbox</span>
            </div>
          )}

          {diagnostics.length > 0 && (
            <div className="max-h-40 shrink-0 overflow-y-auto border-b border-[#FF6B6B]/25 bg-[#120B10]">
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2 font-pixel text-sm text-[#FF8E8E]">
                <AlertTriangle className="size-4" />
                Problems ({diagnostics.length})
              </div>

              {diagnostics.map((diagnostic, index) => (
                <button
                  key={
                    diagnostic.code +
                    "-" +
                    diagnostic.line +
                    "-" +
                    diagnostic.column +
                    "-" +
                    index
                  }
                  type="button"
                  onClick={() => jumpToDiagnostic(diagnostic)}
                  className="flex w-full cursor-pointer items-start gap-3 border-b border-white/5 px-4 py-2 text-left font-mono text-xs transition-colors last:border-0 hover:bg-[#899DFF]/10"
                >
                  <span
                    className={
                      diagnostic.severity === "warning"
                        ? "text-[#FFD400]"
                        : "text-[#FF6B6B]"
                    }
                  >
                    {diagnostic.code}
                  </span>
                  <span className="min-w-0 flex-1 text-white/65">
                    {diagnostic.message}
                  </span>
                  <span className="shrink-0 text-[#899DFF]/55">
                    {diagnostic.line}:{diagnostic.column}
                  </span>
                </button>
              ))}
            </div>
          )}

          <pre
            aria-live="polite"
            className={
              "min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-6 " +
              (runPhase === "success"
                ? "text-[#DDFCDD]"
                : runPhase === "error"
                  ? "text-[#FFB2A0]"
                  : "text-[#E7E9F8]")
            }
          >
            {output}
          </pre>

          {runPhase === "success" && (
            <div className="flex shrink-0 items-center gap-2 border-t border-[#62FB60]/20 bg-[#62FB60]/5 px-4 py-2 font-mono text-xs text-[#62FB60]">
              <CheckCircle2 className="size-4" />
              Program finished successfully
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
