import { db } from "@/config/db";
import {
  CourseChaptersTable,
  ExerciseTable,
} from "@/config/schema";
import { and, eq } from "drizzle-orm";
import {
  NextRequest,
  NextResponse,
} from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const courseId = Number(body.courseId);
    const chapterId = Number(body.chapterId);

    const exerciseId =
      typeof body.exerciseId === "string"
        ? body.exerciseId.trim()
        : "";

    if (
      !Number.isInteger(courseId) ||
      courseId <= 0 ||
      !Number.isInteger(chapterId) ||
      chapterId <= 0 ||
      !exerciseId
    ) {
      return NextResponse.json(
        {
          error:
            "Valid courseId, chapterId and exerciseId are required",
        },
        {
          status: 400,
        },
      );
    }

    const [chapter] = await db
      .select()
      .from(CourseChaptersTable)
      .where(
        and(
          eq(
            CourseChaptersTable.courseId,
            courseId,
          ),
          eq(
            CourseChaptersTable.chapterId,
            chapterId,
          ),
        ),
      )
      .limit(1);

    if (!chapter) {
      return NextResponse.json(
        {
          error: "Chapter not found",
        },
        {
          status: 404,
        },
      );
    }

    const [exercise] = await db
      .select()
      .from(ExerciseTable)
      .where(
        and(
          eq(
            ExerciseTable.courseId,
            courseId,
          ),
          eq(
            ExerciseTable.chapterId,
            chapterId,
          ),
          eq(
            ExerciseTable.exerciseId,
            exerciseId,
          ),
        ),
      )
      .limit(1);

    if (!exercise) {
      return NextResponse.json(
        {
          error: "Exercise not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      ...chapter,
      exerciseData: exercise,
    });
  } catch (error) {
    console.error(
      "Exercise loading error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to load exercise",
      },
      {
        status: 500,
      },
    );
  }
}