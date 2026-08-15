"use client";

import Link from "next/link";

import { Check, ExternalLink, UserMinus, UserPlus, X } from "lucide-react";

import type { PublicPlayer } from "@/lib/friends/types";

import PlayerAvatar from "./PlayerAvatar";

interface PlayerCardProps {
  player: PublicPlayer;
  busy?: boolean;
  onAdd?: (player: PublicPlayer) => void;
  onAccept?: (player: PublicPlayer) => void;
  onCancel?: (player: PublicPlayer) => void;
  onRemove?: (player: PublicPlayer) => void;
}

const numberFormatter = new Intl.NumberFormat("en-US");

export default function PlayerCard({
  player,
  busy = false,
  onAdd,
  onAccept,
  onCancel,
  onRemove,
}: PlayerCardProps) {
  const renderAction = () => {
    if (player.relationship === "none") {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => onAdd?.(player)}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 border-2 border-black bg-[#FFD400] px-3 font-pixel text-sm text-black shadow-[3px_3px_0_#FF8C00] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#FF8C00] disabled:cursor-wait disabled:opacity-55"
        >
          <UserPlus className="size-4" />
          {busy ? "Sending..." : "Add friend"}
        </button>
      );
    }

    if (player.relationship === "incoming_pending") {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => onAccept?.(player)}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 border-2 border-[#6FFFA2] bg-[#6FFFA2]/10 px-3 font-pixel text-sm text-[#6FFFA2] transition hover:bg-[#6FFFA2] hover:text-[#07080C] disabled:cursor-wait disabled:opacity-55"
        >
          <Check className="size-4" />
          {busy ? "Accepting..." : "Accept"}
        </button>
      );
    }

    if (player.relationship === "outgoing_pending") {
      return (
        <button
          type="button"
          disabled={busy || !onCancel}
          onClick={() => onCancel?.(player)}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 border border-[#899DFF]/25 bg-[#899DFF]/5 px-3 font-pixel text-sm text-[#899DFF] transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-default disabled:opacity-60"
        >
          <X className="size-4" />
          {busy
            ? "Cancelling..."
            : onCancel
              ? "Cancel request"
              : "Request sent"}
        </button>
      );
    }

    if (player.relationship === "friends") {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove?.(player)}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 border border-white/15 bg-white/[0.025] px-3 font-pixel text-sm text-white/55 transition hover:border-red-400/45 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-wait disabled:opacity-55"
        >
          <UserMinus className="size-4" />
          {busy ? "Removing..." : "Remove"}
        </button>
      );
    }

    return null;
  };

  return (
    <article className="group flex min-w-0 flex-col border-2 border-[#899DFF]/30 bg-[#10152A] p-4 shadow-[5px_5px_0_#020307] transition-colors hover:border-[#899DFF]/60">
      <div className="flex min-w-0 items-center gap-4">
        <PlayerAvatar name={player.name} imageUrl={player.avatarUrl} />

        <div className="min-w-0 flex-1">
          <Link
            href={`/players/${encodeURIComponent(player.userId)}`}
            className="group/link flex min-w-0 items-center gap-2"
          >
            <h3 className="truncate font-pixel text-xl text-white group-hover/link:text-[#FFD400]">
              {player.name}
            </h3>
            <ExternalLink className="size-3.5 shrink-0 text-white/25 group-hover/link:text-[#FFD400]" />
          </Link>
          <p className="mt-1 font-pixel text-xs uppercase tracking-[0.16em] text-[#FFD400]">
            {numberFormatter.format(Math.max(0, player.points))} XP
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/players/${encodeURIComponent(player.userId)}`}
          className="flex h-10 items-center justify-center border border-[#899DFF]/30 bg-[#899DFF]/5 px-3 font-pixel text-sm text-[#AAB8FF] transition hover:border-[#899DFF] hover:bg-[#899DFF]/10"
        >
          View profile
        </Link>
        {renderAction()}
      </div>
    </article>
  );
}
