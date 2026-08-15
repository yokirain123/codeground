import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { getClerkAvatarMap } from "@/lib/friends/clerk";
import { getOtherUserId } from "@/lib/friends/relationship";
import { friendshipsTable } from "@/lib/friends/schema";
import type { FriendListItem, FriendsResponse } from "@/lib/friends/types";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestedLimit = Number(
      new URL(request.url).searchParams.get("limit"),
    );
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(100, Math.max(1, Math.floor(requestedLimit)))
      : 100;

    const friendshipCondition = and(
      eq(friendshipsTable.status, "accepted"),
      or(
        eq(friendshipsTable.requesterId, userId),
        eq(friendshipsTable.addresseeId, userId),
      ),
    );

    const [friendships, totalResult] = await Promise.all([
      db
        .select({
          id: friendshipsTable.id,
          requesterId: friendshipsTable.requesterId,
          addresseeId: friendshipsTable.addresseeId,
          createdAt: friendshipsTable.createdAt,
          respondedAt: friendshipsTable.respondedAt,
        })
        .from(friendshipsTable)
        .where(friendshipCondition)
        .orderBy(
          desc(friendshipsTable.respondedAt),
          desc(friendshipsTable.createdAt),
        )
        .limit(limit),
      db
        .select({ value: sql<number>`count(*)::integer` })
        .from(friendshipsTable)
        .where(friendshipCondition),
    ]);

    const friendIds = friendships.map((friendship) =>
      getOtherUserId(friendship, userId),
    );

    if (friendIds.length === 0) {
      const emptyResponse: FriendsResponse = {
        friends: [],
        total: Number(totalResult[0]?.value ?? 0),
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
        .where(inArray(usersTable.clerkId, friendIds)),
      getClerkAvatarMap(friendIds),
    ]);

    const playerMap = new Map(players.map((player) => [player.userId, player]));

    const friends = friendships.flatMap<FriendListItem>((friendship) => {
      const friendId = getOtherUserId(friendship, userId);
      const player = playerMap.get(friendId);

      if (!player) return [];

      return [
        {
          userId: player.userId,
          name: player.name,
          points: player.points,
          avatarUrl: avatarMap.get(player.userId) ?? null,
          joinedAt: player.joinedAt.toISOString(),
          relationship: "friends",
          relationshipId: friendship.id,
          friendsSince: (
            friendship.respondedAt ?? friendship.createdAt
          ).toISOString(),
        },
      ];
    });

    const response: FriendsResponse = {
      friends,
      total: Number(totalResult[0]?.value ?? friends.length),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to load friends:", error);
    return NextResponse.json(
      { error: "Failed to load friends." },
      { status: 500 },
    );
  }
}
