import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@clerk/nextjs/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/config/db";
import {
  coursesTable,
  CourseChaptersTable,
  ExerciseTable,
  usersTable,
} from "@/config/schema";
import { getServerI18n } from "@/lib/i18n/server";

import AdminExerciseGenerator, {
  type AdminCourse,
} from "./_components/AdminExerciseGenerator";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("AI Exercise Forge | CodeQuest"),
    description: t(
      "Generate lessons, tasks, starter files, hints, and validation rules for CodeQuest courses.",
    ),
  };
}

/**
 * Renders the admin page for reviewing and generating course exercises.
 */
export default async function AdminExercisesPage() {
  const { t } = await getServerI18n();
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const [currentUser] = await db
    .select({
      id: usersTable.id,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/");
  }

  const [courseRows, chapterRows, exerciseRows] = await Promise.all([
    db
      .select({
        id: coursesTable.id,
        title: coursesTable.title,
        desc: coursesTable.desc,
        level: coursesTable.level,
        tags: coursesTable.tags,
      })
      .from(coursesTable)
      .orderBy(asc(coursesTable.id)),

    db
      .select({
        databaseId: CourseChaptersTable.id,
        courseId: CourseChaptersTable.courseId,
        chapterId: CourseChaptersTable.chapterId,
        name: CourseChaptersTable.name,
        desc: CourseChaptersTable.desc,
        exercises: CourseChaptersTable.exercises,
      })
      .from(CourseChaptersTable)
      .orderBy(
        asc(CourseChaptersTable.courseId),
        asc(CourseChaptersTable.chapterId),
      ),

    db
      .select({
        courseId: ExerciseTable.courseId,
        chapterId: ExerciseTable.chapterId,
        exerciseId: ExerciseTable.exerciseId,
      })
      .from(ExerciseTable),
  ]);

  const readyExerciseKeys = new Set(
    exerciseRows.map(
      (exercise) =>
        `${exercise.courseId}:${exercise.chapterId}:${exercise.exerciseId}`,
    ),
  );

  const courses: AdminCourse[] = courseRows.map((course) => ({
    ...course,
    chapters: chapterRows
      .filter((chapter) => chapter.courseId === course.id)
      .map((chapter) => {
        const exercises = chapter.exercises.map((exercise) => ({
          name: exercise.name,
          slug: exercise.slug,
          xp: exercise.xp,
          difficulty: exercise.difficulty,
          isReady: readyExerciseKeys.has(
            `${course.id}:${chapter.chapterId}:${exercise.slug}`,
          ),
        }));

        return {
          databaseId: chapter.databaseId,
          chapterId: chapter.chapterId,
          name: chapter.name,
          desc: chapter.desc,
          exercises,
          readyCount: exercises.filter((exercise) => exercise.isReady).length,
          totalCount: exercises.length,
        };
      }),
  }));

  const totalChapters = courses.reduce(
    (total, course) => total + course.chapters.length,
    0,
  );

  const totalExercises = courses.reduce(
    (courseTotal, course) =>
      courseTotal +
      course.chapters.reduce(
        (chapterTotal, chapter) => chapterTotal + chapter.totalCount,
        0,
      ),
    0,
  );

  const readyExercises = courses.reduce(
    (courseTotal, course) =>
      courseTotal +
      course.chapters.reduce(
        (chapterTotal, chapter) => chapterTotal + chapter.readyCount,
        0,
      ),
    0,
  );

  return (
    <main className="min-h-[calc(100dvh-64px)] bg-background px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-16">
      <header className="mb-10 flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-foreground/40">
            {t("Admin panel")}
          </p>

          <h1 className="mt-1 break-words font-pixel text-3xl text-accent sm:text-4xl md:text-6xl">
            {t("AI Exercise Forge")}
          </h1>

          <p className="mt-3 max-w-3xl text-xl text-foreground/60">
            {t(
              "Generate unique lessons, tasks, starter files, hints and validation rules for every course chapter.",
            )}
          </p>
        </div>

        <Link
          href="/courses"
          className="w-full border border-accent bg-accent px-4 py-2 text-center text-xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#FF8C00] sm:w-fit"
        >
          {t("View courses")}
        </Link>
      </header>

      <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("Courses")} value={courses.length} />
        <StatCard label={t("Chapters")} value={totalChapters} />
        <StatCard label={t("Ready exercises")} value={readyExercises} success />
        <StatCard
          label={t("Missing exercises")}
          value={Math.max(0, totalExercises - readyExercises)}
          warning={readyExercises < totalExercises}
        />
      </section>

      <AdminExerciseGenerator courses={courses} />
    </main>
  );
}

function StatCard({
  label,
  value,
  success = false,
  warning = false,
}: {
  label: string;
  value: number;
  success?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="border border-border bg-card p-5 shadow-[4px_4px_0_0_var(--border)]">
      <p className="text-lg text-foreground/50">{label}</p>

      <p
        className={`mt-1 font-pixel text-4xl ${
          success
            ? "text-green-400"
            : warning
              ? "text-orange-400"
              : "text-accent"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
