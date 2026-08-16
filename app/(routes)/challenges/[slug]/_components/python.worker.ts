import { loadPyodide, version as pyodideVersion } from "pyodide";

interface RunRequest {
  type: "run";
  code: string;
  stdin: string;
  runId: number;
}

type WorkerResponse =
  | { type: "loading"; message: string }
  | { type: "ready" }
  | { type: "result"; output: string; runId: number }
  | { type: "error"; error: string; runId?: number };

interface WorkerScope {
  addEventListener(
    type: "message",
    listener: (event: MessageEvent<RunRequest>) => void,
  ): void;
  postMessage(message: WorkerResponse): void;
}

const workerScope = globalThis as unknown as WorkerScope;

workerScope.postMessage({
  type: "loading",
  message: "Downloading Python runtime...",
});

const pyodidePromise = loadPyodide({
  indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
});

void pyodidePromise
  .then(() => workerScope.postMessage({ type: "ready" }))
  .catch((error: unknown) => {
    workerScope.postMessage({
      type: "error",
      error:
        error instanceof Error
          ? `Failed to load Python: ${error.message}`
          : "Failed to load the Python runtime",
    });
  });

workerScope.addEventListener("message", (event) => {
  if (event.data.type !== "run") {
    return;
  }

  const { code, stdin, runId } = event.data;

  void (async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const stdinLines = stdin.replaceAll("\r\n", "\n").split("\n");

    try {
      const pyodide = await pyodidePromise;

      await pyodide.loadPackagesFromImports(code);

      pyodide.setStdin({
        stdin: () => stdinLines.shift() ?? null,
        autoEOF: true,
      });
      pyodide.setStdout({
        batched: (message) => stdout.push(message.replace(/\n$/, "")),
      });
      pyodide.setStderr({
        batched: (message) => stderr.push(message.replace(/\n$/, "")),
      });

      const globals = pyodide.runPython("dict()");

      try {
        const result = await pyodide.runPythonAsync(code, { globals });
        const expressionResult = result == null ? "" : String(result);

        if (
          result &&
          typeof result === "object" &&
          "destroy" in result &&
          typeof result.destroy === "function"
        ) {
          result.destroy();
        }

        const output = [...stdout, ...stderr, expressionResult]
          .filter(Boolean)
          .join("\n");

        workerScope.postMessage({
          type: "result",
          output: output || "Program finished without output.",
          runId,
        });
      } finally {
        globals.destroy();
      }
    } catch (error) {
      workerScope.postMessage({
        type: "error",
        error:
          error instanceof Error ? error.message : "Python execution failed",
        runId,
      });
    }
  })();
});
