import {
  auth,
} from "@clerk/nextjs/server";

import {
  asc,
  eq,
} from "drizzle-orm";

import {
  NextResponse,
} from "next/server";

import { db } from "@/config/db";

import {
  achievementsTable,
  completedExercisesTable,
  userAchievementsTable,
  usersTable,
} from "@/config/schema";

const DAY_IN_MILLISECONDS =
  24 * 60 * 60 * 1000;

type AchievementMetric =
  | "exercises_completed"
  | "points_earned"
  | "streak";

function getUtcDay(
  date: Date,
) {
  return Math.floor(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ) / DAY_IN_MILLISECONDS,
  );
}

function calculateStreak(
  dates: Date[],
) {
  if (dates.length === 0) {
    return 0;
  }

  const activityDays = [
    ...new Set(
      dates.map((date) =>
        getUtcDay(
          new Date(date),
        ),
      ),
    ),
  ].sort(
    (first, second) =>
      second - first,
  );

  const today = getUtcDay(
    new Date(),
  );

  const latestActivityDay =
    activityDays[0];

  if (
    latestActivityDay !== today &&
    latestActivityDay !== today - 1
  ) {
    return 0;
  }

  let streak = 1;

  for (
    let index = 1;
    index < activityDays.length;
    index += 1
  ) {
    const previousDay =
      activityDays[index - 1];

    const currentDay =
      activityDays[index];

    if (
      previousDay - currentDay ===
      1
    ) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export async function GET() {
  try {
    const { userId: clerkId } =
      await auth();

    if (!clerkId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const [databaseUser] =
      await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          points: usersTable.points,
        })
        .from(usersTable)
        .where(
          eq(
            usersTable.clerkId,
            clerkId,
          ),
        )
        .limit(1);

    if (!databaseUser) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    const [
      completions,
      achievements,
      unlockedAchievements,
    ] = await Promise.all([
      db
        .select({
          completedAt:
            completedExercisesTable
              .completedAt,
        })
        .from(
          completedExercisesTable,
        )
        .where(
          eq(
            completedExercisesTable
              .userId,
            clerkId,
          ),
        ),

      db
        .select()
        .from(achievementsTable)
        .orderBy(
          asc(
            achievementsTable.target,
          ),
        ),

      db
        .select({
          achievementId:
            userAchievementsTable
              .achievementId,

          unlockedAt:
            userAchievementsTable
              .unlockedAt,
        })
        .from(
          userAchievementsTable,
        )
        .where(
          eq(
            userAchievementsTable
              .userId,
            clerkId,
          ),
        ),
    ]);

    const streak = calculateStreak(
      completions.map(
        (completion) =>
          completion.completedAt,
      ),
    );

    const metricValues: Record<
      AchievementMetric,
      number
    > = {
      exercises_completed:
        completions.length,

      points_earned:
        databaseUser.points,

      streak,
    };

    const unlockedIds = new Set(
      unlockedAchievements.map(
        (achievement) =>
          achievement.achievementId,
      ),
    );

    const achievementsToUnlock =
      achievements.filter(
        (achievement) =>
          !unlockedIds.has(
            achievement.id,
          ) &&
          metricValues[
            achievement.metric
          ] >= achievement.target,
      );

    if (
      achievementsToUnlock.length >
      0
    ) {
      await db
        .insert(
          userAchievementsTable,
        )
        .values(
          achievementsToUnlock.map(
            (achievement) => ({
              userId: clerkId,

              achievementId:
                achievement.id,
            }),
          ),
        )
        .onConflictDoNothing();

      for (
        const achievement of
        achievementsToUnlock
      ) {
        unlockedIds.add(
          achievement.id,
        );
      }
    }

    const unlockedAtMap =
      new Map(
        unlockedAchievements.map(
          (achievement) => [
            achievement.achievementId,
            achievement.unlockedAt,
          ],
        ),
      );

    const achievementList =
      achievements.map(
        (achievement) => {
          const currentValue =
            metricValues[
              achievement.metric
            ];

          return {
            id: achievement.id,
            key: achievement.key,
            name: achievement.name,
            description:
              achievement.description,
            icon: achievement.icon,
            metric:
              achievement.metric,
            target:
              achievement.target,

            currentValue:
              Math.min(
                currentValue,
                achievement.target,
              ),

            progress: Math.min(
              100,
              Math.round(
                (currentValue /
                  achievement.target) *
                  100,
              ),
            ),

            isUnlocked:
              unlockedIds.has(
                achievement.id,
              ),

            unlockedAt:
              unlockedAtMap.get(
                achievement.id,
              ) ?? null,
          };
        },
      );

    return NextResponse.json({
      user: {
        name: databaseUser.name,
        email:
          databaseUser.email,
      },

      stats: {
        totalPoints:
          databaseUser.points,

        badges:
          unlockedIds.size,

        streak,

        completedExercises:
          completions.length,
      },

      achievements:
        achievementList,
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load dashboard stats",
      },
      {
        status: 500,
      },
    );
  }
}