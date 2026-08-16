import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { getClerkAvatarMap } from "@/lib/friends/clerk";
import { notificationsTable } from "@/lib/notifications/schema";
import {
  syncCourseReminders,
  syncFriendRequestNotifications,
} from "@/lib/notifications/server";
import type {
  NotificationItem,
  NotificationsResponse,
} from "@/lib/notifications/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const syncResults = await Promise.allSettled([
      syncFriendRequestNotifications(userId),
      syncCourseReminders(userId),
    ]);

    for (const result of syncResults) {
      if (result.status === "rejected") {
        // A synchronization error must not hide already saved notifications.
        console.error("Failed to synchronize notifications:", result.reason);
      }
    }

    const requestedLimit = Number(
      new URL(request.url).searchParams.get("limit"),
    );
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(50, Math.max(1, Math.floor(requestedLimit)))
      : 20;
    const visibleCondition = and(
      eq(notificationsTable.userId, userId),
      isNull(notificationsTable.dismissedAt),
    );

    const [rows, unreadResult] = await Promise.all([
      db
        .select({
          id: notificationsTable.id,
          type: notificationsTable.type,
          title: notificationsTable.title,
          message: notificationsTable.message,
          href: notificationsTable.href,
          entityType: notificationsTable.entityType,
          entityId: notificationsTable.entityId,
          isRead: notificationsTable.isRead,
          createdAt: notificationsTable.createdAt,
          actorId: notificationsTable.actorId,
          actorName: usersTable.name,
        })
        .from(notificationsTable)
        .leftJoin(
          usersTable,
          eq(notificationsTable.actorId, usersTable.clerkId),
        )
        .where(visibleCondition)
        .orderBy(desc(notificationsTable.createdAt))
        .limit(limit),
      db
        .select({ value: sql<number>`count(*)::integer` })
        .from(notificationsTable)
        .where(and(visibleCondition, eq(notificationsTable.isRead, false))),
    ]);

    const actorIds = rows.flatMap((row) => (row.actorId ? [row.actorId] : []));
    const avatarMap = await getClerkAvatarMap(actorIds);

    const notifications: NotificationItem[] = rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      href: row.href,
      entityType: row.entityType,
      entityId: row.entityId,
      isRead: row.isRead,
      createdAt: row.createdAt.toISOString(),
      actor:
        row.actorId && row.actorName
          ? {
              userId: row.actorId,
              name: row.actorName,
              avatarUrl: avatarMap.get(row.actorId) ?? null,
            }
          : null,
    }));

    const response: NotificationsResponse = {
      notifications,
      unreadCount: Number(unreadResult[0]?.value ?? 0),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to load notifications:", error);
    return NextResponse.json(
      { error: "Failed to load notifications." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      action?: unknown;
    };

    if (body.action !== "read_all") {
      return NextResponse.json(
        { error: "Action must be read_all." },
        { status: 400 },
      );
    }

    await db
      .update(notificationsTable)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notificationsTable.userId, userId),
          eq(notificationsTable.isRead, false),
          isNull(notificationsTable.dismissedAt),
        ),
      );

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to update notifications." },
      { status: 500 },
    );
  }
}
