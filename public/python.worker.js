const PYODIDE_BASE_URL = new URL(
  "/pyodide/",
  self.location.origin,
).href;

let pyodide = null;
let bootError = null;
let isExecuting = false;

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function initializePython() {
  try {
    self.postMessage({
      type: "loading",
      message: "Loading Python module...",
    });

    const { loadPyodide } = await import(
      `${PYODIDE_BASE_URL}pyodide.mjs`
    );

    self.postMessage({
      type: "loading",
      message: "Starting Python runtime...",
    });

    pyodide = await loadPyodide({
      indexURL: PYODIDE_BASE_URL,
    });

    self.postMessage({
      type: "ready",
    });

    return pyodide;
  } catch (error) {
    bootError = getErrorMessage(error);

    self.postMessage({
      type: "error",
      error: `Failed to load Python: ${bootError}`,
    });

    return null;
  }
}

const pyodidePromise = initializePython();

self.addEventListener("message", async (event) => {
  if (event.data?.type !== "run") {
    return;
  }

  const {
    code,
    stdin = "",
    runId,
  } = event.data;

  if (isExecuting) {
    self.postMessage({
      type: "error",
      error: "Python is already running.",
      runId,
    });

    return;
  }

  isExecuting = true;

  try {
    const runtime = await pyodidePromise;

    if (!runtime) {
      throw new Error(
        bootError ?? "Python runtime is unavailable",
      );
    }

    const stdout = [];
    const stderr = [];

    const stdinLines = stdin
      ? stdin
          .replaceAll("\r\n", "\n")
          .split("\n")
      : [];

    runtime.setStdin({
      stdin() {
        return stdinLines.shift() ?? null;
      },
      autoEOF: true,
    });

    runtime.setStdout({
      batched(message) {
        stdout.push(message);
      },
    });

    runtime.setStderr({
      batched(message) {
        stderr.push(message);
      },
    });

    const globals = runtime.runPython("dict()");

    try {
      const result =
        await runtime.runPythonAsync(code, {
          globals,
        });

      let expressionResult = "";

      if (result !== null && result !== undefined) {
        expressionResult = String(result);
      }

      if (
        result &&
        typeof result === "object" &&
        typeof result.destroy === "function"
      ) {
        result.destroy();
      }

      const output = [
        ...stdout,
        ...stderr,
        expressionResult,
      ]
        .filter(Boolean)
        .join("\n")
        .trim();

      self.postMessage({
        type: "result",
        output:
          output ||
          "Program finished without output.",
        runId,
      });
    } finally {
      globals.destroy();
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      error: getErrorMessage(error),
      runId,
    });
  } finally {
    isExecuting = false;
  }
});