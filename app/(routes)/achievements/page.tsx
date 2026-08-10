"use client";

import { useEffect, useState } from "react";

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
      <div className="border border-red-400 p-5 text-red-400">{error}</div>
    );
  }

  if (!data) {
    return (
      <div className="border border-accent p-6 shadow-[4px_4px_0_0_#FF8C00]">
        <p className="text-xl text-accent">Loading achievements...</p>
      </div>
    );
  }

  const { stats, achievements } = data;

  return (
    <main className="px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl text-accent">Achievements</h1>

        <span className="text-lg text-foreground/50">
          {stats.badges}/{achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {achievements.map((achievement) => (
          <article
            key={achievement.id}
            title={achievement.description}
            className={`border p-3 transition-colors ${
              achievement.isUnlocked
                ? "border-accent bg-accent/10"
                : "border-border bg-card opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`text-3xl ${
                  achievement.isUnlocked ? "" : "grayscale"
                }`}
              >
                {achievement.icon}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="truncate text-xl">{achievement.name}</h4>

                  <span className="shrink-0 text-sm text-foreground/50">
                    {achievement.currentValue}/{achievement.target}
                  </span>
                </div>

                <p className="text-sm text-foreground/50">
                  {achievement.description}
                </p>

                <div className="mt-2 h-2 overflow-hidden border border-border bg-background">
                  <div
                    className={
                      achievement.isUnlocked
                        ? "h-full bg-[#62FB60]"
                        : "h-full bg-accent"
                    }
                    style={{
                      width: `${achievement.progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}