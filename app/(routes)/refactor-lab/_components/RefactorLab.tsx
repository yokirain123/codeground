"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ClipboardCopy,
  Code2,
  Gauge,
  Loader2,
  RefreshCw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/shadcn/button";
import {
  labLanguageLabels,
  labLanguages,
  type LabLanguage,
} from "@/lib/labs/types";

interface RefactorChange {
  title: string;
  category:
    | "readability"
    | "duplication"
    | "structure"
    | "performance"
    | "safety"
    | "naming";
  explanation: string;
  before: string;
  after: string;
}

interface RefactorResult {
  summary: string;
  scoreBefore: number;
  scoreAfter: number;
  refactoredCode: string;
  changes: RefactorChange[];
  warnings: string[];
}

interface ErrorResponse {
  error?: string;
}

const DEFAULT_CODE = `function getUserLabel(user) {
  let result = "";

  if (user.isAdmin === true) {
    result = user.name + " (admin)";
  } else {
    result = user.name + " (member)";
  }

  console.log("Created label: " + result);
  return result;
}`;

const categoryColors: Record<RefactorChange["category"], string> = {
  readability: "border-[#899DFF]/45 text-[#AAB6FF]",
  duplication: "border-[#FFB347]/45 text-[#FFCB7D]",
  structure: "border-[#62FB60]/45 text-[#9BFFB5]",
  performance: "border-[#FFD400]/45 text-[#FFD400]",
  safety: "border-[#FF7373]/45 text-[#FF9B9B]",
  naming: "border-[#D68CFF]/45 text-[#DDA5FF]",
};

export default function RefactorLab() {
  const router = useRouter();
  const [language, setLanguage] = useState<LabLanguage>("javascript");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [goal, setGoal] = useState(
    "Improve readability and remove unnecessary repetition.",
  );
  const [result, setResult] = useState<RefactorResult | null>(null);
  const [workingCode, setWorkingCode] = useState(DEFAULT_CODE);
  const [appliedChanges, setAppliedChanges] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("codequest:refactor-lab:draft");
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        language?: unknown;
        code?: unknown;
        goal?: unknown;
      };

      if (
        typeof draft.language === "string" &&
        (labLanguages as readonly string[]).includes(draft.language)
      ) {
        setLanguage(draft.language as LabLanguage);
      }
      if (typeof draft.code === "string") {
        setCode(draft.code);
        setWorkingCode(draft.code);
      }
      if (typeof draft.goal === "string") setGoal(draft.goal);
    } catch {
      window.localStorage.removeItem("codequest:refactor-lab:draft");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        "codequest:refactor-lab:draft",
        JSON.stringify({ language, code, goal }),
      );
    }, 400);

    return () => window.clearTimeout(timer);
  }, [code, goal, language]);

  const appliedCount = appliedChanges.size;
  const availableChangeCount = useMemo(
    () =>
      result?.changes.filter(
        (change, index) =>
          !appliedChanges.has(index) && workingCode.includes(change.before),
      ).length ?? 0,
    [appliedChanges, result, workingCode],
  );

  const analyzeCode = async () => {
    if (isLoading || !code.trim()) return;
    setIsLoading(true);
    setResult(null);
    setAppliedChanges(new Set());

    try {
      const response = await fetch("/api/labs/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, goal }),
      });
      const data = (await response.json().catch(() => ({}))) as
        | RefactorResult
        | ErrorResponse;

      if (!response.ok || "error" in data) {
        throw new Error((data as ErrorResponse).error || "Could not refactor the code.");
      }

      const nextResult = data as RefactorResult;
      setResult(nextResult);
      setWorkingCode(code);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not refactor the code.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyChange = (change: RefactorChange, index: number) => {
    if (appliedChanges.has(index)) return;

    if (!workingCode.includes(change.before)) {
      toast.error("This edit overlaps a change that was already applied.");
      return;
    }

    setWorkingCode((current) => current.replace(change.before, change.after));
    setAppliedChanges((current) => new Set(current).add(index));
    toast.success(`Applied: ${change.title}`);
  };

  const applyFullRefactor = () => {
    if (!result) return;
    setWorkingCode(result.refactoredCode);
    setAppliedChanges(new Set(result.changes.map((_, index) => index)));
    toast.success("Full refactor applied to the working copy");
  };

  const resetWorkingCopy = () => {
    setWorkingCode(code);
    setAppliedChanges(new Set());
  };

  const useWorkingCopyAsInput = () => {
    setCode(workingCode);
    setResult(null);
    setAppliedChanges(new Set());
    toast.success("Working copy moved to the input editor");
  };

  const copyWorkingCode = async () => {
    try {
      await navigator.clipboard.writeText(workingCode);
      toast.success("Working code copied");
    } catch {
      toast.error("Could not copy the code");
    }
  };

  const copyAndOpenPlayground = async () => {
    try {
      await navigator.clipboard.writeText(workingCode);
      toast.success("Code copied. Paste it into the Playground.");
    } catch {
      toast.error("Playground opened, but the code could not be copied.");
    }

    router.push("/playground");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
      <section className="border-2 border-[#899DFF]/35 bg-[#10152A] shadow-[6px_6px_0_#020307]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-4">
          <div className="flex items-center gap-2 font-pixel text-xl text-white">
            <Code2 className="size-5 text-[#FFD400]" /> Source code
          </div>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as LabLanguage)}
            aria-label="Programming language"
            className="h-10 cursor-pointer border border-[#899DFF]/45 bg-[#07080C] px-3 font-pixel text-base text-[#FFD400] outline-none focus:border-[#FFD400]"
          >
            {labLanguages.map((item) => (
              <option key={item} value={item}>
                {labLanguageLabels[item]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <textarea
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setWorkingCode(event.target.value);
              setResult(null);
            }}
            spellCheck={false}
            aria-label="Code to refactor"
            className="min-h-[26rem] resize-y bg-[#090B14] p-5 font-mono text-sm leading-7 text-[#E7E9F8] outline-none selection:bg-[#899DFF]/35"
          />

          <div className="border-t border-white/10 p-5 lg:border-t-0 lg:border-l">
            <label
              htmlFor="refactor-goal"
              className="font-pixel text-sm uppercase tracking-[0.16em] text-[#899DFF]"
            >
              Refactoring goal
            </label>
            <textarea
              id="refactor-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              className="mt-3 min-h-32 w-full resize-y border border-white/10 bg-[#07080C] p-3 font-sans text-sm leading-6 text-white/65 outline-none focus:border-[#899DFF]"
            />
            <p className="mt-3 font-sans text-xs leading-5 text-white/35">
              Refactor Lab preserves observable behavior and avoids adding new dependencies.
            </p>
            <Button
              type="button"
              onClick={() => void analyzeCode()}
              disabled={isLoading || !code.trim()}
              className="mt-5 h-11 w-full cursor-pointer rounded-none border-2 border-[#FFD400] bg-[#FFD400] font-pixel text-lg text-[#07080C] shadow-[4px_4px_0_#899DFF] hover:translate-x-px hover:translate-y-px hover:bg-[#FFD400] hover:shadow-[2px_2px_0_#899DFF]"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <WandSparkles className="size-5" />
              )}
              {isLoading ? "Reviewing..." : "Refactor code"}
            </Button>
          </div>
        </div>
      </section>

      {result ? (
        <div className="mt-8 space-y-6">
          <section className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center border-2 border-[#899DFF]/35 bg-[#10152A] p-5 shadow-[5px_5px_0_#020307]">
            <div>
              <p className="font-pixel text-xs uppercase tracking-[0.18em] text-[#899DFF]">
                Review summary
              </p>
              <p className="mt-2 max-w-3xl font-sans leading-7 text-white/65">
                {result.summary}
              </p>
            </div>
            <div className="flex items-center gap-3 border border-white/10 bg-black/15 px-4 py-3">
              <Gauge className="size-5 text-[#FF9B9B]" />
              <div>
                <p className="font-pixel text-xs text-white/35">Before</p>
                <p className="font-pixel text-2xl text-[#FF9B9B]">{result.scoreBefore}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border border-[#62FB60]/25 bg-[#62FB60]/5 px-4 py-3">
              <Sparkles className="size-5 text-[#62FB60]" />
              <div>
                <p className="font-pixel text-xs text-white/35">After</p>
                <p className="font-pixel text-2xl text-[#62FB60]">{result.scoreAfter}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="min-w-0 border-2 border-[#899DFF]/35 bg-[#10152A] shadow-[6px_6px_0_#020307]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
                <div>
                  <p className="font-pixel text-xl text-white">Working copy</p>
                  <p className="mt-1 font-sans text-xs text-white/35">
                    {appliedCount} changes applied · {availableChangeCount} still available
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetWorkingCopy}
                    className="cursor-pointer rounded-none border-[#899DFF]/45 bg-transparent font-pixel text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C]"
                  >
                    <RefreshCw className="size-4" /> Reset
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyFullRefactor}
                    className="cursor-pointer rounded-none border-[#FFD400]/60 bg-transparent font-pixel text-[#FFD400] hover:bg-[#FFD400] hover:text-[#07080C]"
                  >
                    <Sparkles className="size-4" /> Apply all
                  </Button>
                </div>
              </div>

              <textarea
                value={workingCode}
                onChange={(event) => setWorkingCode(event.target.value)}
                spellCheck={false}
                aria-label="Refactored working copy"
                className="min-h-[32rem] w-full resize-y bg-[#090B14] p-5 font-mono text-sm leading-7 text-[#E7E9F8] outline-none selection:bg-[#899DFF]/35"
              />

              <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void copyWorkingCode()}
                  className="cursor-pointer rounded-none border-[#899DFF]/45 bg-transparent font-pixel text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C]"
                >
                  <ClipboardCopy className="size-4" /> Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={useWorkingCopyAsInput}
                  className="cursor-pointer rounded-none border-[#62FB60]/45 bg-transparent font-pixel text-[#62FB60] hover:bg-[#62FB60] hover:text-[#07080C]"
                >
                  <ArrowRight className="size-4" /> Use as source
                </Button>
                <Button
                  type="button"
                  onClick={() => void copyAndOpenPlayground()}
                  className="cursor-pointer rounded-none border-2 border-[#FFD400] bg-[#FFD400] font-pixel text-[#07080C] shadow-[3px_3px_0_#899DFF] hover:bg-[#FFD400]"
                >
                  <ClipboardCopy className="size-4" /> Copy & open Playground
                </Button>
              </div>
            </div>

            <aside className="min-w-0 border-2 border-[#899DFF]/35 bg-[#10152A] p-4 shadow-[6px_6px_0_#020307]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <p className="font-pixel text-xl text-white">Suggested changes</p>
                <span className="font-pixel text-sm text-[#FFD400]">
                  {result.changes.length}
                </span>
              </div>

              {result.changes.length === 0 ? (
                <p className="mt-4 font-sans text-sm leading-6 text-white/45">
                  A complete refactor was generated, but no independent exact replacements were safe to expose.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {result.changes.map((change, index) => {
                    const applied = appliedChanges.has(index);
                    const canApply = !applied && workingCode.includes(change.before);

                    return (
                      <article
                        key={`${change.title}-${index}`}
                        className="border border-white/10 bg-black/15 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className={`inline-block border px-1.5 py-0.5 font-pixel text-[10px] uppercase ${categoryColors[change.category]}`}>
                              {change.category}
                            </span>
                            <h3 className="mt-2 font-pixel text-lg text-white">
                              {change.title}
                            </h3>
                          </div>
                          {applied ? (
                            <Check className="size-5 shrink-0 text-[#62FB60]" />
                          ) : null}
                        </div>
                        <p className="mt-2 font-sans text-xs leading-5 text-white/45">
                          {change.explanation}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!canApply}
                          onClick={() => applyChange(change, index)}
                          className="mt-3 h-8 w-full cursor-pointer rounded-none border-[#899DFF]/40 bg-transparent font-pixel text-sm text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C] disabled:opacity-35"
                        >
                          {applied ? <Check className="size-3" /> : <ArrowRight className="size-3" />}
                          {applied ? "Applied" : canApply ? "Apply change" : "Overlaps another edit"}
                        </Button>
                      </article>
                    );
                  })}
                </div>
              )}

              {result.warnings.length > 0 ? (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="font-pixel text-sm text-[#FFD400]">Test before shipping</p>
                  <ul className="mt-2 space-y-1 font-sans text-xs leading-5 text-white/40">
                    {result.warnings.map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </section>
        </div>
      ) : isLoading ? (
        <section className="mt-8 flex min-h-72 flex-col items-center justify-center border-2 border-[#899DFF]/25 bg-[#10152A] p-8 text-center">
          <Loader2 className="size-9 animate-spin text-[#FFD400]" />
          <h2 className="mt-5 font-pixel text-3xl text-white">Reviewing the code</h2>
          <p className="mt-2 font-sans text-white/40">
            Finding duplication, risky patterns and small maintainability wins.
          </p>
        </section>
      ) : null}
    </div>
  );
}
