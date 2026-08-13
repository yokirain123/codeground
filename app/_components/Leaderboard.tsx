"use client";

import { useEffect, useState } from "react";

import { Crown, Medal, RefreshCw, Swords, Trophy, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

interface LeaderboardPlayer {
  rank: number;
  id: number;
  name: string;
  imageUrl: string | null;
  points: number;
  completedExercises: number;
}

interface LeaderboardResponse {
  players: LeaderboardPlayer[];
  currentPlayer: LeaderboardPlayer | null;
  totalPlayers: number;
}

type LoadingStatus = "loading" | "ready" | "error";

const emptyLeaderboard: LeaderboardResponse = {
  players: [],
  currentPlayer: null,
  totalPlayers: 0,
};

const numberFormatter = new Intl.NumberFormat("en-US");

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "?";
}

function PlayerAvatar({ player }: { player: LeaderboardPlayer }) {
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(player.imageUrl) && !hasImageError;

  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden border border-[#899DFF]/45 bg-[#899DFF]/10 font-pixel text-sm text-[#AAB8FF] sm:size-11">
      {shouldShowImage ? (
        // A regular img keeps Clerk-hosted avatars working without next.config changes.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.imageUrl ?? undefined}
          alt=""
          loading={player.rank <= 3 ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(player.name)}</span>
      )}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span
        aria-label="Rank 1"
        className="flex size-10 items-center justify-center border-2 border-[#FFD400] bg-[#FFD400]/10 text-[#FFD400] shadow-[3px_3px_0_#020307]"
      >
        <Crown aria-hidden="true" className="size-5" strokeWidth={2.4} />
      </span>
    );
  }

  if (rank === 2) {
    return (
      <span
        aria-label="Rank 2"
        className="flex size-10 items-center justify-center border-2 border-[#C9D2E3] bg-[#C9D2E3]/10 text-[#C9D2E3] shadow-[3px_3px_0_#020307]"
      >
        <Medal aria-hidden="true" className="size-5" strokeWidth={2.4} />
      </span>
    );
  }

  if (rank === 3) {
    return (
      <span
        aria-label="Rank 3"
        className="flex size-10 items-center justify-center border-2 border-[#C9865A] bg-[#C9865A]/10 text-[#E5A174] shadow-[3px_3px_0_#020307]"
      >
        <Medal aria-hidden="true" className="size-5" strokeWidth={2.4} />
      </span>
    );
  }

  return (
    <span
      aria-label={`Rank ${rank}`}
      className="flex size-10 items-center justify-center border border-[#899DFF]/40 bg-[#07080C] font-pixel text-sm text-white/55"
    >
      {String(rank).padStart(2, "0")}
    </span>
  );
}

function PlayerRow({
  player,
  isCurrentPlayer,
  animationDelay,
}: {
  player: LeaderboardPlayer;
  isCurrentPlayer: boolean;
  animationDelay: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      initial={shouldReduceMotion ? false : { opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay: shouldReduceMotion ? 0 : animationDelay,
      }}
      className={`grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_7rem_7rem] sm:gap-4 sm:px-6 ${
        isCurrentPlayer
          ? "bg-[#FFD400]/[0.07] shadow-[inset_4px_0_0_#FFD400]"
          : "transition-colors hover:bg-[#899DFF]/[0.045]"
      }`}
    >
      <RankBadge rank={player.rank} />

      <div className="flex min-w-0 items-center gap-3">
        <PlayerAvatar player={player} />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-pixel text-base text-white sm:text-lg">
              {player.name}
            </p>

            {isCurrentPlayer && (
              <span className="shrink-0 border border-[#FFD400]/60 bg-[#FFD400]/10 px-1.5 py-0.5 font-pixel text-[9px] uppercase tracking-wider text-[#FFD400]">
                You
              </span>
            )}
          </div>

          <p className="mt-1 font-pixel text-[11px] text-white/40 sm:hidden">
            {numberFormatter.format(player.completedExercises)} quests cleared
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-end gap-2 text-white/55 sm:flex">
        <Swords aria-hidden="true" className="size-4 text-[#899DFF]" />
        <span className="font-pixel text-sm">
          {numberFormatter.format(player.completedExercises)}
        </span>
      </div>

      <div className="text-right">
        <p className="font-pixel text-lg text-[#FFD400] sm:text-xl">
          {numberFormatter.format(player.points)}
        </p>
        <p className="font-pixel text-[9px] uppercase tracking-[0.18em] text-white/35">
          XP
        </p>
      </div>
    </motion.li>
  );
}

function LoadingRows() {
  return (
    <div
      aria-label="Loading leaderboard"
      className="divide-y divide-[#899DFF]/15"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={`leaderboard-skeleton-${index}`}
          className="grid animate-pulse grid-cols-[2.75rem_minmax(0,1fr)_4rem] items-center gap-3 px-4 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_7rem_7rem] sm:gap-4 sm:px-6"
        >
          <span className="size-10 bg-white/[0.06]" />
          <div className="flex items-center gap-3">
            <span className="size-10 shrink-0 bg-white/[0.06] sm:size-11" />
            <span className="h-4 w-28 max-w-[60%] bg-white/[0.06]" />
          </div>
          <span className="hidden h-4 w-10 justify-self-end bg-white/[0.06] sm:block" />
          <span className="h-5 w-14 justify-self-end bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

export default function Leaderboard() {
  const shouldReduceMotion = useReducedMotion();
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardResponse>(emptyLeaderboard);
  const [status, setStatus] = useState<LoadingStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadLeaderboard = async () => {
      setStatus("loading");

      try {
        const response = await fetch("/api/leaderboard", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load leaderboard");
        }

        const data = (await response.json()) as LeaderboardResponse;

        if (!controller.signal.aborted) {
          setLeaderboard({
            players: Array.isArray(data.players) ? data.players : [],
            currentPlayer: data.currentPlayer ?? null,
            totalPlayers: Number(data.totalPlayers) || 0,
          });
          setStatus("ready");
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setLeaderboard(emptyLeaderboard);
          setStatus("error");
        }
      }
    };

    void loadLeaderboard();

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <section className="relative overflow-hidden bg-[#07080C] px-5 py-20 sm:px-8 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-24 size-72 rounded-full bg-[#899DFF]/10 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 size-72 rounded-full bg-[#FFD400]/[0.07] blur-[110px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-[#899DFF]">
            <Trophy aria-hidden="true" className="size-5" />
            <p className="font-pixel text-sm uppercase tracking-[0.3em]">
              Community ranking
            </p>
          </div>

          <h2 className="font-pixel text-4xl uppercase text-white [text-shadow:4px_4px_0_#020307] sm:text-5xl lg:text-6xl">
            Hall of <span className="text-[#FFD400]">Heroes</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl font-pixel text-base leading-relaxed text-white/55 sm:text-lg">
            Real XP. Real completed coding quests. See who is leading the
            CodeQuest journey and where you stand.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:items-stretch">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="overflow-hidden border-2 border-[#899DFF]/50 bg-[#10152A] shadow-[8px_8px_0_#020307]"
          >
            <div className="flex flex-col gap-3 border-b-2 border-[#899DFF]/30 bg-[#0B0F20] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="font-pixel text-lg uppercase text-white">
                  Top adventurers
                </p>
                <p className="mt-1 font-pixel text-xs text-white/35">
                  XP decides rank · cleared quests break ties
                </p>
              </div>

              <div className="flex items-center gap-2 text-white/45">
                <Users aria-hidden="true" className="size-4 text-[#899DFF]" />
                <span className="font-pixel text-xs uppercase tracking-wider">
                  {status === "loading"
                    ? "Loading players"
                    : `${numberFormatter.format(leaderboard.totalPlayers)} players`}
                </span>
              </div>
            </div>

            {status === "loading" && <LoadingRows />}

            {status === "error" && (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
                <Trophy aria-hidden="true" className="size-10 text-white/15" />
                <p className="mt-4 font-pixel text-lg text-white">
                  The ranking board is unavailable
                </p>
                <p className="mt-2 max-w-sm font-pixel text-sm leading-relaxed text-white/40">
                  The quest data could not be loaded. Try once more.
                </p>
                <button
                  type="button"
                  onClick={() => setReloadKey((current) => current + 1)}
                  className="mt-6 inline-flex items-center gap-2 border-2 border-[#899DFF] bg-[#899DFF]/10 px-4 py-2 font-pixel text-sm uppercase text-[#AAB8FF] shadow-[4px_4px_0_#020307] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Retry
                </button>
              </div>
            )}

            {status === "ready" && leaderboard.players.length === 0 && (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
                <Crown
                  aria-hidden="true"
                  className="size-11 text-[#FFD400]/35"
                />
                <p className="mt-4 font-pixel text-xl text-white">
                  The throne is empty
                </p>
                <p className="mt-2 max-w-md font-pixel text-sm leading-relaxed text-white/40">
                  Complete the first coding quest and become hero number one.
                </p>
              </div>
            )}

            {status === "ready" && leaderboard.players.length > 0 && (
              <ol className="divide-y divide-[#899DFF]/15">
                {leaderboard.players.map((player, index) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    isCurrentPlayer={
                      leaderboard.currentPlayer?.id === player.id
                    }
                    animationDelay={index * 0.055}
                  />
                ))}
              </ol>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
