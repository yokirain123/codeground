import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import { completedExercisesTable, usersTable } from "@/config/schema";

const TOP_PLAYERS_LIMIT = 5;

interface RankedPlayer {
  id: number;
  clerkId: string;
  name: string;
  points: number;
  completedExercises: number;
  createdAt: Date;
}

async function getAvatarUrls(clerkIds: string[]) {
  const uniqueClerkIds = [...new Set(clerkIds)].slice(0, 100);

  if (uniqueClerkIds.length === 0) {
    return new Map<string, string>();
  }

  try {
    const client = await clerkClient();
    const { data: clerkUsers } = await client.users.getUserList({
      userId: uniqueClerkIds,
      limit: uniqueClerkIds.length,
    });

    return new Map(
      clerkUsers.map((clerkUser) => [clerkUser.id, clerkUser.imageUrl]),
    );
  } catch (error) {
    // The leaderboard should still work when Clerk's Backend API is unavailable.
    console.warn("Leaderboard avatars loading error:", error);

    return new Map<string, string>();
  }
}

function toPublicPlayer(
  player: RankedPlayer,
  rank: number,
  avatarUrls: ReadonlyMap<string, string>,
) {
  return {
    rank,
    id: player.id,
    name: player.name,
    imageUrl: avatarUrls.get(player.clerkId) ?? null,
    points: player.points,
    completedExercises: player.completedExercises,
  };
}

export async function GET() {
  try {
    const { userId: currentClerkId } = await auth();

    const completedExerciseCount =
      sql<number>`count(${completedExercisesTable.id})`.mapWith(Number);

    const playerRows = await db
      .select({
        id: usersTable.id,
        clerkId: usersTable.clerkId,
        name: usersTable.name,
        points: usersTable.points,
        completedExercises: completedExerciseCount,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .leftJoin(
        completedExercisesTable,
        eq(completedExercisesTable.userId, usersTable.clerkId),
      )
      .where(eq(usersTable.role, "student"))
      .groupBy(
        usersTable.id,
        usersTable.clerkId,
        usersTable.name,
        usersTable.points,
        usersTable.createdAt,
      );

    const rankedPlayers: RankedPlayer[] = playerRows
      .map((player) => ({
        ...player,
        completedExercises: Number(player.completedExercises) || 0,
      }))
      .sort((firstPlayer, secondPlayer) => {
        const pointsDifference = secondPlayer.points - firstPlayer.points;

        if (pointsDifference !== 0) {
          return pointsDifference;
        }

        const exerciseDifference =
          secondPlayer.completedExercises - firstPlayer.completedExercises;

        if (exerciseDifference !== 0) {
          return exerciseDifference;
        }

        const joinedDifference =
          firstPlayer.createdAt.getTime() - secondPlayer.createdAt.getTime();

        if (joinedDifference !== 0) {
          return joinedDifference;
        }

        return firstPlayer.id - secondPlayer.id;
      });

    const currentPlayerIndex = currentClerkId
      ? rankedPlayers.findIndex((player) => player.clerkId === currentClerkId)
      : -1;

    const topRankedPlayers = rankedPlayers.slice(0, TOP_PLAYERS_LIMIT);
    const currentRankedPlayer =
      currentPlayerIndex >= 0 ? rankedPlayers[currentPlayerIndex] : null;

    const avatarUrls = await getAvatarUrls([
      ...topRankedPlayers.map((player) => player.clerkId),
      ...(currentRankedPlayer ? [currentRankedPlayer.clerkId] : []),
    ]);

    const topPlayers = topRankedPlayers.map((player, index) =>
      toPublicPlayer(player, index + 1, avatarUrls),
    );

    const currentPlayer = currentRankedPlayer
      ? toPublicPlayer(currentRankedPlayer, currentPlayerIndex + 1, avatarUrls)
      : null;

    return NextResponse.json(
      {
        players: topPlayers,
        currentPlayer,
        totalPlayers: rankedPlayers.length,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Leaderboard loading error:", error);

    return NextResponse.json(
      { error: "Failed to load the leaderboard" },
      { status: 500 },
    );
  }
}
