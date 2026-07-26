import { auth } from "@clerk/nextjs/server";
import {
  desc,
  eq,
} from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import {
  courseEnrollmentsTable,
  coursesTable,
} from "@/config/schema";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

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

    const enrolledCourses = await db
      .select({
        enrollmentId:
          courseEnrollmentsTable.id,

        courseId: coursesTable.id,
        title: coursesTable.title,
        desc: coursesTable.desc,
        bannerImage:
          coursesTable.bannerImage,
        level: coursesTable.level,
        tags: coursesTable.tags,

        xpEarned:
          courseEnrollmentsTable.xpEarned,

        enrolledAt:
          courseEnrollmentsTable.enrolledAt,
      })
      .from(courseEnrollmentsTable)
      .innerJoin(
        coursesTable,
        eq(
          courseEnrollmentsTable.courseId,
          coursesTable.id,
        ),
      )
      .where(
        eq(
          courseEnrollmentsTable.userId,
          clerkId,
        ),
      )
      .orderBy(
        desc(
          courseEnrollmentsTable.enrolledAt,
        ),
      );

    return NextResponse.json(enrolledCourses);
  } catch (error) {
    console.error(
      "Enrolled courses loading error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load enrolled courses",
      },
      {
        status: 500,
      },
    );
  }
}