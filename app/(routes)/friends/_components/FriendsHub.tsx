"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  Check,
  Inbox,
  Loader2,
  Search,
  Send,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import PlayerAvatar from "@/components/friends/PlayerAvatar";
import PlayerCard from "@/components/friends/PlayerCard";
import { useI18n } from "@/components/i18n/I18nProvider";
import type {
  FriendRequestsResponse,
  FriendsResponse,
  PublicPlayer,
} from "@/lib/friends/types";

type ActiveTab = "friends" | "requests" | "discover";
type LoadState = "loading" | "ready" | "error";

const emptyFriends: FriendsResponse = { friends: [], total: 0 };
const emptyRequests: FriendRequestsResponse = { incoming: [], outgoing: [] };

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

export default function FriendsHub() {
  const { t, formatNumber, translateMessage } = useI18n();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() ?? "";

  const [activeTab, setActiveTab] = useState<ActiveTab>(
    initialQuery ? "discover" : "friends",
  );
  const [friends, setFriends] = useState<FriendsResponse>(emptyFriends);
  const [requests, setRequests] =
    useState<FriendRequestsResponse>(emptyRequests);
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [searching, setSearching] = useState(false);
  const [busyKey, setBusyKey] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSocialData = useCallback(async () => {
    setLoadState("loading");

    try {
      const [friendData, requestData] = await Promise.all([
        requestJson<FriendsResponse>("/api/friends"),
        requestJson<FriendRequestsResponse>("/api/friends/requests"),
      ]);

      setFriends(friendData);
      setRequests(requestData);
      setLoadState("ready");
    } catch (error) {
      console.error("Friends page error:", error);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadSocialData();
  }, [loadSocialData, refreshKey]);

  useEffect(() => {
    if (activeTab !== "discover") return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);

      try {
        const response = await fetch(
          `/api/friends/search?q=${encodeURIComponent(query.trim())}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = (await response.json().catch(() => ({}))) as {
          players?: PublicPlayer[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || t("Failed to search players."));
        }

        setPlayers(Array.isArray(data.players) ? data.players : []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        toast.error(
          error instanceof Error
            ? translateMessage(error.message)
            : t("Failed to search players."),
        );
        setPlayers([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeTab, query, refreshKey, t, translateMessage]);

  const refresh = () => setRefreshKey((value) => value + 1);

  const sendRequest = async (player: PublicPlayer) => {
    setBusyKey(`add-${player.userId}`);

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
          ? t("{name} joined your party.", { name: player.name })
          : t("Friend request sent to {name}.", { name: player.name }),
      );
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? translateMessage(error.message)
          : t("Request failed."),
      );
    } finally {
      setBusyKey("");
    }
  };

  const acceptRequest = async (player: PublicPlayer) => {
    if (!player.relationshipId) return;
    setBusyKey(`accept-${player.userId}`);

    try {
      await requestJson(`/api/friends/requests/${player.relationshipId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "accept" }),
      });
      toast.success(t("{name} is now your friend.", { name: player.name }));
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? translateMessage(error.message)
          : t("Request failed."),
      );
    } finally {
      setBusyKey("");
    }
  };

  const declineRequest = async (player: PublicPlayer) => {
    if (!player.relationshipId) return;
    setBusyKey(`decline-${player.userId}`);

    try {
      await requestJson(`/api/friends/requests/${player.relationshipId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "decline" }),
      });
      toast.success(t("Friend request declined."));
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? translateMessage(error.message)
          : t("Request failed."),
      );
    } finally {
      setBusyKey("");
    }
  };

  const cancelRequest = async (player: PublicPlayer) => {
    if (!player.relationshipId) return;
    setBusyKey(`cancel-${player.userId}`);

    try {
      await requestJson(`/api/friends/requests/${player.relationshipId}`, {
        method: "DELETE",
      });
      toast.success(t("Friend request cancelled."));
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? translateMessage(error.message)
          : t("Request failed."),
      );
    } finally {
      setBusyKey("");
    }
  };

  const removeFriend = async (player: PublicPlayer) => {
    if (!player.relationshipId) return;
    if (!window.confirm(t("Remove {name} from your friends?", { name: player.name }))) {
      return;
    }

    setBusyKey(`remove-${player.userId}`);

    try {
      await requestJson(`/api/friends/${player.relationshipId}`, {
        method: "DELETE",
      });
      toast.success(
        t("{name} was removed from your friends.", { name: player.name }),
      );
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? translateMessage(error.message)
          : t("Request failed."),
      );
    } finally {
      setBusyKey("");
    }
  };

  const tabs: Array<{
    id: ActiveTab;
    label: string;
    count?: number;
    icon: typeof UsersRound;
  }> = [
    {
      id: "friends",
      label: t("My friends"),
      count: friends.total,
      icon: UsersRound,
    },
    {
      id: "requests",
      label: t("Requests"),
      count: requests.incoming.length,
      icon: Inbox,
    },
    { id: "discover", label: t("Find players"), icon: Search },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
      <section className="relative overflow-hidden border-2 border-[#899DFF]/45 bg-[#10152A] px-4 py-6 shadow-[7px_7px_0_#020307] sm:px-8 sm:py-8 lg:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#899DFF]/12 blur-[100px]"
        />

        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="font-pixel text-xs uppercase tracking-[0.28em] text-[#899DFF]">
              {t("Social hub")}
            </p>
            <h1 className="mt-2 break-words font-pixel text-3xl text-white sm:text-5xl lg:text-6xl">
              {t("Build your")} <span className="text-[#FFD400]">{t("party")}</span>
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-base leading-7 text-white/55 sm:text-lg">
              {t(
                "Find other adventurers, grow your coding party and inspect each player's CodeQuest progress.",
              )}
            </p>
          </div>

          <div className="grid w-full grid-cols-3 gap-1.5 sm:w-auto sm:gap-3">
            {[
              { label: t("Friends"), value: friends.total },
              { label: t("Incoming"), value: requests.incoming.length },
              { label: t("Sent"), value: requests.outgoing.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-0 border border-[#899DFF]/25 bg-black/20 px-1.5 py-3 text-center sm:min-w-24 sm:px-3"
              >
                <p className="font-pixel text-2xl text-[#FFD400]">
                  {stat.value}
                </p>
                <p className="mt-1 break-words font-pixel text-[9px] uppercase leading-tight tracking-normal text-white/35 sm:tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <nav
        aria-label={t("Friends sections")}
        className="mt-9 grid gap-2 border-b border-white/10 pb-4 sm:grid-cols-3"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex h-12 cursor-pointer items-center justify-center gap-2 border font-pixel text-base transition sm:text-lg ${
                selected
                  ? "border-[#FFD400] bg-[#FFD400] text-[#07080C] shadow-[3px_3px_0_#FF8C00]"
                  : "border-[#899DFF]/25 bg-[#10152A] text-white/55 hover:border-[#899DFF]/60 hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={`min-w-6 border px-1.5 py-0.5 text-xs ${
                    selected
                      ? "border-black/25 bg-black/10"
                      : "border-[#899DFF]/25 bg-[#899DFF]/5 text-[#899DFF]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {loadState === "loading" && activeTab !== "discover" && (
        <div className="flex min-h-64 items-center justify-center text-[#899DFF]">
          <Loader2 className="size-7 animate-spin" />
          <span className="ml-3 font-pixel text-lg">{t("Loading party...")}</span>
        </div>
      )}

      {loadState === "error" && activeTab !== "discover" && (
        <div className="mt-8 border border-red-400/35 bg-red-400/10 p-6 text-center">
          <p className="font-pixel text-lg text-red-300">
            {t("Could not load your friends.")}
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-4 cursor-pointer border border-red-300/40 px-4 py-2 font-pixel text-red-200"
          >
            {t("Try again")}
          </button>
        </div>
      )}

      {activeTab === "friends" && loadState === "ready" && (
        <section className="mt-8">
          {friends.friends.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {friends.friends.map((player) => (
                <PlayerCard
                  key={player.userId}
                  player={player}
                  busy={busyKey === `remove-${player.userId}`}
                  onRemove={removeFriend}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={UsersRound}
              title={t("Your party is empty")}
              description={t(
                "Find another CodeQuest player and send your first friend request.",
              )}
              actionLabel={t("Find players")}
              onAction={() => setActiveTab("discover")}
            />
          )}
        </section>
      )}

      {activeTab === "requests" && loadState === "ready" && (
        <section className="mt-8 space-y-10">
          <div>
            <SectionTitle
              icon={Inbox}
              title={t("Incoming requests")}
              count={requests.incoming.length}
            />

            {requests.incoming.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {requests.incoming.map(({ requestId, player }) => (
                  <article
                    key={requestId}
                    className="border-2 border-[#899DFF]/30 bg-[#10152A] p-4 shadow-[5px_5px_0_#020307]"
                  >
                    <div className="flex items-center gap-4">
                      <PlayerAvatar
                        name={player.name}
                        imageUrl={player.avatarUrl}
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/players/${encodeURIComponent(player.userId)}`}
                          className="truncate font-pixel text-xl text-white hover:text-[#FFD400]"
                        >
                          {player.name}
                        </Link>
                        <p className="mt-1 font-pixel text-xs text-[#FFD400]">
                          {formatNumber(player.points)} XP
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2">
                      <button
                        type="button"
                        disabled={busyKey === `accept-${player.userId}`}
                        onClick={() => void acceptRequest(player)}
                        className="flex h-10 cursor-pointer items-center justify-center gap-2 border-2 border-[#6FFFA2] bg-[#6FFFA2]/10 font-pixel text-sm text-[#6FFFA2] hover:bg-[#6FFFA2] hover:text-[#07080C] disabled:opacity-50"
                      >
                        <Check className="size-4" /> {t("Accept")}
                      </button>
                      <button
                        type="button"
                        disabled={busyKey === `decline-${player.userId}`}
                        onClick={() => void declineRequest(player)}
                        className="flex h-10 cursor-pointer items-center justify-center gap-2 border border-red-400/35 bg-red-400/5 font-pixel text-sm text-red-300 hover:bg-red-400/15 disabled:opacity-50"
                      >
                        <X className="size-4" /> {t("Decline")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 border border-white/10 bg-white/[0.02] p-5 font-sans text-white/40">
                {t("No incoming friend requests right now.")}
              </p>
            )}
          </div>

          <div>
            <SectionTitle
              icon={Send}
              title={t("Sent requests")}
              count={requests.outgoing.length}
            />

            {requests.outgoing.length > 0 ? (
              <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {requests.outgoing.map(({ requestId, player }) => (
                  <PlayerCard
                    key={requestId}
                    player={player}
                    busy={busyKey === `cancel-${player.userId}`}
                    onCancel={cancelRequest}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 border border-white/10 bg-white/[0.02] p-5 font-sans text-white/40">
                {t("You have no pending sent requests.")}
              </p>
            )}
          </div>
        </section>
      )}

      {activeTab === "discover" && (
        <section className="mt-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#899DFF]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Search by player name or exact email...")}
              className="h-14 w-full border-2 border-[#899DFF]/40 bg-[#10152A] pl-12 pr-12 font-sans text-base text-white outline-none placeholder:text-white/25 focus:border-[#FFD400]"
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-[#FFD400]" />
            )}
          </div>

          <p className="mt-3 font-sans text-sm text-white/35">
            {query.trim()
              ? t("Searching CodeQuest players for “{query}”", {
                  query: query.trim(),
                })
              : t("Top adventurers you may want in your party.")}
          </p>

          {!searching && players.length > 0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {players.map((player) => (
                <PlayerCard
                  key={player.userId}
                  player={player}
                  busy={
                    busyKey === `add-${player.userId}` ||
                    busyKey === `accept-${player.userId}` ||
                    busyKey === `cancel-${player.userId}` ||
                    busyKey === `remove-${player.userId}`
                  }
                  onAdd={sendRequest}
                  onAccept={acceptRequest}
                  onCancel={cancelRequest}
                  onRemove={removeFriend}
                />
              ))}
            </div>
          )}

          {!searching && players.length === 0 && (
            <EmptyState
              icon={UserPlus}
              title={t("No players found")}
              description={t(
                "Try another name or enter the full email linked to their CodeQuest account.",
              )}
            />
          )}
        </section>
      )}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  count,
}: {
  icon: typeof UsersRound;
  title: string;
  count: number;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-white/10 pb-3">
      <Icon className="size-5 text-[#899DFF]" />
      <h2 className="min-w-0 flex-1 break-words font-pixel text-2xl leading-tight text-white">{title}</h2>
      <span className="border border-[#899DFF]/25 bg-[#899DFF]/5 px-2 py-0.5 font-pixel text-xs text-[#899DFF]">
        {count}
      </span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: typeof UsersRound;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mt-6 flex min-h-64 flex-col items-center justify-center border-2 border-dashed border-[#899DFF]/25 bg-[#10152A]/45 px-4 py-10 text-center sm:px-6">
      <span className="flex size-16 items-center justify-center border border-[#899DFF]/25 bg-[#899DFF]/5 text-[#899DFF]">
        <Icon className="size-8" />
      </span>
      <h3 className="mt-5 font-pixel text-2xl text-white">{title}</h3>
      <p className="mt-2 max-w-md font-sans text-white/45">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 cursor-pointer border-2 border-black bg-[#FFD400] px-5 py-2.5 font-pixel text-lg text-black shadow-[3px_3px_0_#FF8C00]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
