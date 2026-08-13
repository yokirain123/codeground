import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import {
  completedExercisesTable,
  courseEnrollmentsTable,
  CourseChaptersTable,
  coursesTable,
  usersTable,
} from "@/config/schema";

interface ExerciseRecord {
  name: string;
  slug: string;
  xp: number;
  difficulty: "easy" | "medium" | "hard";
}

interface ChapterRecord {
  databaseId: number;
  courseId: number;
  chapterId: number;
  exercises: ExerciseRecord[];
}

const emptyStats = {
  player: null,
  course: null,
  activeQuest: null,
  progress: {
    completed: 0,
    total: 0,
    percent: 0,
  },
  isCourseCompleted: false,
};

function getExerciseKey(chapterDatabaseId: number, exerciseSlug: string) {
  return `${chapterDatabaseId}:${exerciseSlug}`;
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(emptyStats);
    }

    const [player] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        points: usersTable.points,
      })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId))
      .limit(1);

    if (!player) {
      return NextResponse.json(emptyStats);
    }

    const enrollments = await db
      .select({
        courseId: coursesTable.id,
        courseTitle: coursesTable.title,
        enrolledAt: courseEnrollmentsTable.enrolledAt,
      })
      .from(courseEnrollmentsTable)
      .innerJoin(
        coursesTable,
        eq(courseEnrollmentsTable.courseId, coursesTable.id),
      )
      .where(eq(courseEnrollmentsTable.userId, clerkId))
      .orderBy(desc(courseEnrollmentsTable.enrolledAt));

    if (enrollments.length === 0) {
      return NextResponse.json({
        ...emptyStats,
        player,
      });
    }

    const courseIds = enrollments.map((enrollment) => enrollment.courseId);

    const [chapterRows, completionRows] = await Promise.all([
      db
        .select({
          databaseId: CourseChaptersTable.id,
          courseId: CourseChaptersTable.courseId,
          chapterId: CourseChaptersTable.chapterId,
          exercises: CourseChaptersTable.exercises,
        })
        .from(CourseChaptersTable)
        .where(inArray(CourseChaptersTable.courseId, courseIds))
        .orderBy(asc(CourseChaptersTable.chapterId)),

      db
        .select({
          chapterDatabaseId: completedExercisesTable.chapterId,
          exerciseSlug: completedExercisesTable.exerciseSlug,
        })
        .from(completedExercisesTable)
        .innerJoin(
          CourseChaptersTable,
          eq(completedExercisesTable.chapterId, CourseChaptersTable.id),
        )
        .where(
          and(
            eq(completedExercisesTable.userId, clerkId),
            inArray(CourseChaptersTable.courseId, courseIds),
          ),
        ),
    ]);

    const chapters = chapterRows as ChapterRecord[];
    const completedKeys = new Set(
      completionRows.map((completion) =>
        getExerciseKey(completion.chapterDatabaseId, completion.exerciseSlug),
      ),
    );

    const courseStates = enrollments.map((enrollment) => {
      const courseChapters = chapters.filter(
        (chapter) => chapter.courseId === enrollment.courseId,
      );

      let completed = 0;
      let total = 0;
      let nextExercise:
        | {
            chapterId: number;
            exercise: ExerciseRecord;
          }
        | undefined;

      for (const chapter of courseChapters) {
        for (const exercise of chapter.exercises) {
          total += 1;

          const isCompleted = completedKeys.has(
            getExerciseKey(chapter.databaseId, exercise.slug),
          );

          if (isCompleted) {
            completed += 1;
          } else if (!nextExercise) {
            nextExercise = {
              chapterId: chapter.chapterId,
              exercise,
            };
          }
        }
      }

      return {
        ...enrollment,
        completed,
        total,
        nextExercise,
      };
    });

    const activeCourse =
      courseStates.find((course) => course.nextExercise) ?? courseStates[0]!;

    const percent =
      activeCourse.total > 0
        ? Math.round((activeCourse.completed / activeCourse.total) * 100)
        : 0;

    const activeQuest = activeCourse.nextExercise
      ? {
          title: activeCourse.nextExercise.exercise.name,
          xp: activeCourse.nextExercise.exercise.xp,
          href: `/courses/${activeCourse.courseId}/${
            activeCourse.nextExercise.chapterId
          }/${encodeURIComponent(activeCourse.nextExercise.exercise.slug)}`,
        }
      : null;

    return NextResponse.json({
      player,
      course: {
        id: activeCourse.courseId,
        title: activeCourse.courseTitle,
      },
      activeQuest,
      progress: {
        completed: activeCourse.completed,
        total: activeCourse.total,
        percent,
      },
      isCourseCompleted:
        activeCourse.total > 0 && activeCourse.completed === activeCourse.total,
    });
  } catch (error) {
    console.error("Hero stats loading error:", error);

    return NextResponse.json(
      { error: "Failed to load hero stats" },
      { status: 500 },
    );
  }
}
