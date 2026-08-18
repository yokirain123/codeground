"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ArrowRight, Bell, UsersRound } from "lucide-react";

import PlayerAvatar from "@/components/friends/PlayerAvatar";
import { useI18n } from "@/components/i18n/I18nProvider";
import type {
  FriendRequestsResponse,
  FriendsResponse,
} from "@/lib/friends/types";

const emptyFriends: FriendsResponse = {
  friends: [],
  total: 0,
};

export default function FriendsSummary() {
  const { t, formatNumber } = useI18n();
  const [friends, setFriends] = useState<FriendsResponse>(emptyFriends);
  const [incomingRequests, setIncomingRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadFriendSummary = async () => {
      try {
        const [friendsResponse, requestsResponse] = await Promise.all([
          fetch("/api/friends?limit=4", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/friends/requests", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!friendsResponse.ok || !requestsResponse.ok) return;

        const [friendData, requestData] = (await Promise.all([
          friendsResponse.json(),
          requestsResponse.json(),
        ])) as [FriendsResponse, FriendRequestsResponse];

        if (!controller.signal.aborted) {
          setFriends(friendData);
          setIncomingRequests(requestData.incoming.length);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Failed to load friend summary:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadFriendSummary();
    return () => controller.abort();
  }, []);

  return (
    <aside className="border-2 border-[#899DFF]/35 bg-[#10152A] px-5 py-5 shadow-[6px_6px_0_#020307] sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#899DFF]">
          <UsersRound className="size-4" />
          <p className="font-pixel text-xs uppercase tracking-[0.2em]">
            {t("Your party")}
          </p>
        </div>

        {incomingRequests > 0 && (
          <Link
            href="/friends"
            aria-label={t("{count} incoming friend requests", {
              count: incomingRequests,
            })}
            className="flex items-center gap-1.5 border border-[#FFD400]/45 bg-[#FFD400]/10 px-2 py-1 font-pixel text-[10px] text-[#FFD400]"
          >
            <Bell className="size-3" /> {incomingRequests}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="mt-5 animate-pulse">
          <div className="h-12 bg-white/[0.04]" />
          <div className="mt-4 h-11 bg-white/[0.04]" />
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="font-pixel text-3xl text-[#FFD400]">
                {formatNumber(friends.total)}
              </p>
              <p className="mt-1 font-pixel text-[10px] uppercase tracking-[0.15em] text-white/35">
                {t("Party members")}
              </p>
            </div>

            {friends.friends.length > 0 ? (
              <div className="flex -space-x-2">
                {friends.friends.slice(0, 3).map((friend) => (
                  <PlayerAvatar
                    key={friend.userId}
                    name={friend.name}
                    imageUrl={friend.avatarUrl}
                    size="sm"
                    className="border-[#10152A] shadow-none"
                  />
                ))}

                {friends.total > 3 && (
                  <span className="relative flex size-10 items-center justify-center border-2 border-[#10152A] bg-[#899DFF] font-pixel text-xs text-[#07080C]">
                    +{friends.total - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="font-sans text-sm text-white/30">
                {t("No allies yet")}
              </span>
            )}
          </div>

          <Link
            href="/friends"
            className="mt-4 flex h-11 items-center justify-between border border-[#899DFF]/30 bg-[#899DFF]/5 px-4 font-pixel text-sm text-[#AAB8FF] transition hover:border-[#899DFF] hover:bg-[#899DFF]/10 hover:text-white"
          >
            {t("Open friends")} <ArrowRight className="size-4" />
          </Link>
        </>
      )}
    </aside>
  );
}
