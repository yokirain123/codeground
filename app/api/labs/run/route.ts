import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { runWithJudge0 } from "@/lib/labs/judge0";
import { isRunnableLabLanguage } from "@/lib/labs/types";

interface RunLabBody {
  language?: unknown;
  code?: unknown;
  stdin?: unknown;
}

const MAX_CODE_LENGTH = 60_000;
const MAX_STDIN_LENGTH = 10_000;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as RunLabBody;
    const language = body.language;
    const code = typeof body.code === "string" ? body.code : "";
    const stdin = typeof body.stdin === "string" ? body.stdin : "";

    if (!isRunnableLabLanguage(language)) {
      return NextResponse.json(
        { error: "Choose a supported programming language." },
        { status: 400 },
      );
    }

    if (!code.trim()) {
      return NextResponse.json(
        { error: "Code is required." },
        { status: 400 },
      );
    }

    if (code.length > MAX_CODE_LENGTH || stdin.length > MAX_STDIN_LENGTH) {
      return NextResponse.json(
        { error: "The submitted code or input is too large." },
        { status: 413 },
      );
    }

    const result = await runWithJudge0({ language, code, stdin });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Lab execution error:", error);

    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return NextResponse.json(
      {
        error: isTimeout
          ? "Code execution timed out."
          : process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "The code runtime is currently unavailable.",
      },
      { status: isTimeout ? 504 : 502 },
    );
  }
}
