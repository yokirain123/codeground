import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { notificationsTable } from "@/lib/notifications/schema";

interface RouteContext {
  params: Promise<{ notificationId: string }>;
}

function parseNotificationId(rawId: string) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = parseNotificationId((await params).notificationId);
    const body = (await request.json().catch(() => ({}))) as {
      action?: unknown;
    };

    if (!notificationId) {
      return NextResponse.json(
        { error: "Invalid notification." },
        { status: 400 },
      );
    }

    if (body.action !== "read" && body.action !== "unread") {
      return NextResponse.json(
        { error: "Action must be read or unread." },
        { status: 400 },
      );
    }

    const isRead = body.action === "read";
    const [updated] = await db
      .update(notificationsTable)
      .set({
        isRead,
        readAt: isRead ? new Date() : null,
      })
      .where(
        and(
          eq(notificationsTable.id, notificationId),
          eq(notificationsTable.userId, userId),
        ),
      )
      .returning({ id: notificationsTable.id });

    if (!updated) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ updated: true, isRead });
  } catch (error) {
    console.error("Failed to update notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = parseNotificationId((await params).notificationId);

    if (!notificationId) {
      return NextResponse.json(
        { error: "Invalid notification." },
        { status: 400 },
      );
    }

    const now = new Date();
    const [dismissed] = await db
      .update(notificationsTable)
      .set({ isRead: true, readAt: now, dismissedAt: now })
      .where(
        and(
          eq(notificationsTable.id, notificationId),
          eq(notificationsTable.userId, userId),
        ),
      )
      .returning({ id: notificationsTable.id });

    if (!dismissed) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ dismissed: true });
  } catch (error) {
    console.error("Failed to dismiss notification:", error);
    return NextResponse.json(
      { error: "Failed to dismiss notification." },
      { status: 500 },
    );
  }
}
