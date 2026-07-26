import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/config/db";
import {
  coursesTable,
  usersTable,
} from "@/config/schema";

export async function GET() {
  try {
    const courses = await db
      .select({
        id: coursesTable.id,
        title: coursesTable.title,
        desc: coursesTable.desc,
        bannerImage: coursesTable.bannerImage,
        level: coursesTable.level,
        tags: coursesTable.tags,
      })
      .from(coursesTable)
      .orderBy(desc(coursesTable.id));

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Courses loading error:", error);

    return NextResponse.json(
      { error: "Failed to load courses" },
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
        { error: "Only admins can create courses" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const {
      title,
      desc,
      bannerImage,
      level = "Beginner",
      tags,
    } = body;

    if (!title || !desc || !bannerImage) {
      return NextResponse.json(
        {
          error:
            "Title, description and banner image are required",
        },
        { status: 400 },
      );
    }

    const [course] = await db
      .insert(coursesTable)
      .values({
        title: title.trim(),
        desc: desc.trim(),
        bannerImage: bannerImage.trim(),
        level,
        tags: tags || null,
        createdBy: currentUser.id,
      })
      .returning();

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Course creation error:", error);

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
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
        { error: "Only admins can edit courses" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const courseId = Number(body.id);

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const desc =
      typeof body.desc === "string"
        ? body.desc.trim()
        : "";

    const bannerImage =
      typeof body.bannerImage === "string"
        ? body.bannerImage.trim()
        : "";

    const level =
      typeof body.level === "string" &&
      body.level.trim()
        ? body.level.trim()
        : "Beginner";

    const tags =
      typeof body.tags === "string" &&
      body.tags.trim()
        ? body.tags.trim()
        : null;

    if (
      !Number.isInteger(courseId) ||
      courseId <= 0
    ) {
      return NextResponse.json(
        { error: "Valid course ID is required" },
        { status: 400 },
      );
    }

    if (!title || !desc || !bannerImage) {
      return NextResponse.json(
        {
          error:
            "Title, description and banner image are required",
        },
        { status: 400 },
      );
    }

    const [updatedCourse] = await db
      .update(coursesTable)
      .set({
        title,
        desc,
        bannerImage,
        level,
        tags,
      })
      .where(eq(coursesTable.id, courseId))
      .returning();

    if (!updatedCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Course editing error:", error);

    return NextResponse.json(
      { error: "Failed to edit course" },
      { status: 500 },
    );
  }
}