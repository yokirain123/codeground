"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bug,
  CheckCircle2,
  Copy,
  Heart,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/shadcn/button";
import {
  getBugHuntMissions,
  type BugHuntMission,
} from "@/lib/labs/bug-hunt/catalog";
import {
  labLanguageLabels,
  runnableLabLanguages,
  type RunnableLabLanguage,
} from "@/lib/labs/types";

interface RunResponse {
  success?: boolean;
  output?: string;
  stdout?: string;
  status?: string;
  time?: string | null;
  error?: string;
}

interface CompletionResponse {
  completed?: boolean;
  alreadyCompleted?: boolean;
  xpEarned?: number;
  validationErrors?: string[];
  output?: string;
  error?: string;
}

interface ProgressResponse {
  completions?: Array<{
    missionSlug: string;
  }>;
}

const MAX_ATTEMPTS = 3;

function difficultyClass(difficulty: BugHuntMission["difficulty"]) {
  if (difficulty === "Easy") return "text-[#62FB60]";
  if (difficulty === "Medium") return "text-[#FFD400]";
  return "text-[#FF7373]";
}

export default function BugHunt() {
  const { locale, t, formatNumber, translateMessage } = useI18n();
  const missions = useMemo(() => getBugHuntMissions(locale), [locale]);
  const [language, setLanguage] =
    useState<RunnableLabLanguage>("javascript");
  const visibleMissions = useMemo(
    () => missions.filter((mission) => mission.language === language),
    [language, missions],
  );
  const [missionSlug, setMissionSlug] = useState(visibleMissions[0].slug);
  const mission =
    missions.find((item) => item.slug === missionSlug) ??
    visibleMissions[0];

  const [code, setCode] = useState(mission.starterCode);
  const [output, setOutput] = useState(() =>
    t("Press Run or Ctrl/⌘ + Enter to inspect the broken program."),
  );
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [usedHint, setUsedHint] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [lastXp, setLastXp] = useState<number | null>(null);
  const runRef = useRef<() => Promise<void>>(async () => undefined);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/labs/progress?lab=bug-hunt", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as ProgressResponse;
      })
      .then((data) => {
        if (!data || controller.signal.aborted) return;
        setCompletedSlugs(
          new Set(data.completions?.map((item) => item.missionSlug) ?? []),
        );
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Bug Hunt progress error:", error);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const draftKey = `codequest:bug-hunt:${mission.slug}`;
    const savedDraft = window.localStorage.getItem(draftKey);

    setCode(savedDraft ?? mission.starterCode);
    setOutput(t("Press Run or Ctrl/⌘ + Enter to inspect the broken program."));
    setAttemptsLeft(MAX_ATTEMPTS);
    setUsedHint(false);
    setHintVisible(false);
    setLastXp(null);
  }, [mission.slug, mission.starterCode, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const key = `codequest:bug-hunt:${mission.slug}`;

      if (code === mission.starterCode) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, code);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [code, mission.slug, mission.starterCode]);

  const chooseLanguage = (nextLanguage: RunnableLabLanguage) => {
    const firstMission = missions.find(
      (item) => item.language === nextLanguage,
    );

    if (!firstMission) return;
    setLanguage(nextLanguage);
    setMissionSlug(firstMission.slug);
  };

  const chooseMission = (nextMission: BugHuntMission) => {
    setMissionSlug(nextMission.slug);
  };

  const runCode = async () => {
    const wasCompleted = completedSlugs.has(mission.slug);

    if (isRunning || (!wasCompleted && attemptsLeft <= 0) || !code.trim()) {
      return;
    }

    setIsRunning(true);
    setLastXp(null);
    setOutput(t("Compiling and running..."));

    try {
      const runResponse = await fetch("/api/labs/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: mission.language,
          code,
        }),
      });
      const runData = (await runResponse
        .json()
        .catch(() => ({}))) as RunResponse;

      if (!runResponse.ok) {
        throw new Error(runData.error || t("Code execution failed."));
      }

      const consoleOutput =
        runData.output || runData.status || t("Program finished without output.");
      setOutput(consoleOutput);

      if (!runData.success) {
        if (!wasCompleted) {
          setAttemptsLeft((current) => Math.max(0, current - 1));
        }
        return;
      }

      const completionResponse = await fetch("/api/labs/bug-hunt/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionSlug: mission.slug,
          code,
          usedHint,
        }),
      });
      const completionData = (await completionResponse
        .json()
        .catch(() => ({}))) as CompletionResponse;

      if (!completionResponse.ok) {
        if (!wasCompleted) {
          setAttemptsLeft((current) => Math.max(0, current - 1));
        }

        const feedback =
          completionData.validationErrors?.join("\n") ||
          completionData.output ||
          completionData.error ||
          t("The bug is still hiding in the code.");
        setOutput(
          `${consoleOutput}\n\n[${t("Mission check")}]\n${feedback}`,
        );
        return;
      }

      setCompletedSlugs((current) => new Set(current).add(mission.slug));
      setLastXp(completionData.alreadyCompleted ? 0 : completionData.xpEarned ?? 0);
      window.localStorage.removeItem(`codequest:bug-hunt:${mission.slug}`);
      toast.success(
        completionData.alreadyCompleted
          ? t("Mission replay cleared")
          : t("Bug eliminated · +{count} XP", {
              count: formatNumber(completionData.xpEarned ?? 0),
            }),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? translateMessage(error.message)
          : t("Code execution failed.");
      setOutput(message);
      toast.error(message);
    } finally {
      setIsRunning(false);
    }
  };

  runRef.current = runCode;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void runRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const resetMission = () => {
    setCode(mission.starterCode);
    setOutput(t("Starter code restored. Find the bug and run it again."));
    setAttemptsLeft(MAX_ATTEMPTS);
    setUsedHint(false);
    setHintVisible(false);
    setLastXp(null);
    window.localStorage.removeItem(`codequest:bug-hunt:${mission.slug}`);
  };

  const revealHint = () => {
    setHintVisible(true);
    setUsedHint(true);
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success(t("Console output copied"));
    } catch {
      toast.error(t("Could not copy output"));
    }
  };

  const isCompleted = completedSlugs.has(mission.slug);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-12">
      <aside className="border-2 border-[#899DFF]/35 bg-[#10152A] p-4 shadow-[5px_5px_0_#020307]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-[#899DFF]">
              {t("Mission board")}
            </p>
            <p className="mt-1 font-pixel text-2xl text-white">
              {t("{completed}/{total} cleared", {
                completed: formatNumber(completedSlugs.size),
                total: formatNumber(missions.length),
              })}
            </p>
          </div>
          <Bug className="size-7 text-[#FFD400]" />
        </div>

        <label className="mt-4 block font-pixel text-sm text-white/55" htmlFor="bug-language">
          {t("Language")}
        </label>
        <select
          id="bug-language"
          value={language}
          onChange={(event) =>
            chooseLanguage(event.target.value as RunnableLabLanguage)
          }
          className="mt-2 h-11 w-full cursor-pointer border border-[#899DFF]/45 bg-[#07080C] px-3 font-pixel text-lg text-[#FFD400] outline-none focus:border-[#FFD400]"
        >
          {runnableLabLanguages.map((item) => (
            <option key={item} value={item}>
              {labLanguageLabels[item]}
            </option>
          ))}
        </select>

        <div className="mt-4 space-y-2">
          {visibleMissions.map((item) => {
            const active = item.slug === mission.slug;
            const cleared = completedSlugs.has(item.slug);

            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => chooseMission(item)}
                className={`w-full cursor-pointer border p-3 text-left transition-colors ${
                  active
                    ? "border-[#FFD400] bg-[#FFD400]/10"
                    : "border-white/10 bg-black/10 hover:border-[#899DFF]/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-pixel text-lg text-white">{item.title}</span>
                  {cleared ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#62FB60]" />
                  ) : null}
                </div>
                <div className="mt-1 flex items-center justify-between font-pixel text-xs">
                  <span className={difficultyClass(item.difficulty)}>
                    {item.difficulty === "Easy"
                      ? t("Easy")
                      : item.difficulty === "Medium"
                        ? t("Medium")
                        : t("Hard")}
                  </span>
                  <span className="text-[#FFD400]">
                    {formatNumber(item.xp)} XP
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-w-0 border-2 border-[#899DFF]/35 bg-[#10152A] shadow-[6px_6px_0_#020307]">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-pixel text-3xl text-white">{mission.title}</h2>
              {isCompleted ? (
                <span className="border border-[#62FB60]/45 bg-[#62FB60]/10 px-2 py-1 font-pixel text-xs text-[#62FB60]">
                  {t("CLEARED")}
                </span>
              ) : null}
            </div>
            <p className="mt-2 font-sans leading-6 text-white/50">
              {mission.description}
            </p>
            <p className="mt-3 font-pixel text-sm text-[#899DFF]">
              {t("Expected output")}: {" "}
              <span className="text-[#FFD400]">{mission.expectedOutput}</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div
              className="flex items-center gap-1 border border-white/10 bg-black/20 px-3 py-2"
              aria-label={t("{count} attempts left", {
                count: formatNumber(attemptsLeft),
              })}
            >
              {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => (
                <Heart
                  key={index}
                  className={`size-4 ${
                    index < attemptsLeft
                      ? "fill-[#FF7373] text-[#FF7373]"
                      : "text-white/15"
                  }`}
                />
              ))}
            </div>
            <span className="font-pixel text-lg text-[#FFD400]">
              {formatNumber(mission.xp)} XP
            </span>
          </div>
        </div>

        <div className="grid min-h-[36rem] lg:grid-cols-2">
          <div className="flex min-h-0 flex-col border-b border-white/10 lg:border-r lg:border-b-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0B0E18] px-4 py-3">
              <span className="font-pixel text-base text-[#FFD400]">{mission.filename}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetMission}
                  className="h-9 cursor-pointer rounded-none border-[#899DFF]/60 bg-transparent px-3 font-pixel text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C]"
                >
                  <RotateCcw className="size-4" /> {t("Reset")}
                </Button>
                <Button
                  type="button"
                  onClick={() => void runCode()}
                  disabled={isRunning || (!isCompleted && attemptsLeft <= 0)}
                  className="h-9 cursor-pointer rounded-none border-2 border-[#FFD400] bg-[#FFD400] px-4 font-pixel text-[#07080C] shadow-[3px_3px_0_#899DFF] hover:translate-x-px hover:translate-y-px hover:bg-[#FFD400] hover:shadow-[1px_1px_0_#899DFF] disabled:pointer-events-none disabled:opacity-45"
                >
                  {isRunning ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  {isRunning ? t("Running...") : t("Run")}
                </Button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              spellCheck={false}
              aria-label={`${labLanguageLabels[mission.language]} code`}
              className="min-h-[28rem] flex-1 resize-none bg-[#090B14] p-5 font-mono text-[14px] leading-7 text-[#E7E9F8] outline-none selection:bg-[#899DFF]/35"
            />
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0B0E18] px-4 py-3">
              <span className="flex items-center gap-2 font-pixel text-base text-[#AAB6FF]">
                <Terminal className="size-4" /> {t("Console")}
              </span>
              <button
                type="button"
                onClick={() => void copyOutput()}
                className="cursor-pointer text-white/35 transition-colors hover:text-[#FFD400]"
                aria-label={t("Copy console output")}
              >
                <Copy className="size-4" />
              </button>
            </div>

            <pre className="min-h-52 flex-1 overflow-auto whitespace-pre-wrap bg-[#07080C] p-5 font-mono text-sm leading-6 text-white/70">
              {output}
            </pre>

            <div className="border-t border-white/10 p-4">
              {hintVisible ? (
                <div className="border border-[#FFD400]/35 bg-[#FFD400]/5 p-4">
                  <p className="flex items-center gap-2 font-pixel text-[#FFD400]">
                    <Lightbulb className="size-4" /> {t("Hint")} · -
                    {formatNumber(mission.hintCost)} XP
                  </p>
                  <p className="mt-2 font-sans text-sm leading-6 text-white/60">
                    {mission.hint}
                  </p>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={revealHint}
                  className="w-full cursor-pointer rounded-none border-[#FFD400]/50 bg-transparent font-pixel text-[#FFD400] hover:bg-[#FFD400] hover:text-[#07080C]"
                >
                  <Lightbulb className="size-4" /> {t("Reveal hint (-{count} XP)", {
                    count: formatNumber(mission.hintCost),
                  })}
                </Button>
              )}

              {!isCompleted && attemptsLeft === 0 ? (
                <div className="mt-3 border border-[#FF7373]/35 bg-[#FF7373]/10 p-3 text-center">
                  <p className="font-pixel text-[#FF9B9B]">
                    {t("No attempts left")}
                  </p>
                  <button
                    type="button"
                    onClick={resetMission}
                    className="mt-1 cursor-pointer font-pixel text-sm text-[#FFD400] underline underline-offset-4"
                  >
                    {t("Restart mission")}
                  </button>
                </div>
              ) : null}

              {lastXp !== null ? (
                <div className="mt-3 flex items-center justify-center gap-2 border border-[#62FB60]/35 bg-[#62FB60]/10 p-3 font-pixel text-[#62FB60]">
                  <Trophy className="size-4" />
                  {lastXp > 0
                    ? t("Mission cleared · +{count} XP", {
                        count: formatNumber(lastXp),
                      })
                    : t("Replay cleared")}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
