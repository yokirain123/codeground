"use client";

import Link from "next/link";

import { Check, ExternalLink, UserMinus, UserPlus, X } from "lucide-react";

import { useI18n } from "@/components/i18n/I18nProvider";
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

/**
 * Displays a player's profile summary and relationship-specific action.
 *
 * @param player - The public player whose information and relationship status are displayed
 * @param busy - Whether the available relationship action is currently in progress
 * @returns The rendered player card
 */
export default function PlayerCard({
  player,
  busy = false,
  onAdd,
  onAccept,
  onCancel,
  onRemove,
}: PlayerCardProps) {
  const { t, formatNumber } = useI18n();

  const renderAction = () => {
    if (player.relationship === "none") {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => onAdd?.(player)}
          className="flex min-h-10 cursor-pointer items-center justify-center gap-2 border-2 border-black bg-[#FFD400] px-3 py-2 font-pixel text-sm whitespace-normal text-black shadow-[3px_3px_0_#FF8C00] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#FF8C00] disabled:cursor-wait disabled:opacity-55"
        >
          <UserPlus className="size-4" />
          {busy ? t("Sending...") : t("Add friend")}
        </button>
      );
    }

    if (player.relationship === "incoming_pending") {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => onAccept?.(player)}
          className="flex min-h-10 cursor-pointer items-center justify-center gap-2 border-2 border-[#6FFFA2] bg-[#6FFFA2]/10 px-3 py-2 font-pixel text-sm whitespace-normal text-[#6FFFA2] transition hover:bg-[#6FFFA2] hover:text-[#07080C] disabled:cursor-wait disabled:opacity-55"
        >
          <Check className="size-4" />
          {busy ? t("Accepting...") : t("Accept")}
        </button>
      );
    }

    if (player.relationship === "outgoing_pending") {
      return (
        <button
          type="button"
          disabled={busy || !onCancel}
          onClick={() => onCancel?.(player)}
          className="flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-[#899DFF]/25 bg-[#899DFF]/5 px-3 py-2 font-pixel text-sm whitespace-normal text-[#899DFF] transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-default disabled:opacity-60"
        >
          <X className="size-4" />
          {busy
            ? t("Cancelling...")
            : onCancel
              ? t("Cancel request")
              : t("Request sent")}
        </button>
      );
    }

    if (player.relationship === "friends") {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove?.(player)}
          className="flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-white/15 bg-white/[0.025] px-3 py-2 font-pixel text-sm whitespace-normal text-white/55 transition hover:border-red-400/45 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-wait disabled:opacity-55"
        >
          <UserMinus className="size-4" />
          {busy ? t("Removing...") : t("Remove")}
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
            {formatNumber(Math.max(0, player.points))} XP
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2">
        <Link
          href={`/players/${encodeURIComponent(player.userId)}`}
          className="flex min-h-10 items-center justify-center border border-[#899DFF]/30 bg-[#899DFF]/5 px-3 py-2 text-center font-pixel text-sm text-[#AAB8FF] transition hover:border-[#899DFF] hover:bg-[#899DFF]/10"
        >
          {t("View profile")}
        </Link>
        {renderAction()}
      </div>
    </article>
  );
}
