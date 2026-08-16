import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { friendshipsTable } from "@/lib/friends/schema";
import {
  createFriendAcceptedNotification,
  dismissNotificationByEntity,
} from "@/lib/notifications/server";

interface RouteContext {
  params: Promise<{ requestId: string }>;
}

async function runNotificationEffects(effects: Promise<unknown>[]) {
  const results = await Promise.allSettled(effects);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Friend notification side effect failed:", result.reason);
    }
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = Number((await params).requestId);
    const body = (await request.json()) as { action?: unknown };
    const action = body.action;

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json(
        { error: "Action must be accept or decline." },
        { status: 400 },
      );
    }

    const ownershipCondition = and(
      eq(friendshipsTable.id, requestId),
      eq(friendshipsTable.addresseeId, userId),
      eq(friendshipsTable.status, "pending"),
    );

    if (action === "decline") {
      const [deleted] = await db
        .delete(friendshipsTable)
        .where(ownershipCondition)
        .returning({ id: friendshipsTable.id });

      if (!deleted) {
        return NextResponse.json(
          { error: "Friend request not found." },
          { status: 404 },
        );
      }

      await runNotificationEffects([
        dismissNotificationByEntity({
          userId,
          type: "friend_request",
          entityType: "friendship",
          entityId: String(deleted.id),
        }),
      ]);

      return NextResponse.json({ status: "declined" });
    }

    const [accepted] = await db
      .update(friendshipsTable)
      .set({ status: "accepted", respondedAt: new Date() })
      .where(ownershipCondition)
      .returning({
        id: friendshipsTable.id,
        requesterId: friendshipsTable.requesterId,
      });

    if (!accepted) {
      return NextResponse.json(
        { error: "Friend request not found." },
        { status: 404 },
      );
    }

    await runNotificationEffects([
      dismissNotificationByEntity({
        userId,
        type: "friend_request",
        entityType: "friendship",
        entityId: String(accepted.id),
      }),
      createFriendAcceptedNotification({
        friendshipId: accepted.id,
        actorId: userId,
        recipientId: accepted.requesterId,
      }),
    ]);

    return NextResponse.json({
      status: "accepted",
      relationshipId: accepted.id,
    });
  } catch (error) {
    console.error("Failed to update friend request:", error);
    return NextResponse.json(
      { error: "Failed to update friend request." },
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

    const requestId = Number((await params).requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const [deleted] = await db
      .delete(friendshipsTable)
      .where(
        and(
          eq(friendshipsTable.id, requestId),
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.status, "pending"),
        ),
      )
      .returning({
        id: friendshipsTable.id,
        addresseeId: friendshipsTable.addresseeId,
      });

    if (!deleted) {
      return NextResponse.json(
        { error: "Sent friend request not found." },
        { status: 404 },
      );
    }

    await runNotificationEffects([
      dismissNotificationByEntity({
        userId: deleted.addresseeId,
        type: "friend_request",
        entityType: "friendship",
        entityId: String(deleted.id),
      }),
    ]);

    return NextResponse.json({ status: "cancelled" });
  } catch (error) {
    console.error("Failed to cancel friend request:", error);
    return NextResponse.json(
      { error: "Failed to cancel friend request." },
      { status: 500 },
    );
  }
}
