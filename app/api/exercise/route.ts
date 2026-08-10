import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/config/db";
import {
  courseEnrollmentsTable,
  CourseChaptersTable,
  ExerciseTable,
  type Exercise as ChapterExercise,
} from "@/config/schema";

interface ExerciseRequestBody {
  courseId?: unknown;
  chapterId?: unknown;
  exerciseId?: unknown;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlComment(value: string) {
  return value.replaceAll("-->", "--&gt;");
}

function getFallbackId(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return -Math.max(1, Math.abs(hash));
}

function createFallbackExercise({
  courseId,
  chapterId,
  chapterName,
  chapterDescription,
  exercise,
}: {
  courseId: number;
  chapterId: number;
  chapterName: string;
  chapterDescription: string;
  exercise: {
    name: string;
    slug: string;
    difficulty: "easy" | "medium" | "hard";
  };
}) {
  const safeChapterName = escapeHtml(chapterName);
  const safeChapterDescription = escapeHtml(chapterDescription);
  const safeExerciseName = escapeHtml(exercise.name);
  const commentExerciseName = escapeHtmlComment(exercise.name);

  const hintXp =
    exercise.difficulty === "hard"
      ? 70
      : exercise.difficulty === "medium"
        ? 50
        : 30;

  return {
    id: getFallbackId(`${courseId}:${chapterId}:${exercise.slug}`),
    courseId,
    chapterId,
    exerciseId: exercise.slug,
    exerciseName: exercise.name,
    content: [
      `<h3>${safeExerciseName}</h3>`,
      `<p>This mission belongs to the <strong>${safeChapterName}</strong> chapter.</p>`,
      `<p>${safeChapterDescription}</p>`,
      "<p>HTML gives a webpage its structure by arranging elements inside one another.</p>",
      "<p>A complete page starts with <code>&lt;!DOCTYPE html&gt;</code>.</p>",
      "<p>The <code>&lt;html&gt;</code> element contains the complete document.</p>",
      "<p>The <code>&lt;head&gt;</code> contains information used by the browser.</p>",
      "<p>The <code>&lt;body&gt;</code> contains everything visible on the page.</p>",
      "<p>Use semantic elements that match the meaning of your content.</p>",
      "<p>Keep opening and closing tags correctly paired.</p>",
      "<p>Indent nested elements so the document is easier to read.</p>",
      "<p>Use the preview to check your result while you work.</p>",
      "<p>Different valid solutions are accepted when they create the requested structure.</p>",
      `<p>Your current objective is <strong>${safeExerciseName}</strong>.</p>`,
    ].join(""),
    task: [
      `<h3>${safeExerciseName}</h3>`,
      `<p>Create a valid HTML page that demonstrates the idea behind <strong>${safeExerciseName}</strong>.</p>`,
      "<ul>",
      "<li>Keep the document structure valid.</li>",
      "<li>Add at least one clear heading.</li>",
      "<li>Add meaningful page content below the heading.</li>",
      `<li>Use elements that fit the <strong>${safeChapterName}</strong> topic.</li>`,
      "<li>Check the result in the live preview.</li>",
      "</ul>",
    ].join(""),
    hint: `<p>Start with the document skeleton, then build the visible content inside <code>&lt;body&gt;</code>. Think about which HTML element best represents ${safeExerciseName}.</p>`,
    starterCode: {
      "index.html": [
        "<!DOCTYPE html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="UTF-8" />',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        `    <title>${exercise.name}</title>`,
        "  </head>",
        "  <body>",
        `    <!-- Complete the ${commentExerciseName} mission here -->`,
        "  </body>",
        "</html>",
      ].join("\n"),
    },
    validationRegex:
      "(?is)<!DOCTYPE\\s+html[^>]*>[\\s\\S]*<html[^>]*>[\\s\\S]*<body[^>]*>[\\s\\S]*<h[1-6][^>]*>[\\s\\S]*</h[1-6]>[\\s\\S]*</body>[\\s\\S]*</html>",
    expectedOutput: `<main><h1>${safeExerciseName}</h1><p>A completed ${safeChapterName} mission.</p></main>`,
    hintXp,
    isFallback: true,
  };
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ExerciseRequestBody;
    const courseId = Number(body.courseId);
    const chapterId = Number(body.chapterId);
    const exerciseId =
      typeof body.exerciseId === "string" ? body.exerciseId.trim() : "";

    if (
      !Number.isInteger(courseId) ||
      courseId <= 0 ||
      !Number.isInteger(chapterId) ||
      chapterId <= 0 ||
      !exerciseId
    ) {
      return NextResponse.json(
        {
          error: "Valid courseId, chapterId and exerciseId are required",
        },
        { status: 400 },
      );
    }

    const [enrollment] = await db
      .select({ id: courseEnrollmentsTable.id })
      .from(courseEnrollmentsTable)
      .where(
        and(
          eq(courseEnrollmentsTable.userId, clerkId),
          eq(courseEnrollmentsTable.courseId, courseId),
        ),
      )
      .limit(1);

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enroll in the course first" },
        { status: 403 },
      );
    }

    const [chapter] = await db
      .select()
      .from(CourseChaptersTable)
      .where(
        and(
          eq(CourseChaptersTable.courseId, courseId),
          eq(CourseChaptersTable.chapterId, chapterId),
        ),
      )
      .limit(1);

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const exerciseMetadata = chapter.exercises.find(
      (exercise: ChapterExercise) => exercise.slug === exerciseId,
    );

    if (!exerciseMetadata) {
      return NextResponse.json(
        { error: "Exercise not found in this chapter" },
        { status: 404 },
      );
    }

    const [exercise] = await db
      .select()
      .from(ExerciseTable)
      .where(
        and(
          eq(ExerciseTable.courseId, courseId),
          eq(ExerciseTable.chapterId, chapterId),
          eq(ExerciseTable.exerciseId, exerciseId),
        ),
      )
      .limit(1);

    if (!exercise) {
  return NextResponse.json(
    {
      error: "Exercise content has not been created yet",
      missingExercise: {
        courseId,
        chapterId,
        exerciseId,
        exerciseName: exerciseMetadata.name,
      },
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
    console.error("Exercise loading error:", error);

    return NextResponse.json(
      { error: "Failed to load exercise" },
      { status: 500 },
    );
  }
}
