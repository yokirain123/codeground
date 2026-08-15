"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  Swords,
  UserMinus,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import PlayerAvatar from "@/components/friends/PlayerAvatar";
import type { PlayerProfileResponse } from "@/lib/friends/types";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export default function PlayerProfile() {
  const params = useParams<{ userId: string | string[] }>();
  const rawUserId = Array.isArray(params.userId)
    ? params.userId[0]
    : params.userId;
  const userId = rawUserId ? decodeURIComponent(rawUserId) : "";

  const [profile, setProfile] = useState<PlayerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      const data = await requestJson<PlayerProfileResponse>(
        `/api/profiles/${encodeURIComponent(userId)}`,
      );
      setProfile(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load player profile.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="flex min-h-[65svh] items-center justify-center text-[#899DFF]">
        <Loader2 className="size-7 animate-spin" />
        <span className="ml-3 font-pixel text-lg">Loading player...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex min-h-[65svh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="font-pixel text-3xl text-white">Player unavailable</h1>
        <p className="mt-3 font-sans text-white/45">
          {error || "This CodeQuest profile could not be found."}
        </p>
        <Link
          href="/friends"
          className="mt-6 border-2 border-black bg-[#FFD400] px-5 py-2.5 font-pixel text-lg text-black shadow-[3px_3px_0_#FF8C00]"
        >
          Back to friends
        </Link>
      </div>
    );
  }

  const { player } = profile;

  const sendRequest = async () => {
    setBusy(true);
    try {
      const result = await requestJson<{ autoAccepted?: boolean }>(
        "/api/friends/requests",
        {
          method: "POST",
          body: JSON.stringify({ userId: player.userId }),
        },
      );
      toast.success(
        result.autoAccepted
          ? `${player.name} joined your party.`
          : `Friend request sent to ${player.name}.`,
      );
      await loadProfile();
    } catch (actionError) {
      toast.error(
        actionError instanceof Error ? actionError.message : "Request failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const acceptRequest = async () => {
    if (!player.relationshipId) return;
    setBusy(true);
    try {
      await requestJson(`/api/friends/requests/${player.relationshipId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "accept" }),
      });
      toast.success(`${player.name} is now your friend.`);
      await loadProfile();
    } catch (actionError) {
      toast.error(
        actionError instanceof Error ? actionError.message : "Request failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const removeFriend = async () => {
    if (!player.relationshipId) return;
    if (!window.confirm(`Remove ${player.name} from your friends?`)) return;
    setBusy(true);
    try {
      await requestJson(`/api/friends/${player.relationshipId}`, {
        method: "DELETE",
      });
      toast.success(`${player.name} was removed from your friends.`);
      await loadProfile();
    } catch (actionError) {
      toast.error(
        actionError instanceof Error ? actionError.message : "Request failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const cancelRequest = async () => {
    if (!player.relationshipId) return;
    setBusy(true);
    try {
      await requestJson(`/api/friends/requests/${player.relationshipId}`, {
        method: "DELETE",
      });
      toast.success("Friend request cancelled.");
      await loadProfile();
    } catch (actionError) {
      toast.error(
        actionError instanceof Error ? actionError.message : "Request failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const joinedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(player.joinedAt));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <Link
        href="/friends"
        className="inline-flex items-center gap-2 font-pixel text-sm text-[#899DFF] transition hover:text-white"
      >
        <ArrowLeft className="size-4" /> Back to friends
      </Link>

      <section className="relative mt-5 overflow-hidden border-2 border-[#899DFF]/45 bg-[#10152A] p-6 shadow-[7px_7px_0_#020307] sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#899DFF]/12 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/4 size-64 rounded-full bg-[#FFD400]/[0.055] blur-[100px]"
        />

        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">
          <PlayerAvatar
            name={player.name}
            imageUrl={player.avatarUrl}
            size="lg"
            className="border-[#FFD400] shadow-[5px_5px_0_#FF8C00]"
          />

          <div className="min-w-0 flex-1">
            <p className="font-pixel text-xs uppercase tracking-[0.25em] text-[#899DFF]">
              CodeQuest adventurer
            </p>
            <h1 className="mt-2 break-words font-pixel text-4xl text-white sm:text-5xl lg:text-6xl">
              {player.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-pixel text-xl text-[#FFD400]">
                {Math.max(0, player.points).toLocaleString("en-US")} XP
              </span>
              <span className="flex items-center gap-2 font-sans text-sm text-white/40">
                <CalendarDays className="size-4 text-[#899DFF]" /> Joined{" "}
                {joinedDate}
              </span>
            </div>
          </div>

          <div className="sm:self-end">{renderRelationshipAction()}</div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Quests cleared",
            value: player.stats.completedExercises,
            icon: Swords,
          },
          {
            label: "Courses joined",
            value: player.stats.enrolledCourses,
            icon: BookOpen,
          },
          { label: "Friends", value: player.stats.friends, icon: UsersRound },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="flex items-center gap-4 border-2 border-[#899DFF]/30 bg-[#10152A] p-5 shadow-[5px_5px_0_#020307]"
            >
              <span className="flex size-12 items-center justify-center border border-[#899DFF]/25 bg-[#899DFF]/5 text-[#899DFF]">
                <Icon className="size-6" />
              </span>
              <div>
                <p className="font-pixel text-3xl text-[#FFD400]">
                  {stat.value}
                </p>
                <p className="font-sans text-sm text-white/40">{stat.label}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <BookOpen className="size-5 text-[#899DFF]" />
          <h2 className="font-pixel text-3xl text-white">Current courses</h2>
        </div>

        {player.courses.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {player.courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group border-2 border-[#899DFF]/30 bg-[#10152A] p-5 shadow-[4px_4px_0_#020307] transition hover:border-[#FFD400]/60"
              >
                <p className="font-pixel text-[10px] uppercase tracking-[0.18em] text-[#899DFF]">
                  {course.level}
                </p>
                <h3 className="mt-2 font-pixel text-2xl text-white group-hover:text-[#FFD400]">
                  {course.title}
                </h3>
                <p className="mt-3 font-pixel text-sm text-[#FFD400]">
                  {Math.max(0, course.xpEarned).toLocaleString("en-US")} course
                  XP
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-5 border-2 border-dashed border-[#899DFF]/20 bg-[#10152A]/40 p-8 text-center font-sans text-white/40">
            This adventurer has not joined a course yet.
          </div>
        )}
      </section>
    </div>
  );

  function renderRelationshipAction() {
    const baseClass =
      "flex h-12 min-w-44 items-center justify-center gap-2 px-5 font-pixel text-base transition disabled:cursor-wait disabled:opacity-55";

    if (player.relationship === "self") {
      return (
        <span
          className={`${baseClass} border border-[#899DFF]/30 bg-[#899DFF]/5 text-[#AAB8FF]`}
        >
          Your profile
        </span>
      );
    }

    if (player.relationship === "none") {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => void sendRequest()}
          className={`${baseClass} cursor-pointer border-2 border-black bg-[#FFD400] text-black shadow-[4px_4px_0_#FF8C00] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#FF8C00]`}
        >
          <UserPlus className="size-5" /> {busy ? "Sending..." : "Add friend"}
        </button>
      );
    }

    if (player.relationship === "incoming_pending") {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => void acceptRequest()}
          className={`${baseClass} cursor-pointer border-2 border-[#6FFFA2] bg-[#6FFFA2]/10 text-[#6FFFA2] hover:bg-[#6FFFA2] hover:text-[#07080C]`}
        >
          <Check className="size-5" />{" "}
          {busy ? "Accepting..." : "Accept request"}
        </button>
      );
    }

    if (player.relationship === "outgoing_pending") {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => void cancelRequest()}
          className={`${baseClass} cursor-pointer border border-[#899DFF]/30 bg-[#899DFF]/5 text-[#899DFF] hover:border-red-400/45 hover:bg-red-400/10 hover:text-red-300`}
        >
          <Clock3 className="size-5" />{" "}
          {busy ? "Cancelling..." : "Cancel request"}
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => void removeFriend()}
        className={`${baseClass} cursor-pointer border border-white/15 bg-white/[0.025] text-white/55 hover:border-red-400/45 hover:bg-red-400/10 hover:text-red-300`}
      >
        <UserMinus className="size-5" />{" "}
        {busy ? "Removing..." : "Remove friend"}
      </button>
    );
  }
}
