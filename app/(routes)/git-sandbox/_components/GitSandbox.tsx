"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  CircleDot,
  GitBranch,
  GitCommitHorizontal,
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
  getGitSandboxMission,
  getGitSandboxMissions,
  gitSandboxMissions,
  type GitSandboxMission,
} from "@/lib/labs/git/catalog";
import {
  createGitSandboxState,
  runGitCommand,
  updateGitWorkingFile,
} from "@/lib/labs/git/engine";
import type { GitSandboxState } from "@/lib/labs/git/types";

interface ProgressResponse {
  completions?: Array<{ missionSlug: string }>;
}

interface CompletionResponse {
  completed?: boolean;
  alreadyCompleted?: boolean;
  xpEarned?: number;
  validationErrors?: string[];
  error?: string;
}

function difficultyClass(difficulty: GitSandboxMission["difficulty"]) {
  if (difficulty === "Easy") return "text-[#62FB60]";
  if (difficulty === "Medium") return "text-[#FFD400]";
  return "text-[#FF7373]";
}

function CommitTree({ state }: { state: GitSandboxState }) {
  const { t } = useI18n();
  const commits = useMemo(
    () => Object.values(state.commits).sort((a, b) => b.order - a.order),
    [state.commits],
  );
  const branchLabels = useMemo(() => {
    const labels: Record<string, string[]> = {};

    for (const [branch, commitId] of Object.entries(state.branches)) {
      labels[commitId] = [...(labels[commitId] ?? []), branch];
    }

    return labels;
  }, [state.branches]);

  return (
    <div className="space-y-0">
      {commits.map((commit, index) => (
        <div key={commit.id} className="relative flex gap-3 pb-4 last:pb-0">
          {index < commits.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute top-5 bottom-0 left-[9px] w-px bg-[#899DFF]/35"
            />
          ) : null}
          <CircleDot className="relative z-10 mt-0.5 size-5 shrink-0 fill-[#10152A] text-[#FFD400]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <code className="font-mono text-xs text-[#899DFF]">{commit.id}</code>
              {(branchLabels[commit.id] ?? []).map((branch) => (
                <span
                  key={branch}
                  className={`border px-1.5 py-0.5 font-pixel text-[10px] ${
                    branch === state.currentBranch
                      ? "border-[#FFD400]/60 bg-[#FFD400]/10 text-[#FFD400]"
                      : "border-[#899DFF]/40 text-[#AAB6FF]"
                  }`}
                >
                  {branch}
                </span>
              ))}
              {commit.parents.length > 1 ? (
                <span className="font-pixel text-[10px] text-[#62FB60]">
                  {t("MERGE")}
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate font-sans text-sm text-white/65">
              {commit.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GitSandbox() {
  const { locale, t, formatNumber, translateMessage } = useI18n();
  const missions = useMemo(() => getGitSandboxMissions(locale), [locale]);
  const [missionSlug, setMissionSlug] = useState(gitSandboxMissions[0].slug);
  const mission = getGitSandboxMission(missionSlug, locale) ?? missions[0];
  const [state, setState] = useState<GitSandboxState>(() =>
    createGitSandboxState(mission.slug),
  );
  const filenames = Object.keys(state.workingFiles);
  const [activeFile, setActiveFile] = useState(filenames[0] ?? "README.md");
  const [command, setCommand] = useState("git status");
  const [hintVisible, setHintVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/labs/progress?lab=git-sandbox", {
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
        console.error("Git Sandbox progress error:", error);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [state.terminal]);

  const resetMission = (slug = mission.slug) => {
    const nextState = createGitSandboxState(slug);
    setState(nextState);
    setActiveFile(Object.keys(nextState.workingFiles)[0] ?? "README.md");
    setCommand("git status");
    setHintVisible(false);
    setFeedback("");
  };

  const chooseMission = (nextMission: GitSandboxMission) => {
    setMissionSlug(nextMission.slug);
    resetMission(nextMission.slug);
  };

  const executeCommand = () => {
    const result = runGitCommand(state, command);
    setState(result.state);
    setFeedback("");
    setCommand("");
  };

  const checkMission = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setFeedback(t("Checking repository state..."));

    try {
      const response = await fetch("/api/labs/git-sandbox/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionSlug: mission.slug, state }),
      });
      const data = (await response
        .json()
        .catch(() => ({}))) as CompletionResponse;

      if (!response.ok) {
        const message =
          data.validationErrors?.join("\n") ||
          (data.error ? translateMessage(data.error) : "") ||
          t("The Git quest is not complete yet.");
        setFeedback(message);
        toast.error(
          data.error
            ? translateMessage(data.error)
            : t("Quest requirements are not complete"),
        );
        return;
      }

      setCompletedSlugs((current) => new Set(current).add(mission.slug));
      const message = data.alreadyCompleted
        ? t("Quest replay cleared. XP was already awarded.")
        : t("Quest complete · +{count} XP", {
            count: formatNumber(data.xpEarned ?? 0),
          });
      setFeedback(message);
      toast.success(message);
    } catch (error) {
      const message =
        error instanceof Error
          ? translateMessage(error.message)
          : t("Could not check the quest.");
      setFeedback(message);
      toast.error(message);
    } finally {
      setIsChecking(false);
    }
  };

  const isCompleted = completedSlugs.has(mission.slug);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 sm:px-8 xl:grid-cols-[19rem_minmax(0,1fr)] xl:px-12">
      <aside className="border-2 border-[#899DFF]/35 bg-[#10152A] p-4 shadow-[5px_5px_0_#020307]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-[#899DFF]">
              {t("Quest line")}
            </p>
            <p className="mt-1 font-pixel text-2xl text-white">
              {t("{completed}/{total} cleared", {
                completed: formatNumber(completedSlugs.size),
                total: formatNumber(missions.length),
              })}
            </p>
          </div>
          <GitBranch className="size-7 text-[#FFD400]" />
        </div>

        <div className="mt-4 space-y-2">
          {missions.map((item, index) => {
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
                <div className="flex items-center justify-between gap-3">
                  <span className="font-pixel text-xs text-[#899DFF]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {cleared ? (
                    <CheckCircle2 className="size-4 text-[#62FB60]" />
                  ) : null}
                </div>
                <p className="mt-1 font-pixel text-lg text-white">{item.title}</p>
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
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-pixel text-3xl text-white">{mission.title}</h2>
              {isCompleted ? (
                <span className="border border-[#62FB60]/45 bg-[#62FB60]/10 px-2 py-1 font-pixel text-xs text-[#62FB60]">
                  {t("CLEARED")}
                </span>
              ) : null}
            </div>
            <p className="mt-2 font-sans text-white/50">{mission.description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => resetMission()}
              className="cursor-pointer rounded-none border-[#899DFF]/60 bg-transparent font-pixel text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C]"
            >
              <RotateCcw className="size-4" /> {t("Reset repo")}
            </Button>
            <Button
              type="button"
              onClick={() => void checkMission()}
              disabled={isChecking}
              className="cursor-pointer rounded-none border-2 border-[#FFD400] bg-[#FFD400] font-pixel text-[#07080C] shadow-[3px_3px_0_#899DFF] hover:translate-x-px hover:translate-y-px hover:bg-[#FFD400] hover:shadow-[1px_1px_0_#899DFF]"
            >
              {isChecking ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trophy className="size-4" />
              )}
              {t("Check quest")}
            </Button>
          </div>
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
          <div className="min-w-0 border-b border-white/10 xl:border-r xl:border-b-0">
            <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)]">
              <div className="border-b border-white/10 p-4 lg:border-r lg:border-b-0">
                <p className="font-pixel text-xs uppercase tracking-[0.18em] text-[#899DFF]">
                  {t("Objectives")}
                </p>
                <ol className="mt-3 space-y-3">
                  {mission.objective.map((objective, index) => (
                    <li key={objective} className="flex gap-3 font-sans text-sm leading-5 text-white/60">
                      <span className="font-pixel text-[#FFD400]">0{index + 1}</span>
                      {objective}
                    </li>
                  ))}
                </ol>

                <button
                  type="button"
                  onClick={() => setHintVisible((current) => !current)}
                  className="mt-5 flex cursor-pointer items-center gap-2 font-pixel text-sm text-[#FFD400]"
                >
                  <Lightbulb className="size-4" />
                  {hintVisible ? t("Hide hint") : t("Show hint")}
                </button>
                {hintVisible ? (
                  <p className="mt-2 border border-[#FFD400]/25 bg-[#FFD400]/5 p-3 font-sans text-xs leading-5 text-white/55">
                    {mission.hint}
                  </p>
                ) : null}

                <p className="mt-6 font-pixel text-xs uppercase tracking-[0.18em] text-[#899DFF]">
                  {t("Command deck")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mission.suggestedCommands.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setCommand(suggestion)}
                      className="cursor-pointer border border-white/10 bg-black/20 px-2 py-1 font-mono text-[11px] text-white/55 transition-colors hover:border-[#FFD400]/50 hover:text-[#FFD400]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-[27rem] min-w-0 flex-col">
                <div className="flex items-center gap-1 border-b border-white/10 bg-[#0B0E18] px-3 pt-3">
                  {filenames.map((filename) => (
                    <button
                      key={filename}
                      type="button"
                      onClick={() => setActiveFile(filename)}
                      className={`cursor-pointer border border-b-0 px-3 py-2 font-pixel text-sm ${
                        activeFile === filename
                          ? "border-[#899DFF]/45 bg-[#090B14] text-[#FFD400]"
                          : "border-transparent text-white/35 hover:text-white/70"
                      }`}
                    >
                      {filename}
                      {state.conflictFiles.includes(filename) ? (
                        <span className="ml-2 text-[#FF7373]">!</span>
                      ) : null}
                    </button>
                  ))}
                </div>
                <textarea
                  value={state.workingFiles[activeFile] ?? ""}
                  onChange={(event) =>
                    setState((current) =>
                      updateGitWorkingFile(current, activeFile, event.target.value),
                    )
                  }
                  spellCheck={false}
                  aria-label={t("{file} contents", { file: activeFile })}
                  className="min-h-[24rem] flex-1 resize-none bg-[#090B14] p-5 font-mono text-sm leading-7 text-[#E7E9F8] outline-none selection:bg-[#899DFF]/35"
                />
              </div>
            </div>

            <div className="border-t border-white/10">
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#0B0E18] px-4 py-3 font-pixel text-sm text-[#AAB6FF]">
                <Terminal className="size-4" /> {t("Training terminal")}
              </div>
              <div className="h-56 overflow-auto bg-[#05060A] p-4 font-mono text-xs leading-5 text-white/65">
                {state.terminal.map((line, index) => (
                  <div
                    key={`${index}-${line}`}
                    className={line.startsWith("$ ") ? "mt-2 text-[#FFD400]" : "whitespace-pre-wrap"}
                  >
                    {line}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  executeCommand();
                }}
                className="flex border-t border-white/10 bg-[#090B14]"
              >
                <span className="px-4 py-3 font-mono text-[#62FB60]">$</span>
                <input
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                  placeholder="git status"
                  aria-label={t("Git command")}
                  autoComplete="off"
                  maxLength={500}
                  className="min-w-0 flex-1 bg-transparent py-3 font-mono text-sm text-white outline-none placeholder:text-white/20"
                />
                <Button
                  type="submit"
                  className="m-1.5 h-9 cursor-pointer rounded-none bg-[#899DFF] px-4 font-pixel text-[#07080C] hover:bg-[#FFD400]"
                >
                  <Play className="size-4" /> {t("Run")}
                </Button>
              </form>
            </div>
          </div>

          <aside className="min-w-0 p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <p className="flex items-center gap-2 font-pixel text-lg text-white">
                <GitCommitHorizontal className="size-5 text-[#FFD400]" />{" "}
                {t("Commit tree")}
              </p>
              <span className="font-pixel text-xs text-[#899DFF]">
                {state.currentBranch}
              </span>
            </div>
            <div className="mt-5 max-h-[31rem] overflow-auto pr-1">
              <CommitTree state={state} />
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="font-pixel text-xs uppercase tracking-[0.18em] text-[#899DFF]">
                {t("Repository")}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 font-pixel text-sm">
                <div className="border border-white/10 bg-black/15 p-3">
                  <p className="text-white/35">{t("Branch")}</p>
                  <p className="mt-1 truncate text-[#FFD400]">{state.currentBranch}</p>
                </div>
                <div className="border border-white/10 bg-black/15 p-3">
                  <p className="text-white/35">{t("Commits")}</p>
                  <p className="mt-1 text-[#62FB60]">
                    {formatNumber(Object.keys(state.commits).length)}
                  </p>
                </div>
              </div>

              {feedback ? (
                <div
                  className={`mt-4 whitespace-pre-wrap border p-3 font-sans text-sm leading-5 ${
                    isCompleted
                      ? "border-[#62FB60]/35 bg-[#62FB60]/10 text-[#9BFFB5]"
                      : "border-[#FFD400]/30 bg-[#FFD400]/5 text-white/65"
                  }`}
                >
                  {feedback}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
