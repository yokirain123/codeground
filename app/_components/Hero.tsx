"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { motion, useReducedMotion } from "motion/react";

import BlurOutUp from "@/components/HeroText";
import bgImage from "@/components/images/bg.gif";
import Token from "@/components/images/Token.png";
import { Button } from "@/components/ui/shadcn/button";
import { useI18n } from "@/components/i18n/I18nProvider";

interface HeroStats {
  player: {
    id: number;
    name: string;
    points: number;
  } | null;
  course: {
    id: number;
    title: string;
  } | null;
  activeQuest: {
    title: string;
    xp: number;
    href: string;
  } | null;
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
  isCourseCompleted: boolean;
}

const emptyHeroStats: HeroStats = {
  player: null,
  course: null,
  activeQuest: null,
  progress: {
    completed: 0,
    total: 0,
    percent: 0,
  },
  isCourseCompleted: false,
};

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

function TypewriterText({
  text,
  delay = 0,
  speed = 18,
  className,
}: TypewriterTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    let intervalId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setVisibleCharacters((current) => {
          if (current >= text.length) {
            if (intervalId !== undefined) {
              window.clearInterval(intervalId);
            }

            return current;
          }

          return current + 1;
        });
      }, speed);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [delay, shouldReduceMotion, speed, text]);

  const displayedText = shouldReduceMotion
    ? text
    : text.slice(0, visibleCharacters);

  const isFinished = shouldReduceMotion || visibleCharacters >= text.length;

  const finishTyping = () => {
    setVisibleCharacters(text.length);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLParagraphElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      finishTyping();
    }
  };

  return (
    <p
      role="button"
      tabIndex={0}
      aria-label={text}
      className={className}
      onClick={finishTyping}
      onKeyDown={handleKeyDown}
    >
      <span aria-hidden="true">{displayedText}</span>

      {!isFinished && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.55, repeat: Infinity }}
          className="ml-1 inline-block h-[0.8em] w-2 bg-[#FFD400] align-[-0.05em]"
        />
      )}
    </p>
  );
}

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { t, formatNumber } = useI18n();
  const [heroStats, setHeroStats] = useState<HeroStats>(emptyHeroStats);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const tokenMessage = t(
    "The first chapter is ready. Choose your path, learn the basics, and turn every mistake into experience.",
  );
  const commands = [
    {
      number: "01",
      label: t("Start adventure"),
      description: t("Choose your first course"),
      href: "/courses",
      primary: true,
    },
    {
      number: "02",
      label: t("Open playground"),
      description: t("Experiment with code"),
      href: "/playground",
      primary: false,
    },
  ];

  useEffect(() => {
    const controller = new AbortController();

    const loadHeroStats = async () => {
      try {
        const response = await fetch("/api/hero-stats", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load hero stats");
        }

        const data: HeroStats = await response.json();
        setHeroStats(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setHeroStats(emptyHeroStats);
      } finally {
        if (!controller.signal.aborted) {
          setIsStatsLoading(false);
        }
      }
    };

    void loadHeroStats();

    return () => controller.abort();
  }, []);

  const progressPercent = Math.min(
    100,
    Math.max(0, heroStats.progress.percent),
  );

  const playerNumber = isStatsLoading
    ? "--"
    : heroStats.player
      ? String(heroStats.player.id).padStart(2, "0")
      : t("GUEST");

  const eyebrow = isStatsLoading
    ? t("Syncing quest log...")
    : heroStats.course
      ? `${heroStats.course.title} · ${
          heroStats.isCourseCompleted
            ? t("Course complete")
            : t("Next quest")
        }`
      : t("New adventure · Choose your first course");

  const activeQuestTitle = isStatsLoading
    ? t("Loading quest...")
    : (heroStats.activeQuest?.title ??
      (heroStats.isCourseCompleted
        ? t("Course completed!")
        : heroStats.course
          ? t("No exercises available yet")
          : t("Choose your first course")));

  const activeQuestHref = heroStats.activeQuest?.href ?? "/courses";

  const questXp = isStatsLoading
    ? "-- XP"
    : heroStats.activeQuest
      ? `+${heroStats.activeQuest.xp} XP`
      : heroStats.player
        ? `${formatNumber(heroStats.player.points)} ${t("XP TOTAL")}`
        : "0 XP";

  return (
    <section className="relative isolate min-h-[calc(100svh-64px)] overflow-hidden bg-[#07080C] px-4 py-10 text-white md:px-8 md:py-14 lg:flex lg:items-center">
      <Image
        src={bgImage}
        alt=""
        fill
        priority
        unoptimized
        className="-z-30 object-cover object-center opacity-60 brightness-[0.82] contrast-[1.12] saturate-[0.86]"
      />

      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(7,8,12,0.98)_0%,rgba(7,8,12,0.9)_38%,rgba(16,21,42,0.38)_72%,rgba(7,8,12,0.74)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(7,8,12,0.86)_0%,transparent_28%,transparent_70%,rgba(7,8,12,0.97)_100%)]" />

      <motion.div
        aria-hidden="true"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                opacity: [0.25, 0.65, 0.25],
                scale: [0.9, 1.08, 0.9],
              }
        }
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[16%] right-[6%] -z-10 size-72 rounded-full bg-[#899DFF]/15 blur-3xl md:size-[28rem]"
      />

      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.72fr)] lg:items-center lg:gap-14">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <div className="mb-5 flex items-start gap-3 font-pixel text-xs uppercase tracking-[0.18em] text-[#899DFF] sm:items-center sm:text-sm sm:tracking-[0.22em] md:text-base">
            <span className="mt-2 h-px w-8 shrink-0 bg-[#FFD400] sm:mt-0 sm:w-10" />
            <span className="min-w-0 break-words">{eyebrow}</span>
          </div>

          <h1 className="font-accent text-[clamp(4.5rem,11vw,9.5rem)] leading-[0.72] tracking-tight">
            <span className="block text-[0.42em] leading-none text-white">
              <BlurOutUp stagger={35}>CODE</BlurOutUp>
            </span>

            <span className="relative mt-4 block w-fit text-[#FFD400] [text-shadow:4px_4px_0_#FF8C00]">
              <BlurOutUp delay={180} stagger={55}>
                QUEST
              </BlurOutUp>
            </span>
          </h1>

          <p className="mt-7 max-w-xl font-pixel text-2xl leading-tight text-white md:text-4xl">
            {t("Your programming adventure starts with one line of code.")}
          </p>

          <p className="mt-4 max-w-xl font-sans text-base leading-7 text-white/60 md:text-lg">
            {t(
              "Learn the fundamentals, solve practical challenges, earn XP, and unlock new chapters at your own pace.",
            )}
          </p>

          <div className="mt-7 grid max-w-xl grid-cols-3 border-y border-white/15 py-4">
            {[
              [t("LEARN"), t("New skills")],
              [t("BUILD"), t("Real projects")],
              [t("LEVEL UP"), t("Earn XP")],
            ].map(([title, subtitle], index) => (
              <div
                key={title}
                className={`px-3 first:pl-0 last:pr-0 ${
                  index > 0 ? "border-l border-white/15" : ""
                }`}
              >
                <p className="font-pixel text-base leading-tight text-[#FFD400] sm:text-lg md:text-xl">
                  {title}
                </p>
                <p className="mt-1 font-sans text-xs text-white/45 md:text-sm">
                  {subtitle}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.aside
          initial={
            shouldReduceMotion ? false : { opacity: 0, x: 50, scale: 0.96 }
          }
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          aria-label={t("Game menu")}
          className="relative z-10 mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end"
        >
          <span
            aria-hidden="true"
            className="absolute -top-3 -left-3 size-8 border-t-2 border-l-2 border-[#FFD400]"
          />
          <span
            aria-hidden="true"
            className="absolute -right-3 -bottom-3 size-8 border-r-2 border-b-2 border-[#FFD400]"
          />

          <div className="border-2 border-[#899DFF]/45 bg-[#10152A]/95 p-1 shadow-[10px_10px_0_0_rgba(2,3,7,0.72)] backdrop-blur-sm">
            <div className="border border-white/10 p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="font-pixel text-sm tracking-[0.24em] text-[#899DFF]">
                    {t("MAIN MENU")}
                  </p>
                  <h2 className="mt-1 font-pixel text-3xl text-white">
                    {t("Select command")}
                  </h2>
                </div>

                <div className="text-right font-pixel">
                  <p className="text-xs text-white/40">{t("PLAYER")}</p>
                  <p
                    className="max-w-24 truncate text-lg text-[#FFD400]"
                    title={heroStats.player?.name}
                  >
                    {playerNumber}
                  </p>
                </div>
              </div>

              <nav className="mt-5 space-y-3">
                {commands.map((command, index) => (
                  <motion.div
                    key={command.href}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.12 }}
                  >
                    <Button
                      variant={command.primary ? "default" : "outline"}
                      className={`group h-auto w-full justify-start rounded-none px-4 py-3 text-left transition-all duration-200 ${
                        command.primary
                          ? "border-2 border-black bg-[#FFD400] text-black shadow-[4px_4px_0_0_#FF8C00] hover:translate-x-1 hover:translate-y-1 hover:bg-[#FFD400] hover:shadow-none"
                          : "border border-white/10 bg-black/25 text-white hover:border-[#FFD400]/60 hover:bg-[#FFD400]/10 hover:text-[#FFD400]"
                      }`}
                    >
                      <Link href={command.href}>
                        <span className="mr-4 font-pixel text-sm opacity-50">
                          {command.number}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block font-pixel text-xl">
                            {command.label}
                          </span>
                          <span
                            className={`mt-0.5 block font-sans text-xs ${
                              command.primary
                                ? "text-black/60"
                                : "text-white/40"
                            }`}
                          >
                            {command.description}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className="ml-auto font-pixel text-lg transition-transform group-hover:translate-x-1"
                        >
                          ▶
                        </span>
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-pixel text-xs tracking-[0.2em] text-[#899DFF]">
                      {t("ACTIVE QUEST")}
                    </p>
                    <Link
                      href={activeQuestHref}
                      className="mt-1 block break-words font-pixel text-xl leading-tight text-white transition-colors hover:text-[#FFD400]"
                    >
                      {activeQuestTitle}
                    </Link>
                  </div>

                  <p className="shrink-0 font-pixel text-sm text-white/45">
                    {questXp}
                  </p>
                </div>

                <div
                  className="mt-3 h-2 border border-white/15 bg-black/40 p-px"
                  role="progressbar"
                  aria-label={t("Journey progress")}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={isStatsLoading ? 0 : progressPercent}
                >
                  <motion.div
                    initial={shouldReduceMotion ? false : { width: 0 }}
                    animate={{
                      width: `${isStatsLoading ? 0 : progressPercent}%`,
                    }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="h-full bg-[#FFD400]"
                  />
                </div>

                <div className="mt-2 flex justify-between font-pixel text-xs text-white/35">
                  <span>{t("Journey progress")}</span>
                  <span>
                    {isStatsLoading
                      ? "--"
                      : `${heroStats.progress.completed}/${heroStats.progress.total} · ${progressPercent}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 lg:col-span-2"
        >
          <div className="relative border-2 border-[#899DFF]/45 bg-[#10152A]/95 p-1 shadow-[8px_8px_0_0_rgba(2,3,7,0.75)] backdrop-blur-sm">
            <div className="relative min-h-36 border border-white/10 py-5 pr-4 pl-24 sm:pr-5 sm:pl-32 md:min-h-40 md:py-6 md:pr-8 md:pl-44">
              <div className="absolute bottom-0 left-2 h-[calc(100%+1.25rem)] w-20 overflow-hidden sm:left-3 sm:w-28 md:left-7 md:w-32">
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : { y: [0, -4, 0], rotate: [0, -0.5, 0, 0.5, 0] }
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative size-full"
                >
                  <Image
                    src={Token}
                    alt={t("Token, the Quest Master")}
                    fill
                    priority
                    unoptimized
                    sizes="128px"
                    className="origin-bottom object-contain object-bottom [image-rendering:pixelated]"
                    style={{ transform: "scale(1.18)" }}
                  />
                </motion.div>
              </div>

              <span className="absolute -top-4 left-20 border-2 border-black bg-[#FFD400] px-3 py-1 font-pixel text-base text-black shadow-[3px_3px_0_0_#FF8C00] sm:left-28 sm:px-4 sm:text-lg md:left-40">
                LERAY
              </span>

              <TypewriterText
                text={tokenMessage}
                delay={950}
                speed={16}
                className="cursor-pointer break-words font-pixel text-lg leading-relaxed text-white outline-none sm:text-xl md:text-2xl"
              />

              <p className="mt-3 hidden font-pixel text-xs uppercase tracking-[0.18em] text-white/35 sm:block">
                {t("Click the dialogue to reveal the full message")}
              </p>

              <motion.span
                aria-hidden="true"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, 5, 0], opacity: [0.45, 1, 0.45] }
                }
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-4 bottom-3 font-pixel text-xl text-[#FFD400]"
              >
                ▼
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CRT screen treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.18)_72%,rgba(0,0,0,0.72)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40 opacity-[0.13] [background-image:repeating-linear-gradient(0deg,rgba(0,0,0,0.62)_0px,rgba(0,0,0,0.62)_1px,transparent_1px,transparent_4px)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40 opacity-[0.035] [background-image:repeating-linear-gradient(90deg,rgba(255,30,30,0.8)_0px,rgba(255,30,30,0.8)_1px,rgba(40,255,120,0.8)_1px,rgba(40,255,120,0.8)_2px,rgba(70,100,255,0.9)_2px,rgba(70,100,255,0.9)_3px)]"
      />
    </section>
  );
}
