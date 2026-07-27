import { auth } from "@clerk/nextjs/server";
import {
  and,
  eq,
  sql,
} from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import {
  completedExercisesTable,
  CourseChaptersTable,
  courseEnrollmentsTable,
  usersTable,
} from "@/config/schema";

/*
  GET /api/completed-exercises?courseId=1

  Повертає завершені вправи поточного користувача
  для конкретного курсу.
*/
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const courseId = Number(
      new URL(request.url).searchParams.get(
        "courseId",
      ),
    );

    if (
      !Number.isInteger(courseId) ||
      courseId <= 0
    ) {
      return NextResponse.json(
        { error: "Valid courseId is required" },
        { status: 400 },
      );
    }

    const completedExercises = await db
      .select({
        id: completedExercisesTable.id,
        chapterId:
          completedExercisesTable.chapterId,
        exerciseSlug:
          completedExercisesTable.exerciseSlug,
        completedAt:
          completedExercisesTable.completedAt,
      })
      .from(completedExercisesTable)
      .innerJoin(
        CourseChaptersTable,
        eq(
          completedExercisesTable.chapterId,
          CourseChaptersTable.id,
        ),
      )
      .where(
        and(
          eq(
            completedExercisesTable.userId,
            clerkId,
          ),
          eq(
            CourseChaptersTable.courseId,
            courseId,
          ),
        ),
      );

    return NextResponse.json({
      completedExercises,
    });
  } catch (error) {
    console.error(
      "Completed exercises loading error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load completed exercises",
      },
      { status: 500 },
    );
  }
}

/*
  POST /api/completed-exercises

  body:
  {
    chapterId: 1,
    exerciseSlug: "explore-the-web-skeleton"
  }
*/
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const chapterId = Number(body.chapterId);

    const exerciseSlug =
      typeof body.exerciseSlug === "string"
        ? body.exerciseSlug.trim()
        : "";

    if (
      !Number.isInteger(chapterId) ||
      chapterId <= 0
    ) {
      return NextResponse.json(
        { error: "Valid chapterId is required" },
        { status: 400 },
      );
    }

    if (!exerciseSlug) {
      return NextResponse.json(
        {
          error:
            "Exercise slug is required",
        },
        { status: 400 },
      );
    }

    const [chapter] = await db
      .select({
        id: CourseChaptersTable.id,
        courseId: CourseChaptersTable.courseId,
        exercises:
          CourseChaptersTable.exercises,
      })
      .from(CourseChaptersTable)
      .where(
        eq(
          CourseChaptersTable.id,
          chapterId,
        ),
      )
      .limit(1);

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 },
      );
    }

    const exercise = chapter.exercises.find(
      (item) => item.slug === exerciseSlug,
    );

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 },
      );
    }

    const [enrollment] = await db
      .select({
        id: courseEnrollmentsTable.id,
      })
      .from(courseEnrollmentsTable)
      .where(
        and(
          eq(
            courseEnrollmentsTable.userId,
            clerkId,
          ),
          eq(
            courseEnrollmentsTable.courseId,
            chapter.courseId,
          ),
        ),
      )
      .limit(1);

    if (!enrollment) {
      return NextResponse.json(
        {
          error:
            "You must enroll in this course first",
        },
        { status: 403 },
      );
    }

    const [completion] = await db
  .insert(completedExercisesTable)
  .values({
    userId: clerkId,
    chapterId: chapter.id,
    exerciseSlug,
  })
  .onConflictDoNothing({
    target: [
      completedExercisesTable.userId,
      completedExercisesTable.chapterId,
      completedExercisesTable.exerciseSlug,
    ],
  })
  .returning({
    id: completedExercisesTable.id,
    completedAt:
      completedExercisesTable.completedAt,
  });

/*
 * Якщо insert нічого не повернув,
 * вправа вже була завершена.
 *
 * Завдяки цьому XP повторно не додається.
 */
if (!completion) {
  return NextResponse.json({
    completed: true,
    alreadyCompleted: true,
    xpEarned: 0,
    message:
      "Exercise was already completed",
  });
}

/*
 * neon-http підтримує batch,
 * але не підтримує db.transaction().
 */
await db.batch([
  db
    .update(usersTable)
    .set({
      points: sql`
        coalesce(${usersTable.points}, 0)
        + ${exercise.xp}
      `,
    })
    .where(
      eq(
        usersTable.clerkId,
        clerkId,
      ),
    ),

  db
    .update(courseEnrollmentsTable)
    .set({
      xpEarned: sql`
        coalesce(
          ${courseEnrollmentsTable.xpEarned},
          0
        ) + ${exercise.xp}
      `,
    })
    .where(
      eq(
        courseEnrollmentsTable.id,
        enrollment.id,
      ),
    ),
]);

return NextResponse.json(
  {
    completed: true,
    alreadyCompleted: false,
    xpEarned: exercise.xp,
    completion,
    message: "Exercise completed",
  },
  {
    status: 201,
  },
);
  } catch (error) {
    console.error(
      "Completed exercise completion error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to complete exercise",
      },
      { status: 500 },
    );
  }
}
