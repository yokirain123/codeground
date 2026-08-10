import { auth } from "@clerk/nextjs/server";
import { zodTextFormat } from "openai/helpers/zod";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getOpenAIClient } from "@/lib/openai";

import { db } from "@/config/db";
import {
  coursesTable,
  CourseChaptersTable,
  ExerciseTable,
  usersTable,
  type Exercise as ChapterExercise,
  type StarterCode,
} from "@/config/schema";

interface GenerateExercisesBody {
  courseId?: unknown;
  chapterId?: unknown;
  overwrite?: unknown;
}

interface GeneratedExerciseRecord {
  exerciseName: string;
  exerciseId: string;
  content: string;
  task: string;
  hint: string;
  starterCode: StarterCode;
  validationRegex: string;
  expectedOutput: string;
  hintXp: number;
}

const GeneratedFileSchema = z.object({
  filename: z.string(),
  code: z.string(),
});

const GeneratedExerciseSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  content: z.string(),
  task: z.string(),
  hint: z.string(),
  starterFiles: z.array(GeneratedFileSchema),
  referenceFiles: z.array(GeneratedFileSchema),
  validationRegex: z.string(),
  expectedOutput: z.string(),
  hintXp: z.number().int(),
});

const GeneratedChapterSchema = z.object({
  exercises: z.array(GeneratedExerciseSchema),
});

type GeneratedExercise = z.infer<typeof GeneratedExerciseSchema>;
type GeneratedFile = z.infer<typeof GeneratedFileSchema>;

const GENERATOR_INSTRUCTIONS = `
You generate beginner-friendly coding exercises for the CodeQuest learning platform.

Generate exactly one unique exercise for every exercise metadata item supplied by the user.
Keep every exerciseId exactly unchanged.
Keep every exerciseName exactly unchanged.
Each exercise must teach and test a different concept described by its name, chapter and difficulty.
Do not reuse the same explanation, task, starter code, validation rule, or solution between exercises.
Exercises in the same chapter should form a logical progression.

content requirements:
- Return an HTML fragment only, without Markdown fences.
- Explain the exact concept in beginner-friendly, game-like language.
- Use multiple short paragraphs, lists, and code examples where useful.
- Wrap inline code examples in <code></code>.
- Do not include the complete solution.
- Do not add background colors or text colors.

task requirements:
- Return an HTML fragment only.
- Give a concrete, testable task.
- Clearly list the required elements or behavior.
- Do not reveal the complete solution.

hint requirements:
- Return an HTML fragment only.
- Help the student progress without giving the complete answer.

starterFiles requirements:
- Provide incomplete but runnable starter files.
- Preserve proper indentation and line breaks.
- The starter code must NOT already satisfy validationRegex.
- For HTML exercises normally use index.html and add styles.css or script.js only when needed.

referenceFiles requirements:
- Provide a complete private reference solution used only by the server to verify validationRegex.
- It must satisfy validationRegex.
- Do not mention or reveal this solution in content, task, hint, starterFiles, or expectedOutput.

validationRegex requirements:
- Return a JavaScript-compatible regular-expression source string without / delimiters.
- You may begin it with (?i), (?s), or (?is); the server converts these flags.
- It must validate the real requirement, not exact whitespace, indentation, text content, or attribute order.
- Accept different valid implementations of the same task.
- Use [\\s\\S] where matching across multiple lines is necessary.
- The regex must fail for starterFiles and pass for referenceFiles.

expectedOutput requirements:
- Return a short HTML example of the expected rendered result.
- It is a visual reference, not the only accepted answer.

hintXp requirements:
- Easy: 30 to 40.
- Medium: 45 to 60.
- Hard: 65 to 80.
`;

function normalizeFilename(value: string) {
  return value.trim().replaceAll("\\", "/").replace(/^\/+/, "");
}

function filesToRecord(files: GeneratedFile[], label: string): StarterCode {
  if (files.length === 0 || files.length > 10) {
    throw new Error(`${label} must contain between 1 and 10 files`);
  }

  const result: StarterCode = {};

  for (const file of files) {
    const filename = normalizeFilename(file.filename);

    if (!filename || !file.code.trim()) {
      throw new Error(`${label} contains an empty filename or file`);
    }

    if (filename.includes("..")) {
      throw new Error(`${label} contains an invalid filename`);
    }

    if (result[filename] !== undefined) {
      throw new Error(`${label} contains duplicate file ${filename}`);
    }

    result[filename] = file.code;
  }

  return result;
}

function compileValidationRegex(value: string) {
  let source = value.trim();
  const flags = new Set<string>();
  const inlineFlags = source.match(/^\(\?([ims]+)\)/);

  if (inlineFlags) {
    source = source.slice(inlineFlags[0].length);

    for (const flag of inlineFlags[1]) {
      flags.add(flag);
    }
  }

  return new RegExp(source, [...flags].join(""));
}

function regexMatchesFiles(pattern: RegExp, files: StarterCode) {
  const entries = Object.entries(files);
  const combinedCode = entries
    .map(([filename, code]) => `/* FILE: ${filename} */\n${code}`)
    .join("\n\n");

  return [...entries.map(([, code]) => code), combinedCode].some((code) =>
    pattern.test(code),
  );
}

function getHintXpRange(difficulty: ChapterExercise["difficulty"]) {
  if (difficulty === "hard") {
    return { minimum: 65, maximum: 80 };
  }

  if (difficulty === "medium") {
    return { minimum: 45, maximum: 60 };
  }

  return { minimum: 30, maximum: 40 };
}

function validateGeneratedExercise(
  generated: GeneratedExercise,
  metadata: ChapterExercise,
): GeneratedExerciseRecord {
  if (generated.exerciseId !== metadata.slug) {
    throw new Error(
      `AI changed exerciseId ${metadata.slug} to ${generated.exerciseId}`,
    );
  }

  if (generated.exerciseName !== metadata.name) {
    throw new Error(`AI changed the name of ${metadata.slug}`);
  }

  if (
    generated.content.trim().length < 300 ||
    generated.task.trim().length < 120 ||
    generated.hint.trim().length < 40
  ) {
    throw new Error(`AI generated incomplete content for ${metadata.slug}`);
  }

  const starterCode = filesToRecord(
    generated.starterFiles,
    `${metadata.slug} starterFiles`,
  );

  const referenceCode = filesToRecord(
    generated.referenceFiles,
    `${metadata.slug} referenceFiles`,
  );

  let validationPattern: RegExp;

  try {
    validationPattern = compileValidationRegex(generated.validationRegex);
  } catch {
    throw new Error(`AI generated an invalid regex for ${metadata.slug}`);
  }

  if (regexMatchesFiles(validationPattern, starterCode)) {
    throw new Error(`Starter code already solves ${metadata.slug}`);
  }

  if (!regexMatchesFiles(validationPattern, referenceCode)) {
    throw new Error(
      `Validation regex rejects the solution for ${metadata.slug}`,
    );
  }

  const { minimum, maximum } = getHintXpRange(metadata.difficulty);

  if (generated.hintXp < minimum || generated.hintXp > maximum) {
    throw new Error(
      `hintXp for ${metadata.slug} must be between ${minimum} and ${maximum}`,
    );
  }

  return {
    exerciseId: metadata.slug,
    exerciseName: metadata.name,
    content: generated.content.trim(),
    task: generated.task.trim(),
    hint: generated.hint.trim(),
    starterCode,
    validationRegex: generated.validationRegex.trim(),
    expectedOutput: generated.expectedOutput.trim(),
    hintXp: generated.hintXp,
  };
}

function assertUniqueTasks(exercises: GeneratedExerciseRecord[]) {
  const tasks = new Set<string>();

  for (const exercise of exercises) {
    const normalizedTask = exercise.task
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (tasks.has(normalizedTask)) {
      throw new Error("AI generated duplicate exercise tasks");
    }

    tasks.add(normalizedTask);
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [currentUser] = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can generate exercises" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as GenerateExercisesBody;
    const courseId = Number(body.courseId);
    const chapterId = Number(body.chapterId);
    const overwrite = body.overwrite === true;

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { error: "Valid courseId is required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(chapterId) || chapterId <= 0) {
      return NextResponse.json(
        { error: "Valid chapterId is required" },
        { status: 400 },
      );
    }

    const [[course], [chapter], existingExercises] = await Promise.all([
      db
        .select({
          id: coursesTable.id,
          title: coursesTable.title,
          desc: coursesTable.desc,
          level: coursesTable.level,
          tags: coursesTable.tags,
        })
        .from(coursesTable)
        .where(eq(coursesTable.id, courseId))
        .limit(1),
      db
        .select({
          id: CourseChaptersTable.id,
          name: CourseChaptersTable.name,
          desc: CourseChaptersTable.desc,
          exercises: CourseChaptersTable.exercises,
        })
        .from(CourseChaptersTable)
        .where(
          and(
            eq(CourseChaptersTable.courseId, courseId),
            eq(CourseChaptersTable.chapterId, chapterId),
          ),
        )
        .limit(1),
      db
        .select({ exerciseId: ExerciseTable.exerciseId })
        .from(ExerciseTable)
        .where(
          and(
            eq(ExerciseTable.courseId, courseId),
            eq(ExerciseTable.chapterId, chapterId),
          ),
        ),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const existingSlugs = new Set(
      existingExercises.map((exercise) => exercise.exerciseId),
    );

    const targetExercises = (chapter.exercises as ChapterExercise[]).filter(
      (exercise) => overwrite || !existingSlugs.has(exercise.slug),
    );

    if (targetExercises.length === 0) {
      return NextResponse.json({
        generated: 0,
        skipped: chapter.exercises.length,
        message: "All exercises in this chapter already have content",
      });
    }

    const openai = getOpenAIClient();

    const response = await openai.responses.parse({
      model: process.env.OPENAI_EXERCISE_MODEL ?? "gpt-5-mini",
      input: [
        {
          role: "system",
          content: GENERATOR_INSTRUCTIONS,
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              course: {
                title: course.title,
                description: course.desc,
                level: course.level,
                tags: course.tags,
              },
              chapter: {
                chapterId,
                name: chapter.name,
                description: chapter.desc,
              },
              exercises: targetExercises,
            },
            null,
            2,
          ),
        },
      ],
      text: {
        format: zodTextFormat(
          GeneratedChapterSchema,
          "generated_chapter_exercises",
        ),
      },
    });

    const generatedChapter = response.output_parsed;

    if (!generatedChapter) {
      throw new Error("AI did not return exercise data");
    }

    const generatedBySlug = new Map<string, GeneratedExercise>();

    for (const generatedExercise of generatedChapter.exercises) {
      if (generatedBySlug.has(generatedExercise.exerciseId)) {
        throw new Error(`AI duplicated ${generatedExercise.exerciseId}`);
      }

      generatedBySlug.set(generatedExercise.exerciseId, generatedExercise);
    }

    const validatedExercises = targetExercises.map((metadata) => {
      const generatedExercise = generatedBySlug.get(metadata.slug);

      if (!generatedExercise) {
        throw new Error(`AI did not generate ${metadata.slug}`);
      }

      return validateGeneratedExercise(generatedExercise, metadata);
    });

    if (generatedBySlug.size !== targetExercises.length) {
      throw new Error("AI returned exercises that were not requested");
    }

    assertUniqueTasks(validatedExercises);

    for (const exercise of validatedExercises) {
      await db
        .insert(ExerciseTable)
        .values({
          courseId,
          chapterId,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          content: exercise.content,
          task: exercise.task,
          hint: exercise.hint,
          starterCode: exercise.starterCode,
          validationRegex: exercise.validationRegex,
          expectedOutput: exercise.expectedOutput,
          hintXp: exercise.hintXp,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            ExerciseTable.courseId,
            ExerciseTable.chapterId,
            ExerciseTable.exerciseId,
          ],
          set: {
            exerciseName: exercise.exerciseName,
            content: exercise.content,
            task: exercise.task,
            hint: exercise.hint,
            starterCode: exercise.starterCode,
            validationRegex: exercise.validationRegex,
            expectedOutput: exercise.expectedOutput,
            hintXp: exercise.hintXp,
            updatedAt: new Date(),
          },
        });
    }

    return NextResponse.json(
      {
        generated: validatedExercises.length,
        skipped: overwrite ? 0 : existingExercises.length,
        exercises: validatedExercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
        })),
        message: `Generated ${validatedExercises.length} unique exercises`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("AI exercise generation error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate exercises";

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? message
            : "Failed to generate exercises",
      },
      { status: 500 },
    );
  }
}