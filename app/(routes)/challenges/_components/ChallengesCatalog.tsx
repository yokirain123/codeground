"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Clock3,
  Code2,
  Flame,
  Search,
  Shuffle,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { useI18n } from "@/components/i18n/I18nProvider";
import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_LANGUAGES,
  type ChallengeCompletionSummary,
  type ChallengeDifficulty,
  type ChallengeLanguage,
  type ChallengeSummary,
} from "@/lib/challenges/types";
import { getChallengeDraftKey } from "@/lib/challenges/draft";

interface ChallengesCatalogProps {
  challenges: ChallengeSummary[];
  dailySlug: string;
  completions: ChallengeCompletionSummary[];
}

type StatusFilter = "all" | "not-started" | "in-progress" | "completed";

const languageStyles: Record<ChallengeLanguage, string> = {
  HTML: "border-[#FF8C42]/50 bg-[#FF8C42]/10 text-[#FFB37A]",
  CSS: "border-[#0FB5FF]/50 bg-[#0FB5FF]/10 text-[#66D2FF]",
  React: "border-[#62E6FF]/50 bg-[#62E6FF]/10 text-[#62E6FF]",
  Python: "border-[#FFD400]/50 bg-[#FFD400]/10 text-[#FFD400]",
};

const difficultyStyles: Record<ChallengeDifficulty, string> = {
  easy: "text-[#62FB60]",
  medium: "text-[#FFB347]",
  hard: "text-[#FF667D]",
};

export default function ChallengesCatalog({
  challenges,
  dailySlug,
  completions,
}: ChallengesCatalogProps) {
  const { t, formatNumber } = useI18n();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<ChallengeLanguage | "all">("all");
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | "all">(
    "all",
  );
  const [status, setStatus] = useState<StatusFilter>("all");
  const [draftSlugs, setDraftSlugs] = useState<Set<string>>(() => new Set());

  const completedSlugs = useMemo(
    () => new Set(completions.map((completion) => completion.challengeSlug)),
    [completions],
  );

  useEffect(() => {
    const findDrafts = () => {
      const foundDrafts = new Set<string>();

      for (const challenge of challenges) {
        if (localStorage.getItem(getChallengeDraftKey(challenge.slug))) {
          foundDrafts.add(challenge.slug);
        }
      }

      setDraftSlugs(foundDrafts);
    };

    findDrafts();
    window.addEventListener("storage", findDrafts);

    return () => window.removeEventListener("storage", findDrafts);
  }, [challenges]);

  const getStatus = useCallback(
    (slug: string): Exclude<StatusFilter, "all"> => {
      if (completedSlugs.has(slug)) {
        return "completed";
      }

      if (draftSlugs.has(slug)) {
        return "in-progress";
      }

      return "not-started";
    },
    [completedSlugs, draftSlugs],
  );

  const filteredChallenges = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return challenges.filter((challenge) => {
      const matchesSearch =
        !normalizedSearch ||
        challenge.title.toLowerCase().includes(normalizedSearch) ||
        challenge.description.toLowerCase().includes(normalizedSearch) ||
        challenge.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch),
        );

      const matchesLanguage =
        language === "all" || challenge.language === language;
      const matchesDifficulty =
        difficulty === "all" || challenge.difficulty === difficulty;
      const matchesStatus =
        status === "all" || getStatus(challenge.slug) === status;

      return (
        matchesSearch && matchesLanguage && matchesDifficulty && matchesStatus
      );
    });
  }, [challenges, difficulty, getStatus, language, search, status]);

  const dailyChallenge =
    challenges.find((challenge) => challenge.slug === dailySlug) ??
    challenges[0];

  const completedXp = completions.reduce(
    (total, completion) => total + completion.xpEarned,
    0,
  );
  const activeDraftCount = [...draftSlugs].filter(
    (slug) => !completedSlugs.has(slug),
  ).length;

  const openRandomChallenge = () => {
    const pool =
      filteredChallenges.length > 0 ? filteredChallenges : challenges;

    if (pool.length === 0) {
      return;
    }

    const unfinishedPool = pool.filter(
      (challenge) => !completedSlugs.has(challenge.slug),
    );
    const finalPool = unfinishedPool.length > 0 ? unfinishedPool : pool;
    const selected = finalPool[Math.floor(Math.random() * finalPool.length)];

    router.push(`/challenges/${selected.slug}`);
  };

  return (
    <main className="min-h-screen bg-[#07080C] text-white">
      <section className="relative overflow-hidden border-b border-[#899DFF]/25">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(137,157,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(137,157,255,0.18)_1px,transparent_1px)] [background-size:32px_32px]"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 right-[8%] size-72 rounded-full bg-[#899DFF]/15 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 md:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10 lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#FFD400]/40 bg-[#FFD400]/5 px-3 py-2 font-pixel text-xs uppercase tracking-[0.2em] text-[#FFD400]">
              <Zap className="size-4" />
              {t("Challenge Arena")}
            </div>

            <h1 className="mt-5 max-w-4xl break-words font-pixel text-4xl leading-[0.9] sm:text-6xl lg:text-7xl">
              {t("TEST YOUR")} <span className="text-[#FFD400]">{t("SKILLS")}</span>
            </h1>

            <p className="mt-5 max-w-2xl font-sans text-base leading-7 text-white/60 sm:text-lg">
              {t(
                "Take standalone coding challenges, sharpen what you learned, and earn extra XP outside your courses.",
              )}
            </p>
          </div>

          <div className="grid w-full grid-cols-3 border-2 border-[#899DFF]/35 bg-[#10152A] shadow-[6px_6px_0_0_#020307] lg:w-auto">
            <div className="min-w-0 border-r border-[#899DFF]/20 px-1.5 py-3 text-center sm:p-4 lg:min-w-24">
              <p className="font-pixel text-3xl text-[#FFD400]">
                {formatNumber(completions.length)}
              </p>
              <p className="mt-1 break-words font-pixel text-[9px] uppercase leading-tight tracking-normal text-white/40 sm:text-[10px] sm:tracking-widest">
                {t("Cleared")}
              </p>
            </div>
            <div className="min-w-0 border-r border-[#899DFF]/20 px-1.5 py-3 text-center sm:p-4 lg:min-w-24">
              <p className="font-pixel text-3xl text-[#62FB60]">
                {formatNumber(activeDraftCount)}
              </p>
              <p className="mt-1 break-words font-pixel text-[9px] uppercase leading-tight tracking-normal text-white/40 sm:text-[10px] sm:tracking-widest">
                {t("Active")}
              </p>
            </div>
            <div className="min-w-0 px-1.5 py-3 text-center sm:p-4 lg:min-w-24">
              <p className="font-pixel text-3xl text-[#899DFF]">
                {formatNumber(completedXp)}
              </p>
              <p className="mt-1 break-words font-pixel text-[9px] uppercase leading-tight tracking-normal text-white/40 sm:text-[10px] sm:tracking-widest">
                XP
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10">
        {dailyChallenge && (
          <section className="relative overflow-hidden border-2 border-[#FFD400] bg-[#10152A] shadow-[8px_8px_0_0_#FF8C00]">
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,212,0,0.22),transparent_60%)]"
            />

            <div className="relative grid gap-6 p-4 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-[#FFD400] px-3 py-1.5 font-pixel text-xs uppercase tracking-widest text-[#07080C]">
                    <Sparkles className="size-4" />
                    {t("Daily Challenge")}
                  </span>
                  <span
                    className={`border px-2.5 py-1 font-pixel text-xs ${languageStyles[dailyChallenge.language]}`}
                  >
                    {dailyChallenge.language}
                  </span>
                  <span
                    className={`font-pixel text-xs uppercase ${difficultyStyles[dailyChallenge.difficulty]}`}
                  >
                    {dailyChallenge.difficulty === "easy"
                      ? t("easy")
                      : dailyChallenge.difficulty === "medium"
                        ? t("medium")
                        : t("hard")}
                  </span>
                </div>

                <h2 className="mt-5 break-words font-pixel text-3xl text-white sm:text-5xl">
                  {dailyChallenge.title}
                </h2>
                <p className="mt-3 max-w-2xl font-sans leading-7 text-white/60">
                  {dailyChallenge.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-5 font-pixel text-sm text-white/50">
                  <span className="flex items-center gap-2">
                    <Clock3 className="size-4 text-[#899DFF]" />
                    {t("{count} min", {
                      count: formatNumber(dailyChallenge.estimatedMinutes),
                    })}
                  </span>
                  <span className="flex items-center gap-2">
                    <Trophy className="size-4 text-[#FFD400]" />+
                    {formatNumber(dailyChallenge.xp)} XP
                  </span>
                  {completedSlugs.has(dailyChallenge.slug) && (
                    <span className="flex items-center gap-2 text-[#62FB60]">
                      <Check className="size-4" /> {t("Completed")}
                    </span>
                  )}
                </div>
              </div>

              <Button
                className="group flex h-auto min-h-12 w-full rounded-none border-2 border-[#FFD400] bg-[#FFD400] px-6 py-2 font-pixel text-lg whitespace-normal text-[#07080C] shadow-[4px_4px_0_0_#899DFF] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#FFD400] hover:shadow-[2px_2px_0_0_#899DFF] lg:w-auto"
              >
                <Link href={`/challenges/${dailyChallenge.slug}`}>
                  {completedSlugs.has(dailyChallenge.slug)
                    ? t("Play again")
                    : draftSlugs.has(dailyChallenge.slug)
                      ? t("Continue")
                      : t("Start daily")}
                </Link>
              </Button>
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="flex flex-col gap-5 border-b border-[#899DFF]/20 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-pixel text-xs uppercase tracking-[0.2em] text-[#899DFF]">
                {t("Quest board")}
              </p>
              <h2 className="mt-1 font-pixel text-4xl sm:text-5xl">
                {t("All")} <span className="text-[#FFD400]">{t("Challenges")}</span>
              </h2>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={openRandomChallenge}
              className="h-11 cursor-pointer rounded-none border-[#899DFF] bg-transparent px-5 font-pixel text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C]"
            >
              <Shuffle className="size-4" />
              {t("Random challenge")}
            </Button>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(240px,1fr)_auto_auto]">
            <label className="flex h-11 items-center gap-3 border border-[#899DFF]/40 bg-[#10152A] px-4 focus-within:border-[#FFD400]">
              <Search className="size-4 shrink-0 text-[#899DFF]" />
              <span className="sr-only">{t("Search challenges")}</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search challenges...")}
                className="min-w-0 flex-1 bg-transparent font-sans text-sm text-white outline-none placeholder:text-white/30"
              />
            </label>

            <select
              aria-label={t("Difficulty")}
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as ChallengeDifficulty | "all")
              }
              className="h-11 border border-[#899DFF]/40 bg-[#10152A] px-4 font-pixel text-sm text-white outline-none focus:border-[#FFD400]"
            >
              <option value="all">{t("All difficulties")}</option>
              {CHALLENGE_DIFFICULTIES.map((item) => (
                <option key={item} value={item}>
                  {item === "easy"
                    ? t("easy")
                    : item === "medium"
                      ? t("medium")
                      : t("hard")}
                </option>
              ))}
            </select>

            <select
              aria-label={t("Progress status")}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
              className="h-11 border border-[#899DFF]/40 bg-[#10152A] px-4 font-pixel text-sm text-white outline-none focus:border-[#FFD400]"
            >
              <option value="all">{t("All progress")}</option>
              <option value="not-started">{t("Not started")}</option>
              <option value="in-progress">{t("In progress")}</option>
              <option value="completed">{t("Completed")}</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLanguage("all")}
              className={`cursor-pointer border px-4 py-2 font-pixel text-sm transition-colors ${
                language === "all"
                  ? "border-[#FFD400] bg-[#FFD400] text-[#07080C]"
                  : "border-[#899DFF]/35 bg-[#10152A] text-white/55 hover:border-[#899DFF] hover:text-white"
              }`}
            >
              {t("All languages")}
            </button>

            {CHALLENGE_LANGUAGES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLanguage(item)}
                className={`cursor-pointer border px-4 py-2 font-pixel text-sm transition-colors ${
                  language === item
                    ? languageStyles[item]
                    : "border-[#899DFF]/35 bg-[#10152A] text-white/55 hover:border-[#899DFF] hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {filteredChallenges.length > 0 ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredChallenges.map((challenge, index) => {
                const challengeStatus = getStatus(challenge.slug);

                return (
                  <article
                    key={challenge.slug}
                    className="group flex min-h-72 flex-col border-2 border-[#899DFF]/30 bg-[#10152A] shadow-[5px_5px_0_0_#020307] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD400]/70 hover:shadow-[7px_7px_0_0_#020307]"
                  >
                    <div className="flex items-center justify-between border-b border-[#899DFF]/20 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-pixel text-xs text-white/25">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`border px-2.5 py-1 font-pixel text-xs ${languageStyles[challenge.language]}`}
                        >
                          {challenge.language}
                        </span>
                      </div>

                      {challengeStatus === "completed" ? (
                        <span className="flex items-center gap-1 font-pixel text-xs text-[#62FB60]">
                          <Check className="size-4" /> {t("Cleared")}
                        </span>
                      ) : challengeStatus === "in-progress" ? (
                        <span className="flex items-center gap-1 font-pixel text-xs text-[#FFD400]">
                          <Flame className="size-4" /> {t("Active")}
                        </span>
                      ) : (
                        <Code2 className="size-5 text-[#899DFF]/50" />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`font-pixel text-xs uppercase tracking-widest ${difficultyStyles[challenge.difficulty]}`}
                        >
                          {challenge.difficulty === "easy"
                            ? t("easy")
                            : challenge.difficulty === "medium"
                              ? t("medium")
                              : t("hard")}
                        </span>
                        <span className="flex items-center gap-1.5 font-pixel text-xs text-white/35">
                          <Clock3 className="size-3.5" />
                          {t("{count} min", {
                            count: formatNumber(challenge.estimatedMinutes),
                          })}
                        </span>
                      </div>

                      <h3 className="mt-4 break-words font-pixel text-2xl leading-none text-white transition-colors group-hover:text-[#FFD400] sm:text-3xl">
                        {challenge.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 font-sans text-sm leading-6 text-white/50">
                        {challenge.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {challenge.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="border border-white/10 bg-black/15 px-2 py-1 font-sans text-[11px] text-white/35"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-col items-stretch gap-4 pt-6 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between">
                        <div>
                          <p className="font-pixel text-[10px] uppercase tracking-widest text-white/30">
                            {t("Reward")}
                          </p>
                          <p className="mt-1 font-pixel text-xl text-[#FFD400]">
                            +{formatNumber(challenge.xp)} XP
                          </p>
                        </div>

                        <Link
                          href={`/challenges/${challenge.slug}`}
                          className="flex min-h-10 items-center justify-center gap-2 border border-[#899DFF] px-4 py-2 text-center font-pixel text-sm text-[#AAB6FF] transition-all hover:border-[#FFD400] hover:bg-[#FFD400] hover:text-[#07080C]"
                        >
                          {challengeStatus === "completed"
                            ? t("Replay")
                            : challengeStatus === "in-progress"
                              ? t("Continue")
                              : t("Start")}
                          <ChevronRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-7 border-2 border-dashed border-[#899DFF]/30 bg-[#10152A]/50 px-6 py-16 text-center">
              <Search className="mx-auto size-9 text-[#899DFF]/50" />
              <h3 className="mt-4 font-pixel text-3xl text-white">
                {t("No challenges found")}
              </h3>
              <p className="mt-2 font-sans text-sm text-white/45">
                {t("Change the filters or try another search.")}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
