import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { getClerkAvatarMap } from "@/lib/friends/clerk";
import { getOtherUserId, getRelationship } from "@/lib/friends/relationship";
import { friendshipsTable } from "@/lib/friends/schema";
import type { PublicPlayer } from "@/lib/friends/types";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query =
      new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
    const searchCondition = query
      ? and(
          ne(usersTable.clerkId, userId),
          or(
            ilike(usersTable.name, `%${query}%`),
            eq(sql<string>`lower(${usersTable.email})`, query.toLowerCase()),
          ),
        )
      : ne(usersTable.clerkId, userId);

    const players = await db
      .select({
        userId: usersTable.clerkId,
        name: usersTable.name,
        points: usersTable.points,
        joinedAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(searchCondition)
      .orderBy(desc(usersTable.points), asc(usersTable.name))
      .limit(20);

    const playerIds = players.map((player) => player.userId);

    if (playerIds.length === 0) {
      return NextResponse.json({ players: [] satisfies PublicPlayer[] });
    }

    const [friendships, avatarMap] = await Promise.all([
      db
        .select({
          id: friendshipsTable.id,
          requesterId: friendshipsTable.requesterId,
          addresseeId: friendshipsTable.addresseeId,
          status: friendshipsTable.status,
        })
        .from(friendshipsTable)
        .where(
          and(
            or(
              eq(friendshipsTable.requesterId, userId),
              eq(friendshipsTable.addresseeId, userId),
            ),
            or(
              inArray(friendshipsTable.requesterId, playerIds),
              inArray(friendshipsTable.addresseeId, playerIds),
            ),
          ),
        ),
      getClerkAvatarMap(playerIds),
    ]);

    const friendshipMap = new Map(
      friendships.map((friendship) => [
        getOtherUserId(friendship, userId),
        friendship,
      ]),
    );

    const result: PublicPlayer[] = players.map((player) => {
      const relationship = getRelationship(
        friendshipMap.get(player.userId),
        userId,
        player.userId,
      );

      return {
        userId: player.userId,
        name: player.name,
        points: player.points,
        avatarUrl: avatarMap.get(player.userId) ?? null,
        joinedAt: player.joinedAt.toISOString(),
        relationship: relationship.state,
        relationshipId: relationship.id,
      };
    });

    return NextResponse.json({ players: result });
  } catch (error) {
    console.error("Failed to search players:", error);
    return NextResponse.json(
      { error: "Failed to search players." },
      { status: 500 },
    );
  }
}
