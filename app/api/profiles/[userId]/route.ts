import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import {
  completedExercisesTable,
  courseEnrollmentsTable,
  coursesTable,
  usersTable,
} from "@/config/schema";
import { getClerkAvatarMap } from "@/lib/friends/clerk";
import {
  getFriendshipPairKey,
  getRelationship,
} from "@/lib/friends/relationship";
import { friendshipsTable } from "@/lib/friends/schema";
import type { PlayerProfileResponse } from "@/lib/friends/types";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = decodeURIComponent((await params).userId).trim();

    if (!targetUserId) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const [profile] = await db
      .select({
        userId: usersTable.clerkId,
        name: usersTable.name,
        points: usersTable.points,
        joinedAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.clerkId, targetUserId))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const pairKey = getFriendshipPairKey(currentUserId, targetUserId);

    const [
      friendshipResult,
      avatarMap,
      completedResult,
      enrollmentResult,
      friendResult,
      courses,
    ] = await Promise.all([
      currentUserId === targetUserId
        ? Promise.resolve([])
        : db
            .select({
              id: friendshipsTable.id,
              requesterId: friendshipsTable.requesterId,
              addresseeId: friendshipsTable.addresseeId,
              status: friendshipsTable.status,
            })
            .from(friendshipsTable)
            .where(eq(friendshipsTable.pairKey, pairKey))
            .limit(1),
      getClerkAvatarMap([targetUserId]),
      db
        .select({ value: sql<number>`count(*)::integer` })
        .from(completedExercisesTable)
        .where(eq(completedExercisesTable.userId, targetUserId)),
      db
        .select({ value: sql<number>`count(*)::integer` })
        .from(courseEnrollmentsTable)
        .where(eq(courseEnrollmentsTable.userId, targetUserId)),
      db
        .select({ value: sql<number>`count(*)::integer` })
        .from(friendshipsTable)
        .where(
          and(
            eq(friendshipsTable.status, "accepted"),
            or(
              eq(friendshipsTable.requesterId, targetUserId),
              eq(friendshipsTable.addresseeId, targetUserId),
            ),
          ),
        ),
      db
        .select({
          id: coursesTable.id,
          title: coursesTable.title,
          level: coursesTable.level,
          xpEarned: courseEnrollmentsTable.xpEarned,
        })
        .from(courseEnrollmentsTable)
        .innerJoin(
          coursesTable,
          eq(courseEnrollmentsTable.courseId, coursesTable.id),
        )
        .where(eq(courseEnrollmentsTable.userId, targetUserId))
        .orderBy(desc(courseEnrollmentsTable.enrolledAt))
        .limit(4),
    ]);

    const relationship = getRelationship(
      friendshipResult[0],
      currentUserId,
      targetUserId,
    );

    const response: PlayerProfileResponse = {
      player: {
        userId: profile.userId,
        name: profile.name,
        points: profile.points,
        avatarUrl: avatarMap.get(profile.userId) ?? null,
        joinedAt: profile.joinedAt.toISOString(),
        relationship: relationship.state,
        relationshipId: relationship.id,
        stats: {
          completedExercises: Number(completedResult[0]?.value ?? 0),
          enrolledCourses: Number(enrollmentResult[0]?.value ?? 0),
          friends: Number(friendResult[0]?.value ?? 0),
        },
        courses,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to load player profile:", error);
    return NextResponse.json(
      { error: "Failed to load player profile." },
      { status: 500 },
    );
  }
}
