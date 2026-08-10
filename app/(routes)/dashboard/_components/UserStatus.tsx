"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";

import Star from "@/components/images/blink.png";
import Badge from "@/components/images/label.png";
import Streak from "@/components/images/confetti.png";

import {
  ProfileAvatar,
} from "@/components/profile-avatar";

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  metric:
    | "exercises_completed"
    | "points_earned"
    | "streak";
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

export default function UserStatus() {
  const [
    dashboardData,
    setDashboardData,
  ] =
    useState<DashboardStats | null>(
      null,
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    const loadStats = async () => {
      try {
        const response = await fetch(
          "/api/dashboard-stats",
          {
            method: "GET",
            cache: "no-store",
            signal:
              controller.signal,
          },
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load stats",
          );
        }

        if (
          !controller.signal.aborted
        ) {
          setDashboardData(data);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Dashboard stats error:",
          error,
        );

        if (
          !controller.signal.aborted
        ) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load stats",
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
      <div className="border border-red-400 p-5 text-red-400">
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="border border-accent p-6 shadow-[4px_4px_0_0_#FF8C00]">
        <p className="text-xl text-accent">
          Loading stats...
        </p>
      </div>
    );
  }

  const {
    user,
    stats,
    achievements,
  } = dashboardData;

  return (
    <aside className="border border-accent px-6 py-5 shadow-[4px_4px_0_0_#FF8C00]">
      <div className="flex items-center gap-5">
        <ProfileAvatar />

        <div className="min-w-0">
          <h2 className="truncate text-3xl">
            {user.name}
          </h2>

          <p className="truncate text-lg text-foreground/50">
            {user.email}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <div className="flex items-center gap-3">
          <Image
            src={Star}
            alt=""
            width={50}
            height={50}
          />

          <div>
            <p className="text-3xl text-accent">
              {stats.totalPoints}
            </p>

            <p className="text-xl">
              Total points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={Badge}
            alt=""
            width={50}
            height={50}
          />

          <div>
            <p className="text-3xl text-accent">
              {stats.badges}/{achievements.length}
            </p>

            <p className="text-xl">
              Achievements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={Streak}
            alt=""
            width={50}
            height={50}
          />

          <div>
            <p className="text-3xl text-accent">
              {stats.streak}
            </p>

            <p className="text-xl">
              Day streak
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}