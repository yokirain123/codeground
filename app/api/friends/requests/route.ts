import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { getClerkAvatarMap } from "@/lib/friends/clerk";
import {
  getFriendshipPairKey,
  getOtherUserId,
} from "@/lib/friends/relationship";
import { friendshipsTable } from "@/lib/friends/schema";
import type {
  FriendRequestItem,
  FriendRequestsResponse,
  PublicPlayer,
} from "@/lib/friends/types";
import {
  createFriendAcceptedNotification,
  createFriendRequestNotification,
  dismissNotificationByEntity,
} from "@/lib/notifications/server";

async function runNotificationEffects(effects: Promise<unknown>[]) {
  const results = await Promise.allSettled(effects);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Friend notification side effect failed:", result.reason);
    }
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await db
      .select({
        id: friendshipsTable.id,
        requesterId: friendshipsTable.requesterId,
        addresseeId: friendshipsTable.addresseeId,
        createdAt: friendshipsTable.createdAt,
      })
      .from(friendshipsTable)
      .where(
        and(
          eq(friendshipsTable.status, "pending"),
          or(
            eq(friendshipsTable.requesterId, userId),
            eq(friendshipsTable.addresseeId, userId),
          ),
        ),
      )
      .orderBy(desc(friendshipsTable.createdAt));

    const playerIds = requests.map((friendRequest) =>
      getOtherUserId(friendRequest, userId),
    );

    if (playerIds.length === 0) {
      const emptyResponse: FriendRequestsResponse = {
        incoming: [],
        outgoing: [],
      };
      return NextResponse.json(emptyResponse);
    }

    const [players, avatarMap] = await Promise.all([
      db
        .select({
          userId: usersTable.clerkId,
          name: usersTable.name,
          points: usersTable.points,
          joinedAt: usersTable.createdAt,
        })
        .from(usersTable)
        .where(inArray(usersTable.clerkId, playerIds)),
      getClerkAvatarMap(playerIds),
    ]);

    const playerMap = new Map(players.map((player) => [player.userId, player]));
    const incoming: FriendRequestItem[] = [];
    const outgoing: FriendRequestItem[] = [];

    for (const friendRequest of requests) {
      const otherUserId = getOtherUserId(friendRequest, userId);
      const player = playerMap.get(otherUserId);

      if (!player) continue;

      const isIncoming = friendRequest.addresseeId === userId;
      const publicPlayer: PublicPlayer = {
        userId: player.userId,
        name: player.name,
        points: player.points,
        avatarUrl: avatarMap.get(player.userId) ?? null,
        joinedAt: player.joinedAt.toISOString(),
        relationship: isIncoming ? "incoming_pending" : "outgoing_pending",
        relationshipId: friendRequest.id,
      };

      const item: FriendRequestItem = {
        requestId: friendRequest.id,
        createdAt: friendRequest.createdAt.toISOString(),
        player: publicPlayer,
      };

      (isIncoming ? incoming : outgoing).push(item);
    }

    const response: FriendRequestsResponse = { incoming, outgoing };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to load friend requests:", error);
    return NextResponse.json(
      { error: "Failed to load friend requests." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { userId?: unknown };
    const targetUserId =
      typeof body.userId === "string" ? body.userId.trim() : "";

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Choose a player first." },
        { status: 400 },
      );
    }

    if (targetUserId === userId) {
      return NextResponse.json(
        { error: "You cannot add yourself as a friend." },
        { status: 400 },
      );
    }

    const profiles = await db
      .select({ userId: usersTable.clerkId })
      .from(usersTable)
      .where(inArray(usersTable.clerkId, [userId, targetUserId]));

    if (!profiles.some((profile) => profile.userId === userId)) {
      return NextResponse.json(
        {
          error: "Your CodeQuest profile is not ready yet. Refresh Dashboard.",
        },
        { status: 404 },
      );
    }

    if (!profiles.some((profile) => profile.userId === targetUserId)) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const pairKey = getFriendshipPairKey(userId, targetUserId);
    const [existing] = await db
      .select()
      .from(friendshipsTable)
      .where(eq(friendshipsTable.pairKey, pairKey))
      .limit(1);

    if (existing?.status === "accepted") {
      return NextResponse.json(
        { error: "You are already friends.", relationshipId: existing.id },
        { status: 409 },
      );
    }

    if (existing?.status === "pending") {
      if (existing.addresseeId === userId) {
        const [accepted] = await db
          .update(friendshipsTable)
          .set({ status: "accepted", respondedAt: new Date() })
          .where(
            and(
              eq(friendshipsTable.id, existing.id),
              eq(friendshipsTable.status, "pending"),
            ),
          )
          .returning({ id: friendshipsTable.id });

        const friendshipId = accepted?.id ?? existing.id;

        await runNotificationEffects([
          dismissNotificationByEntity({
            userId,
            type: "friend_request",
            entityType: "friendship",
            entityId: String(friendshipId),
          }),
          createFriendAcceptedNotification({
            friendshipId,
            actorId: userId,
            recipientId: existing.requesterId,
          }),
        ]);

        return NextResponse.json({
          status: "accepted",
          relationshipId: friendshipId,
          autoAccepted: true,
        });
      }

      return NextResponse.json(
        { error: "Friend request already sent.", relationshipId: existing.id },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(friendshipsTable)
      .values({
        requesterId: userId,
        addresseeId: targetUserId,
        pairKey,
        status: "pending",
      })
      .onConflictDoNothing({ target: friendshipsTable.pairKey })
      .returning({ id: friendshipsTable.id });

    if (created) {
      await runNotificationEffects([
        createFriendRequestNotification({
          requestId: created.id,
          requesterId: userId,
          addresseeId: targetUserId,
        }),
      ]);

      return NextResponse.json(
        { status: "pending", relationshipId: created.id },
        { status: 201 },
      );
    }

    // Handles two players sending requests at the exact same time.
    const [racedRequest] = await db
      .select()
      .from(friendshipsTable)
      .where(eq(friendshipsTable.pairKey, pairKey))
      .limit(1);

    if (
      racedRequest?.status === "pending" &&
      racedRequest.addresseeId === userId
    ) {
      const [accepted] = await db
        .update(friendshipsTable)
        .set({ status: "accepted", respondedAt: new Date() })
        .where(
          and(
            eq(friendshipsTable.id, racedRequest.id),
            eq(friendshipsTable.status, "pending"),
          ),
        )
        .returning({ id: friendshipsTable.id });

      const friendshipId = accepted?.id ?? racedRequest.id;

      await runNotificationEffects([
        dismissNotificationByEntity({
          userId,
          type: "friend_request",
          entityType: "friendship",
          entityId: String(friendshipId),
        }),
        createFriendAcceptedNotification({
          friendshipId,
          actorId: userId,
          recipientId: racedRequest.requesterId,
        }),
      ]);

      return NextResponse.json({
        status: "accepted",
        relationshipId: friendshipId,
        autoAccepted: true,
      });
    }

    return NextResponse.json(
      {
        error:
          racedRequest?.status === "accepted"
            ? "You are already friends."
            : "Friend request already sent.",
        relationshipId: racedRequest?.id ?? null,
      },
      { status: 409 },
    );
  } catch (error) {
    console.error("Failed to send friend request:", error);
    return NextResponse.json(
      { error: "Failed to send friend request." },
      { status: 500 },
    );
  }
}
