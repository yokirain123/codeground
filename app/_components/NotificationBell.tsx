"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  Loader2,
  Trophy,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import PlayerAvatar from "@/components/friends/PlayerAvatar";
import { useI18n } from "@/components/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/config";
import type { Translate } from "@/lib/i18n/translate";
import type {
  NotificationItem,
  NotificationsResponse,
  NotificationType,
} from "@/lib/notifications/types";

const iconByType: Record<NotificationType, typeof Bell> = {
  friend_request: UserPlus,
  friend_accepted: UserCheck,
  course_reminder: BookOpen,
  achievement: Trophy,
  system: Bell,
};

const iconColorByType: Record<NotificationType, string> = {
  friend_request: "text-[#899DFF]",
  friend_accepted: "text-[#6FFFA2]",
  course_reminder: "text-[#FFD400]",
  achievement: "text-[#FFD400]",
  system: "text-white/60",
};

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

function getRelativeTime(createdAt: string, locale: Locale) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 1_000),
  );

  if (seconds < 60) return locale === "uk" ? "щойно" : "now";

  const relativeTime = new Intl.RelativeTimeFormat(
    locale === "uk" ? "uk-UA" : "en-US",
    { numeric: "always", style: "narrow" },
  );

  if (seconds < 3_600) {
    return relativeTime.format(-Math.floor(seconds / 60), "minute");
  }
  if (seconds < 86_400) {
    return relativeTime.format(-Math.floor(seconds / 3_600), "hour");
  }
  if (seconds < 604_800) {
    return relativeTime.format(-Math.floor(seconds / 86_400), "day");
  }

  return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt));
}

function getNotificationCopy(
  notification: NotificationItem,
  locale: Locale,
  t: Translate,
) {
  if (locale === "en") {
    return { title: notification.title, message: notification.message };
  }

  if (notification.type === "friend_request") {
    return {
      title: t("New friend request"),
      message: t("{name} wants to join your party.", {
        name: notification.actor?.name ?? t("A CodeQuest player"),
      }),
    };
  }

  if (notification.type === "friend_accepted") {
    return {
      title: t("Friend request accepted"),
      message: t("{name} joined your party.", {
        name: notification.actor?.name ?? t("A CodeQuest player"),
      }),
    };
  }

  if (notification.type === "course_reminder") {
    const courseTitle = notification.message.match(
      /^Continue (.+) and complete your next coding quest\.$/,
    )?.[1];

    return {
      title: t("Your quest is waiting"),
      message: courseTitle
        ? t("Continue {course} and complete your next coding quest.", {
            course: courseTitle,
          })
        : t("Return to your course and complete the next coding quest."),
    };
  }

  return { title: notification.title, message: notification.message };
}

export default function NotificationBell() {
  const { locale, t, translateMessage } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      const data = await requestJson<NotificationsResponse>(
        "/api/notifications?limit=20",
      );
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setError("");
    } catch (loadError) {
      console.error("Notification center error:", loadError);
      if (!silent) {
        setError(
          loadError instanceof Error
            ? translateMessage(loadError.message)
            : t("Failed to load notifications."),
        );
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [t, translateMessage]);

  useEffect(() => {
    // Defer initial load to avoid synchronous setState during effect
    void Promise.resolve().then(() => loadNotifications());

    const interval = window.setInterval(() => {
      void loadNotifications(true);
    }, 45_000);
    const handleFocus = () => void loadNotifications(true);

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const markRead = async (notification: NotificationItem) => {
    if (notification.isRead) return;

    setNotifications((items) =>
      items.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      await requestJson(`/api/notifications/${notification.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "read" }),
      });
    } catch {
      void loadNotifications(true);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;

    const previousCount = unreadCount;
    setNotifications((items) =>
      items.map((item) => ({ ...item, isRead: true })),
    );
    setUnreadCount(0);

    try {
      await requestJson("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ action: "read_all" }),
      });
    } catch (updateError) {
      setUnreadCount(previousCount);
      toast.error(
        updateError instanceof Error
          ? translateMessage(updateError.message)
          : t("Failed to update notifications."),
      );
      void loadNotifications(true);
    }
  };

  const dismiss = async (notification: NotificationItem) => {
    setNotifications((items) =>
      items.filter((item) => item.id !== notification.id),
    );
    if (!notification.isRead) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }

    try {
      await requestJson(`/api/notifications/${notification.id}`, {
        method: "DELETE",
      });
    } catch (dismissError) {
      toast.error(
        dismissError instanceof Error
          ? translateMessage(dismissError.message)
          : t("Failed to dismiss notification."),
      );
      void loadNotifications(true);
    }
  };

  const handleFriendRequest = async (
    notification: NotificationItem,
    action: "accept" | "decline",
  ) => {
    if (!notification.entityId) return;
    setBusyId(notification.id);

    try {
      await requestJson(
        `/api/friends/requests/${encodeURIComponent(notification.entityId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ action }),
        },
      );
      toast.success(
        action === "accept"
          ? t("Player added to your party.")
          : t("Friend request declined."),
      );
      setNotifications((items) =>
        items.filter((item) => item.id !== notification.id),
      );
      if (!notification.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      void loadNotifications(true);
    } catch (actionError) {
      toast.error(
        actionError instanceof Error
          ? translateMessage(actionError.message)
          : t("Failed to update friend request."),
      );
    } finally {
      setBusyId(null);
    }
  };

  const toggleOpen = () => {
    setIsOpen((value) => !value);
    if (!isOpen) void loadNotifications(true);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? t("Notifications, {count} unread", { count: unreadCount })
            : t("Notifications")
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={toggleOpen}
        className="relative flex size-10 cursor-pointer items-center justify-center border border-[#899DFF]/20 bg-[#10152A] text-[#899DFF] transition-all hover:border-[#FFD400]/60 hover:text-[#FFD400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center border border-[#07080C] bg-[#FF4D67] px-1 font-pixel text-[10px] leading-[18px] text-white shadow-[2px_2px_0_#020307]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={t("Notifications")}
          className="absolute top-[calc(100%+12px)] right-0 z-[70] w-[min(24rem,calc(100vw-1rem))] border-2 border-[#899DFF]/55 bg-[#0B0E1A] shadow-[7px_7px_0_#020307]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
            <div>
              <h2 className="font-pixel text-xl text-white">
                {t("Notifications")}
              </h2>
              <p className="font-sans text-xs text-white/35">
                {unreadCount > 0
                  ? t("{count} unread quest updates", { count: unreadCount })
                  : t("You are all caught up")}
              </p>
            </div>

            <button
              type="button"
              disabled={unreadCount === 0}
              onClick={() => void markAllRead()}
              className="flex cursor-pointer items-center gap-1.5 font-pixel text-xs text-[#899DFF] hover:text-[#FFD400] disabled:cursor-default disabled:text-white/20"
            >
              <CheckCheck className="size-4" /> {t("Read all")}
            </button>
          </div>

          <div className="max-h-[min(32rem,70vh)] overflow-y-auto">
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[#899DFF]" />
              </div>
            ) : error ? (
              <div className="px-5 py-10 text-center">
                <p className="font-sans text-sm text-red-300">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadNotifications()}
                  className="mt-3 cursor-pointer font-pixel text-sm text-[#FFD400]"
                >
                  {t("Try again")}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Bell className="mx-auto size-8 text-[#899DFF]/35" />
                <p className="mt-3 font-pixel text-xl text-white">
                  {t("No new signals")}
                </p>
                <p className="mt-1 font-sans text-sm text-white/35">
                  {t("Friend invites and course reminders will appear here.")}
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = iconByType[notification.type];
                const copy = getNotificationCopy(notification, locale, t);
                const isFriendRequest =
                  notification.type === "friend_request" &&
                  Boolean(notification.entityId);

                return (
                  <article
                    key={notification.id}
                    className={`relative border-b border-white/[0.07] px-4 py-4 last:border-b-0 ${
                      notification.isRead
                        ? "bg-transparent"
                        : "bg-[#899DFF]/[0.07]"
                    }`}
                  >
                    {!notification.isRead && (
                      <span className="absolute top-5 left-0 h-8 w-0.5 bg-[#FFD400]" />
                    )}

                    <div className="flex gap-3">
                      {notification.actor ? (
                        <PlayerAvatar
                          name={notification.actor.name}
                          imageUrl={notification.actor.avatarUrl}
                          size="sm"
                          className="border-[#899DFF]/40 shadow-none"
                        />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center border border-[#899DFF]/25 bg-[#899DFF]/5">
                          <Icon
                            className={`size-5 ${iconColorByType[notification.type]}`}
                          />
                        </span>
                      )}

                      <div className="min-w-0 flex-1 pr-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-pixel text-base leading-5 text-white">
                            {copy.title}
                          </h3>
                          <time
                            dateTime={notification.createdAt}
                            className="shrink-0 font-sans text-[11px] text-white/25"
                          >
                            {getRelativeTime(notification.createdAt, locale)}
                          </time>
                        </div>

                        <p className="mt-1 font-sans text-sm leading-5 text-white/50">
                          {copy.message}
                        </p>

                        {isFriendRequest ? (
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              disabled={busyId === notification.id}
                              onClick={() =>
                                void handleFriendRequest(notification, "accept")
                              }
                              className="flex cursor-pointer items-center gap-1.5 border border-[#FFD400] bg-[#FFD400] px-3 py-1.5 font-pixel text-xs text-[#07080C] hover:bg-[#FF8C00] disabled:cursor-wait disabled:opacity-50"
                            >
                              {busyId === notification.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Check className="size-3.5" />
                              )}
                              {t("Accept")}
                            </button>
                            <button
                              type="button"
                              disabled={busyId === notification.id}
                              onClick={() =>
                                void handleFriendRequest(
                                  notification,
                                  "decline",
                                )
                              }
                              className="cursor-pointer border border-white/10 px-3 py-1.5 font-pixel text-xs text-white/45 hover:border-red-400/50 hover:text-red-300 disabled:cursor-wait disabled:opacity-50"
                            >
                              {t("Decline")}
                            </button>
                          </div>
                        ) : notification.href ? (
                          <Link
                            href={notification.href}
                            onClick={() => {
                              void markRead(notification);
                              setIsOpen(false);
                            }}
                            className="mt-2 inline-flex font-pixel text-xs text-[#899DFF] hover:text-[#FFD400]"
                          >
                            {notification.type === "course_reminder"
                              ? t("Continue course →")
                              : t("Open →")}
                          </Link>
                        ) : !notification.isRead ? (
                          <button
                            type="button"
                            onClick={() => void markRead(notification)}
                            className="mt-2 cursor-pointer font-pixel text-xs text-[#899DFF] hover:text-[#FFD400]"
                          >
                            {t("Mark as read")}
                          </button>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        aria-label={t("Dismiss notification")}
                        onClick={() => void dismiss(notification)}
                        className="absolute top-3 right-3 flex size-6 cursor-pointer items-center justify-center text-white/20 hover:text-white"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="border-t border-white/10 bg-black/20 px-4 py-2.5 text-center">
            <Link
              href="/friends"
              onClick={() => setIsOpen(false)}
              className="font-pixel text-xs text-white/35 hover:text-[#FFD400]"
            >
              {t("Open friends hub")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
