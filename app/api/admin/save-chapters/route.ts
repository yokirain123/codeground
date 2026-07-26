import { auth } from "@clerk/nextjs/server";
import {
  asc,
  eq,
} from "drizzle-orm";
import { NextResponse } from "next/server";

import { DATA } from "@/app/api/course-chapters/data";

import { db } from "@/config/db";
import {
  CourseChaptersTable,
  coursesTable,
  usersTable,
} from "@/config/schema";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const courseId = Number(
      url.searchParams.get("courseId"),
    );

    if (!Number.isInteger(courseId)) {
      return NextResponse.json(
        { error: "Valid courseId is required" },
        { status: 400 },
      );
    }

    const chapters = await db
      .select()
      .from(CourseChaptersTable)
      .where(
        eq(
          CourseChaptersTable.courseId,
          courseId,
        ),
      )
      .orderBy(
        asc(CourseChaptersTable.chapterId),
      );

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Chapters loading error:", error);

    return NextResponse.json(
      { error: "Failed to load chapters" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const [currentUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Only admins can create course chapters",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const courseId = Number(body.courseId);

    if (!Number.isInteger(courseId)) {
      return NextResponse.json(
        { error: "Valid courseId is required" },
        { status: 400 },
      );
    }

    const [course] = await db
      .select({
        id: coursesTable.id,
      })
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      );
    }

    const chapters = DATA.map((item) => ({
      courseId,
      chapterId: item.id,
      name: item.name,
      desc: item.desc,
      exercises: item.exercises,
    }));

    const insertedChapters = await db
      .insert(CourseChaptersTable)
      .values(chapters)
      .onConflictDoNothing()
      .returning();

    return NextResponse.json(
      {
        message: "Course chapters created",
        inserted: insertedChapters.length,
        chapters: insertedChapters,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Chapter creation error:", error);

    return NextResponse.json(
      { error: "Failed to create chapters" },
      { status: 500 },
    );
  }
}