"use client";

import { useEffect, useState } from "react";

import Image, { type StaticImageData } from "next/image";

import Star from "@/components/images/blink.png";
import Streak from "@/components/images/confetti.png";
import Badge from "@/components/images/label.png";
import { ProfileAvatar } from "@/components/profile-avatar";

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

interface DashboardStats {
  user: {
    name: string;
    email: string;
  };
  stats: {
    totalPoints: number;
    badges: number;
    streak: number;
    completedExercises: number;
  };
  achievements: Achievement[];
}

interface StatItem {
  label: string;
  value: string;
  icon: StaticImageData;
}

export default function UserStatus() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadStats = async () => {
      try {
        setError("");

        const response = await fetch("/api/dashboard-stats", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          throw new Error("The server returned an invalid response");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load stats");
        }

        if (!controller.signal.aborted) {
          setDashboardData(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Dashboard stats error:", error);

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
      <aside className="border border-red-400/40 bg-red-400/10 p-5" role="alert">
        <p className="font-pixel text-red-400">{error}</p>
      </aside>
    );
  }

  if (!dashboardData) {
    return (
      <aside className="animate-pulse border-2 border-[#899DFF]/25 bg-[#10152A] p-6 shadow-[5px_5px_0_#020307]">
        <div className="h-14 w-3/4 bg-white/5" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 bg-white/[0.035]" />
          ))}
        </div>
      </aside>
    );
  }

  const { user, stats, achievements } = dashboardData;

  const statItems: StatItem[] = [
    {
      label: "Total points",
      value: String(Math.max(0, stats.totalPoints)),
      icon: Star,
    },
    {
      label: "Achievements",
      value: `${Math.max(0, stats.badges)}/${achievements.length}`,
      icon: Badge,
    },
    {
      label: "Day streak",
      value: String(Math.max(0, stats.streak)),
      icon: Streak,
    },
  ];

  return (
    <aside className="border-2 border-[#899DFF]/45 bg-[#10152A] px-5 py-5 shadow-[6px_6px_0_#020307] sm:px-6">
      <p className="font-pixel text-xs uppercase tracking-[0.22em] text-[#899DFF]">
        Player profile
      </p>

      <div className="mt-4 flex items-center gap-4 border-b border-white/10 pb-5">
        <ProfileAvatar />

        <div className="min-w-0">
          <h2 className="truncate font-pixel text-2xl text-white sm:text-3xl">
            {user.name || "Adventurer"}
          </h2>
          <p className="mt-1 truncate font-sans text-sm text-white/40">
            {user.email}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="flex min-w-0 items-center gap-3 border border-white/10 bg-black/15 p-3"
          >
            <div className="flex size-12 shrink-0 items-center justify-center border border-[#899DFF]/20 bg-[#899DFF]/5">
              <Image
                src={item.icon}
                alt=""
                width={40}
                height={40}
                className="object-contain [image-rendering:pixelated]"
              />
            </div>

            <div className="min-w-0">
              <p className="font-pixel text-2xl text-[#FFD400]">
                {item.value}
              </p>
              <p className="truncate font-sans text-sm text-white/45">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 font-pixel text-sm">
        <span className="text-white/40">Exercises cleared</span>
        <span className="text-[#6FFFA2]">
          {Math.max(0, stats.completedExercises)}
        </span>
      </div>
    </aside>
  );
}