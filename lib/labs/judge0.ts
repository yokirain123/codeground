import "server-only";

import type { RunnableLabLanguage } from "./types";

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

export interface Judge0RunResult {
  success: boolean;
  output: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: string;
  time: string | null;
  memory: number | null;
}

const REQUEST_TIMEOUT_MS = 25_000;
const cachedLanguageIds = new Map<RunnableLabLanguage, number>();

const configuredLanguageVariables: Record<RunnableLabLanguage, string> = {
  javascript: "JUDGE0_JAVASCRIPT_LANGUAGE_ID",
  python: "JUDGE0_PYTHON_LANGUAGE_ID",
  csharp: "JUDGE0_CSHARP_LANGUAGE_ID",
  cpp: "JUDGE0_CPP_LANGUAGE_ID",
};

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

function chooseLanguage(
  language: RunnableLabLanguage,
  languages: Judge0Language[],
) {
  const candidates = languages.filter((item) => {
    if (language === "javascript") {
      return /javascript|node\.js|nodejs/i.test(item.name);
    }

    if (language === "python") {
      return /^python/i.test(item.name);
    }

    if (language === "csharp") {
      return /^c#/i.test(item.name);
    }

    return /^c\+\+/i.test(item.name);
  });

  if (language === "javascript") {
    return (
      candidates.find((item) => /node\.js|nodejs/i.test(item.name)) ??
      candidates[0]
    );
  }

  if (language === "python") {
    return candidates.find((item) => /python \(3|3\./i.test(item.name)) ?? candidates[0];
  }

  if (language === "csharp") {
    return (
      candidates.find((item) => /\.net/i.test(item.name)) ??
      candidates.find((item) => /mono/i.test(item.name)) ??
      candidates[0]
    );
  }

  return (
    candidates.find((item) => /g\+\+|gcc/i.test(item.name)) ?? candidates[0]
  );
}

async function resolveLanguageId(
  baseUrl: string,
  language: RunnableLabLanguage,
) {
  const configuredId = Number(
    process.env[configuredLanguageVariables[language]],
  );

  if (Number.isInteger(configuredId) && configuredId > 0) {
    return configuredId;
  }

  const cachedId = cachedLanguageIds.get(language);

  if (cachedId) {
    return cachedId;
  }

  const response = await fetch(`${baseUrl}/languages`, {
    headers: getJudge0Headers(),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error("Could not load runtime information from Judge0");
  }

  const languages = (await response.json()) as Judge0Language[];
  const selected = chooseLanguage(language, languages);

  if (!selected) {
    throw new Error(`This Judge0 instance does not provide ${language}`);
  }

  cachedLanguageIds.set(language, selected.id);
  return selected.id;
}

function formatOutput(submission: Judge0Submission) {
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
    .map(([label, value]) => `[${label}]\n${value.trimEnd()}`)
    .join("\n\n");
}

export async function runWithJudge0({
  language,
  code,
  stdin = "",
}: {
  language: RunnableLabLanguage;
  code: string;
  stdin?: string;
}): Promise<Judge0RunResult> {
  const baseUrl = getJudge0BaseUrl();
  const languageId = await resolveLanguageId(baseUrl, language);
  const response = await fetch(
    `${baseUrl}/submissions?base64_encoded=false&wait=true`,
    {
      method: "POST",
      headers: getJudge0Headers(),
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin,
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

  return {
    success: submission.status?.id === 3,
    output: formatOutput(submission),
    stdout: submission.stdout ?? "",
    stderr: submission.stderr ?? "",
    compileOutput: submission.compile_output ?? "",
    message: submission.message ?? "",
    status: submission.status?.description ?? "Unknown status",
    time: submission.time ?? null,
    memory: submission.memory ?? null,
  };
}
