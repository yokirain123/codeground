import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface RunPythonBody {
  code?: unknown;
  stdin?: unknown;
}

interface Judge0Response {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  exit_code?: number | null;
  status?: {
    id: number;
    description: string;
  };
}

const MAX_CODE_LENGTH = 100_000;
const MAX_STDIN_LENGTH = 10_000;
const REQUEST_TIMEOUT_MS = 15_000;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body =
      (await request.json()) as RunPythonBody;

    const code =
      typeof body.code === "string"
        ? body.code
        : "";

    const stdin =
      typeof body.stdin === "string"
        ? body.stdin
        : "";

    if (!code.trim()) {
      return NextResponse.json(
        { error: "Python code is required" },
        { status: 400 },
      );
    }

    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: "Python code is too large" },
        { status: 413 },
      );
    }

    if (stdin.length > MAX_STDIN_LENGTH) {
      return NextResponse.json(
        { error: "Program input is too large" },
        { status: 413 },
      );
    }

    const judge0Url =
      process.env.JUDGE0_API_URL ??
      "https://ce.judge0.com";

    const languageId = Number(
      process.env.JUDGE0_PYTHON_LANGUAGE_ID ??
        "109",
    );

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (process.env.JUDGE0_AUTH_TOKEN) {
      headers["X-Auth-Token"] =
        process.env.JUDGE0_AUTH_TOKEN;
    }

    if (process.env.JUDGE0_RAPID_API_KEY) {
      headers["X-RapidAPI-Key"] =
        process.env.JUDGE0_RAPID_API_KEY;
    }

    if (process.env.JUDGE0_RAPID_API_HOST) {
      headers["X-RapidAPI-Host"] =
        process.env.JUDGE0_RAPID_API_HOST;
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(
        `${judge0Url}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            language_id: languageId,
            source_code: code,
            stdin,
          }),
          cache: "no-store",
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    const data =
      (await response.json()) as Judge0Response;

    if (!response.ok) {
      console.error(
        "Judge0 execution error:",
        data,
      );

      return NextResponse.json(
        {
          error:
            data.message ??
            "Python execution service rejected the request",
        },
        { status: 502 },
      );
    }

    const stdout = data.stdout ?? "";
    const stderr = data.stderr ?? "";
    const compileOutput =
      data.compile_output ?? "";

    const output = [
      stdout,
      stderr,
      compileOutput,
      data.message ?? "",
    ]
      .filter(Boolean)
      .join("\n")
      .trim();

    const success =
      data.status?.id === 3 &&
      (data.exit_code === 0 ||
        data.exit_code === null ||
        data.exit_code === undefined);

    return NextResponse.json({
      success,
      output:
        output ||
        "Program finished without output.",
      stdout,
      stderr,
      exitCode: data.exit_code ?? null,
      status:
        data.status?.description ?? "Unknown",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return NextResponse.json(
        {
          error:
            "Python execution exceeded the time limit",
        },
        { status: 504 },
      );
    }

    console.error(
      "Python execution route error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Python execution service is unavailable",
      },
      { status: 500 },
    );
  }
}