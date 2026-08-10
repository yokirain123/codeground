import { auth } from "@clerk/nextjs/server";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import {
  completedExercisesTable,
  courseEnrollmentsTable,
  CourseChaptersTable,
  usersTable,
} from "@/config/schema";

interface CompleteExerciseBody {
  courseId?: unknown;
  chapterId?: unknown;
  exerciseSlug?: unknown;
  files?: unknown;
}

interface CourseChapterRecord {
  databaseId: number;
  chapterId: number;
  exercises: Array<{
    name: string;
    slug: string;
    xp: number;
    difficulty: "easy" | "medium" | "hard";
  }>;
}

interface CompletionRecord {
  id: number;
  courseId: number;
  chapterDatabaseId: number;
  chapterId: number;
  exerciseSlug: string;
  completedAt: Date;
  exercises: CourseChapterRecord["exercises"];
}

function normalizeExerciseSlug(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function getExerciseKey(chapterDatabaseId: number, exerciseSlug: string) {
  return `${chapterDatabaseId}:${exerciseSlug}`;
}

function getCompletionXp(completion: CompletionRecord) {
  return (
    completion.exercises.find(
      (exercise) => exercise.slug === completion.exerciseSlug,
    )?.xp ?? 0
  );
}

function findNextExercise(
  chapters: CourseChapterRecord[],
  completedKeys: Set<string>,
) {
  for (const chapter of chapters) {
    for (const exercise of chapter.exercises) {
      const key = getExerciseKey(chapter.databaseId, exercise.slug);

      if (!completedKeys.has(key)) {
        return {
          chapterId: chapter.chapterId,
          exerciseSlug: exercise.slug,
          exerciseName: exercise.name,
        };
      }
    }
  }

  return null;
}

async function getDatabaseUser(clerkId: string) {
  const [databaseUser] = await db
    .select({
      clerkId: usersTable.clerkId,
      points: usersTable.points,
    })
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  return databaseUser;
}

async function getCourseChapters(
  courseId: number,
): Promise<CourseChapterRecord[]> {
  const chapters = await db
    .select({
      databaseId: CourseChaptersTable.id,
      chapterId: CourseChaptersTable.chapterId,
      exercises: CourseChaptersTable.exercises,
    })
    .from(CourseChaptersTable)
    .where(eq(CourseChaptersTable.courseId, courseId))
    .orderBy(asc(CourseChaptersTable.chapterId));

  return chapters as CourseChapterRecord[];
}

async function getAllCompletions(clerkId: string): Promise<CompletionRecord[]> {
  const completions = await db
    .select({
      id: completedExercisesTable.id,
      courseId: CourseChaptersTable.courseId,
      chapterDatabaseId: CourseChaptersTable.id,
      chapterId: CourseChaptersTable.chapterId,
      exerciseSlug: completedExercisesTable.exerciseSlug,
      completedAt: completedExercisesTable.completedAt,
      exercises: CourseChaptersTable.exercises,
    })
    .from(completedExercisesTable)
    .innerJoin(
      CourseChaptersTable,
      eq(completedExercisesTable.chapterId, CourseChaptersTable.id),
    )
    .where(eq(completedExercisesTable.userId, clerkId));

  return completions as CompletionRecord[];
}

async function synchronizeXpTotals(clerkId: string, courseId: number) {
  const completions = await getAllCompletions(clerkId);

  let totalPoints = 0;
  let courseXpEarned = 0;

  for (const completion of completions) {
    const xp = getCompletionXp(completion);

    totalPoints += xp;

    if (completion.courseId === courseId) {
      courseXpEarned += xp;
    }
  }

  await Promise.all([
    db
      .update(usersTable)
      .set({
        points: totalPoints,
      })
      .where(eq(usersTable.clerkId, clerkId)),

    db
      .update(courseEnrollmentsTable)
      .set({
        xpEarned: courseXpEarned,
      })
      .where(
        and(
          eq(courseEnrollmentsTable.userId, clerkId),
          eq(courseEnrollmentsTable.courseId, courseId),
        ),
      ),
  ]);

  return {
    totalPoints,
    courseXpEarned,
  };
}

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const databaseUser = await getDatabaseUser(clerkId);

    if (!databaseUser) {
      return NextResponse.json(
        { error: "User was not found in the database" },
        { status: 404 },
      );
    }

    const url = new URL(request.url);
    const courseId = Number(url.searchParams.get("courseId"));
    const chapterIdParameter = url.searchParams.get("chapterId");
    const exerciseSlugParameter = url.searchParams.get("exerciseSlug");

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { error: "Valid courseId is required" },
        { status: 400 },
      );
    }

    const [allCompletions, chapters] = await Promise.all([
      getAllCompletions(clerkId),
      getCourseChapters(courseId),
    ]);

    const courseCompletions = allCompletions.filter(
      (completion) => completion.courseId === courseId,
    );

    const completedExercises = courseCompletions.map((completion) => ({
      id: completion.id,
      chapterDatabaseId: completion.chapterDatabaseId,
      chapterId: completion.chapterId,
      exerciseSlug: completion.exerciseSlug,
      completedAt: completion.completedAt,
      xpEarned: getCompletionXp(completion),
    }));

    const completedKeys = new Set(
      courseCompletions.map((completion) =>
        getExerciseKey(completion.chapterDatabaseId, completion.exerciseSlug),
      ),
    );

    /*
     * Recalculate XP from completion rows. This is idempotent, prevents
     * duplicate rewards and repairs counters created before XP syncing.
     */
    const xpSummary = await synchronizeXpTotals(clerkId, courseId);

    let isCompleted = false;

    if (chapterIdParameter && exerciseSlugParameter) {
      const chapterNumber = Number(chapterIdParameter);
      const exerciseSlug = normalizeExerciseSlug(exerciseSlugParameter);

      isCompleted = completedExercises.some(
        (completion) =>
          completion.chapterId === chapterNumber &&
          completion.exerciseSlug === exerciseSlug,
      );
    }

    return NextResponse.json({
      isCompleted,
      completedExercises,
      courseXpEarned: xpSummary.courseXpEarned,
      totalPoints: xpSummary.totalPoints,
      nextExercise: findNextExercise(chapters, completedKeys),
    });
  } catch (error) {
    const cause =
      error instanceof Error && "cause" in error ? error.cause : undefined;

    console.error("Completed exercises loading error:", error);
    console.error("Database cause:", cause);

    const message =
      cause instanceof Error
        ? cause.message
        : error instanceof Error
          ? error.message
          : "Failed to load completed exercises";

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? message
            : "Failed to load completed exercises",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const databaseUser = await getDatabaseUser(clerkId);

    if (!databaseUser) {
      return NextResponse.json(
        { error: "User was not found in the database" },
        { status: 404 },
      );
    }

    const body =
  (await request.json()) as CompleteExerciseBody;

const courseId = Number(body.courseId);
const chapterNumber = Number(body.chapterId);

const exerciseSlug =
  typeof body.exerciseSlug === "string"
    ? normalizeExerciseSlug(body.exerciseSlug)
    : "";

const submittedFiles = body.files;

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { error: "Valid courseId is required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(chapterNumber) || chapterNumber <= 0) {
      return NextResponse.json(
        { error: "Valid chapterId is required" },
        { status: 400 },
      );
    }

    if (!exerciseSlug) {
      return NextResponse.json(
        { error: "Exercise slug is required" },
        { status: 400 },
      );
    }

    const [enrollment, chapters, completions] = await Promise.all([
      db
        .select({ id: courseEnrollmentsTable.id })
        .from(courseEnrollmentsTable)
        .where(
          and(
            eq(courseEnrollmentsTable.userId, clerkId),
            eq(courseEnrollmentsTable.courseId, courseId),
          ),
        )
        .limit(1),
      getCourseChapters(courseId),
      getAllCompletions(clerkId),
    ]);

    if (!enrollment[0]) {
      return NextResponse.json(
        { error: "Enroll in the course first" },
        { status: 403 },
      );
    }

    const chapter = chapters.find((item) => item.chapterId === chapterNumber);

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const exercise = chapter.exercises.find(
      (item) => item.slug === exerciseSlug,
    );

    if (!exercise) {
      return NextResponse.json(
        {
          error: "Exercise not found",
          availableExercises: chapter.exercises.map((item) => item.slug),
        },
        { status: 404 },
      );
    }

    const courseCompletions = completions.filter(
      (completion) => completion.courseId === courseId,
    );
    const completedKeys = new Set(
      courseCompletions.map((completion) =>
        getExerciseKey(completion.chapterDatabaseId, completion.exerciseSlug),
      ),
    );
    const requestedKey = getExerciseKey(chapter.databaseId, exerciseSlug);
    const alreadyCompleted = completedKeys.has(requestedKey);
    const nextExercise = findNextExercise(chapters, completedKeys);

    if (
      !alreadyCompleted &&
      (nextExercise?.chapterId !== chapterNumber ||
        nextExercise.exerciseSlug !== exerciseSlug)
    ) {
      return NextResponse.json(
        {
          error: "Complete the previous exercise first",
          nextExercise,
        },
        { status: 403 },
      );
    }

    let completion = courseCompletions.find(
      (item) =>
        item.chapterDatabaseId === chapter.databaseId &&
        item.exerciseSlug === exerciseSlug,
    );
    let wasAlreadyCompleted = alreadyCompleted;

    if (!completion) {
      const [insertedCompletion] = await db
        .insert(completedExercisesTable)
        .values({
          userId: clerkId,
          chapterId: chapter.databaseId,
          exerciseSlug,
        })
        .onConflictDoNothing()
        .returning();

      if (insertedCompletion) {
        completion = {
          ...insertedCompletion,
          courseId,
          chapterDatabaseId: chapter.databaseId,
          chapterId: chapter.chapterId,
          exercises: chapter.exercises,
        };
        completedKeys.add(requestedKey);
      } else {
        /* Another request inserted the same unique row first. */
        wasAlreadyCompleted = true;
        completedKeys.add(requestedKey);
      }
    }

    const xpSummary = await synchronizeXpTotals(clerkId, courseId);

    return NextResponse.json(
      {
        completed: true,
        alreadyCompleted: wasAlreadyCompleted,
        completion: completion ?? null,
        xpEarned: wasAlreadyCompleted ? 0 : exercise.xp,
        courseXpEarned: xpSummary.courseXpEarned,
        totalPoints: xpSummary.totalPoints,
        nextExercise: findNextExercise(chapters, completedKeys),
        message: wasAlreadyCompleted
          ? "Exercise was already completed"
          : `Exercise completed. You earned ${exercise.xp} XP.`,
      },
      { status: wasAlreadyCompleted ? 200 : 201 },
    );
  } catch (error) {
    const cause =
      error instanceof Error && "cause" in error ? error.cause : undefined;

    console.error("Exercise completion error:", error);
    console.error("Database cause:", cause);

    const message =
      cause instanceof Error
        ? cause.message
        : error instanceof Error
          ? error.message
          : "Failed to complete exercise";

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? message
            : "Failed to complete exercise",
      },
      { status: 500 },
    );
  }
}
