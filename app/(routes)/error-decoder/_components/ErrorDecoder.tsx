"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Code2,
  Loader2,
  SearchCode,
  Terminal,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/shadcn/button";
import {
  labLanguageLabels,
  labLanguages,
  type LabLanguage,
} from "@/lib/labs/types";

interface DecoderResult {
  headline: string;
  plainExplanation: string;
  likelyCause: string;
  errorLine: number | null;
  fixes: string[];
  fixedCode: string;
  notes: string[];
}

interface ErrorResponse {
  error?: string;
}

const DEFAULT_CODE = `const user = {
  name: "Ada",
};

console.log(user.profile.bio);`;

const DEFAULT_ERROR =
  "TypeError: Cannot read properties of undefined (reading 'bio') at line 5";

function HighlightedCode({
  code,
  errorLine,
}: {
  code: string;
  errorLine: number | null;
}) {
  return (
    <pre className="max-h-[32rem] overflow-auto bg-[#090B14] py-4 font-mono text-sm leading-6">
      {code.split("\n").map((line, index) => {
        const lineNumber = index + 1;
        const active = lineNumber === errorLine;

        return (
          <div
            key={`${lineNumber}-${line}`}
            className={`flex min-w-max px-4 ${
              active
                ? "border-l-2 border-[#FF7373] bg-[#FF7373]/12 text-white"
                : "border-l-2 border-transparent text-white/65"
            }`}
          >
            <span className={`mr-5 w-8 select-none text-right ${active ? "text-[#FF7373]" : "text-white/20"}`}>
              {lineNumber}
            </span>
            <code>{line || " "}</code>
          </div>
        );
      })}
    </pre>
  );
}

export default function ErrorDecoder() {
  const { t, formatNumber, translateMessage } = useI18n();
  const router = useRouter();
  const [language, setLanguage] = useState<LabLanguage>("javascript");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [errorMessage, setErrorMessage] = useState(DEFAULT_ERROR);
  const [result, setResult] = useState<DecoderResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("codequest:error-decoder:draft");
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        language?: unknown;
        code?: unknown;
        errorMessage?: unknown;
      };

      if (
        typeof draft.language === "string" &&
        (labLanguages as readonly string[]).includes(draft.language)
      ) {
        setLanguage(draft.language as LabLanguage);
      }
      if (typeof draft.code === "string") setCode(draft.code);
      if (typeof draft.errorMessage === "string") {
        setErrorMessage(draft.errorMessage);
      }
    } catch {
      window.localStorage.removeItem("codequest:error-decoder:draft");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        "codequest:error-decoder:draft",
        JSON.stringify({ language, code, errorMessage }),
      );
    }, 400);

    return () => window.clearTimeout(timer);
  }, [code, errorMessage, language]);

  const decodeError = async () => {
    if (isLoading || !code.trim() || !errorMessage.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/labs/error-decoder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, errorMessage }),
      });
      const data = (await response.json().catch(() => ({}))) as
        | DecoderResult
        | ErrorResponse;

      if (!response.ok || "error" in data) {
        throw new Error(
          (data as ErrorResponse).error || t("Could not decode the error."),
        );
      }

      setResult(data as DecoderResult);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? translateMessage(error.message)
          : t("Could not decode the error."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyFixedCode = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.fixedCode);
      toast.success(t("Fixed code copied"));
    } catch {
      toast.error(t("Could not copy the code"));
    }
  };

  const copyAndOpenPlayground = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.fixedCode);
      toast.success(t("Fixed code copied. Paste it into the Playground."));
    } catch {
      toast.error(t("Playground opened, but the code could not be copied."));
    }

    router.push("/playground");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.78fr)]">
        <section className="min-w-0 border-2 border-[#899DFF]/35 bg-[#10152A] shadow-[6px_6px_0_#020307]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-4">
            <div className="flex items-center gap-2 font-pixel text-xl text-white">
              <Code2 className="size-5 text-[#FFD400]" /> {t("Broken code")}
            </div>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as LabLanguage)}
              aria-label={t("Programming language")}
              className="h-10 cursor-pointer border border-[#899DFF]/45 bg-[#07080C] px-3 font-pixel text-base text-[#FFD400] outline-none focus:border-[#FFD400]"
            >
              {labLanguages.map((item) => (
                <option key={item} value={item}>
                  {labLanguageLabels[item]}
                </option>
              ))}
            </select>
          </div>

          <label htmlFor="decoder-code" className="sr-only">
            {t("Code with an error")}
          </label>
          <textarea
            id="decoder-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setResult(null);
            }}
            spellCheck={false}
            className="min-h-[25rem] w-full resize-y bg-[#090B14] p-5 font-mono text-sm leading-7 text-[#E7E9F8] outline-none selection:bg-[#899DFF]/35"
          />

          <div className="border-t border-white/10 p-4">
            <label
              htmlFor="decoder-error"
              className="flex items-center gap-2 font-pixel text-sm text-[#FF9B9B]"
            >
              <Terminal className="size-4" /> {t("Exact error message")}
            </label>
            <textarea
              id="decoder-error"
              value={errorMessage}
              onChange={(event) => {
                setErrorMessage(event.target.value);
                setResult(null);
              }}
              spellCheck={false}
              className="mt-2 min-h-28 w-full resize-y border border-[#FF7373]/30 bg-[#07080C] p-3 font-mono text-sm leading-6 text-[#FFB1B1] outline-none focus:border-[#FF7373]"
            />
          </div>

          <div className="flex justify-end border-t border-white/10 p-4">
            <Button
              type="button"
              onClick={() => void decodeError()}
              disabled={isLoading || !code.trim() || !errorMessage.trim()}
              className="h-11 cursor-pointer rounded-none border-2 border-[#FFD400] bg-[#FFD400] px-5 font-pixel text-lg text-[#07080C] shadow-[4px_4px_0_#899DFF] hover:translate-x-px hover:translate-y-px hover:bg-[#FFD400] hover:shadow-[2px_2px_0_#899DFF]"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <SearchCode className="size-5" />
              )}
              {isLoading ? t("Decoding...") : t("Decode error")}
            </Button>
          </div>
        </section>

        <section className="min-w-0 border-2 border-[#899DFF]/35 bg-[#10152A] shadow-[6px_6px_0_#020307]">
          {!result ? (
            <div className="flex min-h-[38rem] flex-col items-center justify-center p-8 text-center">
              <div className="flex size-20 items-center justify-center border-2 border-[#899DFF]/35 bg-[#899DFF]/5">
                {isLoading ? (
                  <Loader2 className="size-9 animate-spin text-[#FFD400]" />
                ) : (
                  <Wrench className="size-9 text-[#899DFF]" />
                )}
              </div>
              <h2 className="mt-5 font-pixel text-3xl text-white">
                {isLoading
                  ? t("Reading the stack trace")
                  : t("Diagnostic output")}
              </h2>
              <p className="mt-3 max-w-sm font-sans leading-6 text-white/45">
                {isLoading
                  ? t(
                      "Tracing the likely cause and preparing the smallest useful fix.",
                    )
                  : t(
                      "Your explanation, suspicious line and corrected code will appear here.",
                    )}
              </p>
            </div>
          ) : (
            <div>
              <div className="border-b border-white/10 p-5">
                <p className="font-pixel text-xs uppercase tracking-[0.2em] text-[#899DFF]">
                  {t("Diagnosis")}
                </p>
                <h2 className="mt-2 font-pixel text-3xl text-[#FFD400]">
                  {result.headline}
                </h2>
                <p className="mt-3 font-sans leading-7 text-white/65">
                  {result.plainExplanation}
                </p>
              </div>

              <div className="space-y-5 p-5">
                <div className="border border-[#FF7373]/30 bg-[#FF7373]/10 p-4">
                  <p className="flex items-center gap-2 font-pixel text-[#FF9B9B]">
                    <AlertTriangle className="size-4" /> {t("Likely cause")}
                    {result.errorLine
                      ? t(" · line {line}", {
                          line: formatNumber(result.errorLine),
                        })
                      : ""}
                  </p>
                  <p className="mt-2 font-sans text-sm leading-6 text-white/60">
                    {result.likelyCause}
                  </p>
                </div>

                <div>
                  <p className="font-pixel text-sm uppercase tracking-[0.16em] text-[#899DFF]">
                    {t("Recommended fixes")}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {result.fixes.map((fix) => (
                      <li key={fix} className="flex gap-3 font-sans text-sm leading-6 text-white/60">
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#62FB60]" />
                        {fix}
                      </li>
                    ))}
                  </ul>
                </div>

                {result.errorLine ? (
                  <div className="overflow-hidden border border-white/10">
                    <p className="border-b border-white/10 bg-[#0B0E18] px-4 py-2 font-pixel text-sm text-[#AAB6FF]">
                      {t("Suspicious line")}
                    </p>
                    <HighlightedCode code={code} errorLine={result.errorLine} />
                  </div>
                ) : null}

                <div className="overflow-hidden border border-[#62FB60]/25">
                  <div className="flex items-center justify-between border-b border-white/10 bg-[#0B0E18] px-4 py-2">
                    <p className="font-pixel text-sm text-[#62FB60]">
                      {t("Fixed code")}
                    </p>
                    <button
                      type="button"
                      onClick={() => void copyFixedCode()}
                      className="cursor-pointer text-white/35 hover:text-[#FFD400]"
                      aria-label={t("Copy fixed code")}
                    >
                      <ClipboardCopy className="size-4" />
                    </button>
                  </div>
                  <pre className="max-h-80 overflow-auto whitespace-pre bg-[#090B14] p-4 font-mono text-xs leading-6 text-white/70">
                    {result.fixedCode}
                  </pre>
                </div>

                <Button
                  type="button"
                  onClick={() => void copyAndOpenPlayground()}
                  className="w-full cursor-pointer rounded-none border-2 border-[#FFD400] bg-[#FFD400] font-pixel text-[#07080C] shadow-[3px_3px_0_#899DFF] hover:bg-[#FFD400]"
                >
                  <ClipboardCopy className="size-4" /> {t("Copy & open Playground")}
                </Button>

                {result.notes.length > 0 ? (
                  <ul className="border-t border-white/10 pt-4 font-sans text-xs leading-5 text-white/35">
                    {result.notes.map((note) => (
                      <li key={note}>• {note}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
