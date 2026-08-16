import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface RunCppBody {
  code?: unknown;
  stdin?: unknown;
}

interface Judge0Language {
  id: number;
  name: string;
}

interface Judge0Submission {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  status?: {
    id: number;
    description: string;
  } | null;
}

const MAX_CODE_LENGTH = 60_000;
const MAX_STDIN_LENGTH = 10_000;
const REQUEST_TIMEOUT_MS = 20_000;

let cachedCppLanguageId: number | null = null;

function getJudge0BaseUrl() {
  const rawUrl = process.env.JUDGE0_API_URL?.trim() || "https://ce.judge0.com";
  const url = new URL(rawUrl);

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("JUDGE0_API_URL must use HTTP or HTTPS");
  }

  return url.toString().replace(/\/$/, "");
}

function getJudge0Headers() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authToken = process.env.JUDGE0_AUTH_TOKEN?.trim();

  if (authToken) {
    headers["X-Auth-Token"] = authToken;
  }

  return headers;
}

async function resolveCppLanguageId(baseUrl: string) {
  const configuredId = Number(process.env.JUDGE0_CPP_LANGUAGE_ID);

  if (Number.isInteger(configuredId) && configuredId > 0) {
    return configuredId;
  }

  if (cachedCppLanguageId) {
    return cachedCppLanguageId;
  }

  const response = await fetch(`${baseUrl}/languages`, {
    headers: getJudge0Headers(),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error("Could not load C++ runtime information from Judge0");
  }

  const languages = (await response.json()) as Judge0Language[];
  const cppLanguages = languages
    .filter((language) => /c\+\+/i.test(language.name))
    .sort((first, second) => second.id - first.id);

  const language =
    cppLanguages.find((item) => /gcc|gnu/i.test(item.name)) ??
    cppLanguages.find((item) => /clang/i.test(item.name)) ??
    cppLanguages[0];

  if (!language) {
    throw new Error("This Judge0 instance does not provide a C++ runtime");
  }

  cachedCppLanguageId = language.id;
  return language.id;
}

function getExecutionOutput(submission: Judge0Submission) {
  const parts = [
    ["Compiler", submission.compile_output],
    ["Output", submission.stdout],
    ["Error", submission.stderr],
    ["Runtime", submission.message],
  ].filter((part): part is [string, string] => Boolean(part[1]?.trim()));

  if (parts.length === 0) {
    return submission.status?.description || "Program finished without output.";
  }

  if (parts.length === 1) {
    return parts[0][1].trimEnd();
  }

  return parts
    .map(([label, value]) => "[" + label + "]\n" + value.trimEnd())
    .join("\n\n");
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as RunCppBody;
    const code = typeof body.code === "string" ? body.code : "";
    const stdin = typeof body.stdin === "string" ? body.stdin : "";

    if (!code.trim()) {
      return NextResponse.json(
        { error: "C++ code is required" },
        { status: 400 },
      );
    }

    if (code.length > MAX_CODE_LENGTH || stdin.length > MAX_STDIN_LENGTH) {
      return NextResponse.json(
        { error: "The submitted code or input is too large" },
        { status: 413 },
      );
    }

    const baseUrl = getJudge0BaseUrl();
    const languageId = await resolveCppLanguageId(baseUrl);

    const response = await fetch(
      `${baseUrl}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: getJudge0Headers(),
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin,
          compiler_options: "-std=c++17",
          cpu_time_limit: 5,
          wall_time_limit: 10,
          memory_limit: 256_000,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || `Judge0 returned HTTP ${response.status}`);
    }

    const submission = (await response.json()) as Judge0Submission;
    const success = submission.status?.id === 3;

    return NextResponse.json({
      success,
      output: getExecutionOutput(submission),
      stdout: submission.stdout ?? null,
      stderr: submission.stderr ?? null,
      compileOutput: submission.compile_output ?? null,
      message: submission.message ?? null,
      status: submission.status?.description ?? "Unknown status",
      time: submission.time ?? null,
      memory: submission.memory ?? null,
    });
  } catch (error) {
    console.error("C++ execution error:", error);

    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return NextResponse.json(
      {
        error: isTimeout
          ? "C++ execution timed out"
          : process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "C++ runtime is currently unavailable",
      },
      { status: isTimeout ? 504 : 502 },
    );
  }
}
