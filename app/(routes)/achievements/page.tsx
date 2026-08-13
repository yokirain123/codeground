"use client";

import { useEffect, useState } from "react";

import Footer from "@/app/_components/Footer";
import TokenStateScreen from "@/components/TokenStateScreen";

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
          throw new Error(json.error || "Failed to load stats");
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
            error instanceof Error ? error.message : "Failed to load stats",
          );
        }
      }
    };

    void loadStats();

    return () => {
      controller.abort();
    };
  }, []);

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

  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 lg:px-12">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-pixel text-sm uppercase tracking-[0.25em] text-[#899DFF]">
              Trophy archive
            </p>
            <h1 className="mt-2 font-pixel text-4xl text-white [text-shadow:3px_3px_0_#28336B] md:text-5xl">
              Your <span className="text-[#FFD400] [text-shadow:3px_3px_0_#FF8C00]">achievements</span>
            </h1>
          </div>

          <span className="border border-[#899DFF]/45 bg-[#10152A] px-4 py-2 font-pixel text-lg text-[#FFD400]">
            {stats.badges}/{achievements.length}
          </span>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <article
              key={achievement.id}
              title={achievement.description}
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
                    <h4 className="truncate font-pixel text-xl text-white">
                      {achievement.name}
                    </h4>

                    <span className="shrink-0 font-pixel text-sm text-[#899DFF]">
                      {achievement.currentValue}/{achievement.target}
                    </span>
                  </div>

                  <p className="mt-1 font-sans text-sm text-white/50">
                    {achievement.description}
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
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}