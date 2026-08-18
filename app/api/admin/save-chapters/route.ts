import { auth } from "@clerk/nextjs/server";
import { asc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getCourseChapterData } from "@/app/api/course-chapters/beginnerData";
import { db } from "@/config/db";
import {
  CourseChaptersTable,
  coursesTable,
  usersTable,
} from "@/config/schema";
import { getServerI18n } from "@/lib/i18n/server";

export async function GET(request: Request) {
  const { t } = await getServerI18n();

  try {
    const url = new URL(request.url);
    const courseId = Number(url.searchParams.get("courseId"));

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { error: t("Valid courseId is required") },
        { status: 400 },
      );
    }

    const chapters = await db
      .select()
      .from(CourseChaptersTable)
      .where(eq(CourseChaptersTable.courseId, courseId))
      .orderBy(asc(CourseChaptersTable.chapterId));

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Chapters loading error:", error);

    return NextResponse.json(
      { error: t("Failed to load chapters") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { t } = await getServerI18n();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: t("Unauthorized") }, { status: 401 });
    }

    const [currentUser] = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: t("User not found") }, { status: 404 });
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { error: t("Only admins can create course chapters") },
        { status: 403 },
      );
    }

    const body = (await request.json()) as { courseId?: unknown };
    const courseId = Number(body.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { error: t("Valid courseId is required") },
        { status: 400 },
      );
    }

    const [course] = await db
      .select({
        id: coursesTable.id,
        title: coursesTable.title,
        tags: coursesTable.tags,
        level: coursesTable.level,
      })
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: t("Course not found") }, { status: 404 });
    }

    const courseData = getCourseChapterData(course);

    if (!courseData) {
      const chapters = await db
        .select()
        .from(CourseChaptersTable)
        .where(eq(CourseChaptersTable.courseId, courseId))
        .orderBy(asc(CourseChaptersTable.chapterId));

      return NextResponse.json(
        {
          message: t(
            "{course} was created without an automatic chapter template. You can add its curriculum separately.",
            { course: course.title },
          ),
          templateApplied: false,
          synchronized: 0,
          chapters,
        },
        { status: 200 },
      );
    }

    const chapterRows = courseData.map((chapter) => ({
      courseId,
      chapterId: chapter.id,
      name: chapter.name,
      desc: chapter.desc,
      exercises: chapter.exercises,
    }));

    const syncedChapters = await db
      .insert(CourseChaptersTable)
      .values(chapterRows)
      .onConflictDoUpdate({
        target: [
          CourseChaptersTable.courseId,
          CourseChaptersTable.chapterId,
        ],
        set: {
          name: sql.raw('excluded."name"'),
          desc: sql.raw('excluded."description"'),
          exercises: sql.raw('excluded."exercises"'),
        },
      })
      .returning();

    const chapters = await db
      .select()
      .from(CourseChaptersTable)
      .where(eq(CourseChaptersTable.courseId, courseId))
      .orderBy(asc(CourseChaptersTable.chapterId));

    return NextResponse.json(
      {
        message: t("Synchronized {count} chapters for {course}", {
          count: syncedChapters.length,
          course: course.title,
        }),
        templateApplied: true,
        synchronized: syncedChapters.length,
        chapters,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Chapter creation error:", error);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : t("Failed to create chapters"),
      },
      { status: 500 },
    );
  }
}
