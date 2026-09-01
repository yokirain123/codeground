"use client";

import { useEffect, useState } from "react";

import Footer from "@/app/_components/Footer";
import TokenStateScreen from "@/components/TokenStateScreen";
import { useI18n } from "@/components/i18n/I18nProvider";

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  metric: "exercises_completed" | "points_earned" | "streak";
  target: number;
  currentValue: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementsResponse {
  stats: {
    badges: number;
  };
  achievements: Achievement[];
}

export default function AchievementsPage() {
  const { locale, t, formatNumber, translateMessage } = useI18n();
  const [data, setData] = useState<AchievementsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadStats = async () => {
      try {
        const response = await fetch("/api/dashboard-stats", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || t("Failed to load stats"));
        }

        if (!controller.signal.aborted) {
          setData(json);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Achievements page error:", error);

        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? translateMessage(error.message)
              : t("Failed to load stats"),
          );
        }
      }
    };

    void loadStats();

    return () => {
      controller.abort();
    };
  }, [t, translateMessage]);

  if (error) {
    return (
      <main className="flex min-h-[calc(100svh-64px)] items-center justify-center bg-[#07080C] p-6">
        <div className="border border-red-400/30 bg-red-400/10 p-5 font-pixel text-red-400">
          {error}
        </div>
      </main>
    );
  }

  if (!data) {
    return <TokenStateScreen mode="loading" />;
  }

  const { stats, achievements } = data;

  const achievementCopy = (achievement: Achievement) => {
    if (locale === "en") {
      return {
        name: achievement.name,
        description: achievement.description,
      };
    }

    const count = formatNumber(achievement.target);

    if (achievement.metric === "points_earned") {
      return {
        name: t("XP milestone · {count}", { count }),
        description: t("Earn {count} XP.", { count }),
      };
    }

    if (achievement.metric === "streak") {
      return {
        name: t("Streak milestone · {count}", { count }),
        description: t("Keep a {count}-day learning streak.", { count }),
      };
    }

    return {
      name: t("Exercise milestone · {count}", { count }),
      description: t("Complete {count} coding exercises.", { count }),
    };
  };

  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:px-10 lg:px-12">
        <div className="mb-8 flex flex-col items-start gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-pixel text-sm uppercase tracking-[0.25em] text-[#899DFF]">
              {t("Trophy archive")}
            </p>
            <h1 className="mt-2 break-words font-pixel text-3xl text-white [text-shadow:3px_3px_0_#28336B] sm:text-4xl md:text-5xl">
              {t("Your")} {" "}
              <span className="text-[#FFD400] [text-shadow:3px_3px_0_#FF8C00]">
                {t("achievements")}
              </span>
            </h1>
          </div>

          <span className="border border-[#899DFF]/45 bg-[#10152A] px-4 py-2 font-pixel text-lg text-[#FFD400]">
            {formatNumber(stats.badges)}/{formatNumber(achievements.length)}
          </span>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const copy = achievementCopy(achievement);

            return (
              <article
              key={achievement.id}
              title={copy.description}
              className={`border-2 p-4 shadow-[5px_5px_0_0_#020307] transition-all ${
                achievement.isUnlocked
                  ? "border-[#899DFF]/45 bg-[#10152A] hover:border-[#FFD400]/70"
                  : "border-white/10 bg-[#0C0E15] opacity-55"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`text-3xl ${achievement.isUnlocked ? "" : "grayscale"}`}
                >
                  {achievement.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="line-clamp-2 break-words font-pixel text-xl leading-tight text-white">
                      {copy.name}
                    </h4>

                    <span className="shrink-0 font-pixel text-sm text-[#899DFF]">
                      {formatNumber(achievement.currentValue)}/
                      {formatNumber(achievement.target)}
                    </span>
                  </div>

                  <p className="mt-1 font-sans text-sm text-white/50">
                    {copy.description}
                  </p>

                  <div className="mt-3 h-2 overflow-hidden border border-white/15 bg-black/40 p-px">
                    <div
                      className={
                        achievement.isUnlocked
                          ? "h-full bg-[#6FFFA2]"
                          : "h-full bg-[#FFD400]"
                      }
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
