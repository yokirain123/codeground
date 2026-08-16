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

const RepairedExerciseSchema = z.object({
  exercise: GeneratedExerciseSchema,
});

const RepairedValidationRegexSchema = z.object({
  validationRegex: z.string(),
});

const GENERATOR_ROUTE_VERSION = "multilanguage-cpp-partial-repair-v6";
const MAX_EXERCISE_REPAIR_ATTEMPTS = 2;

type GeneratedExercise = z.infer<typeof GeneratedExerciseSchema>;
type GeneratedFile = z.infer<typeof GeneratedFileSchema>;
type CourseEnvironment = "html" | "css" | "react" | "python" | "csharp" | "cpp";

function isCppIdentity(identity: string) {
  return /(?:^|[^a-z0-9])(?:c\+\+|cpp|cplusplus)(?=$|[^a-z0-9])/.test(identity);
}

function isCSharpIdentity(identity: string) {
  return /(?:^|[^a-z0-9])(?:c#|c[\s-]?sharp|dotnet|\.net)(?=$|[^a-z0-9])/.test(
    identity,
  );
}

function getCourseEnvironment(course: {
  title: string;
  tags: string | null;
}): CourseEnvironment {
  const identity = `${course.title} ${course.tags ?? ""}`.toLowerCase();

  if (isCppIdentity(identity)) return "cpp";
  if (isCSharpIdentity(identity)) return "csharp";
  if (/\bpython\b/.test(identity)) return "python";
  if (/\breact\b/.test(identity)) return "react";
  if (/\bcss\b/.test(identity)) return "css";
  return "html";
}

function validateEnvironmentFiles(
  environment: CourseEnvironment,
  files: StarterCode,
  label: string,
) {
  const filenames = Object.keys(files).map((filename) =>
    filename.toLowerCase(),
  );

  if (
    environment === "cpp" &&
    (filenames.length !== 1 || !/(?:^|\/)main\.cpp$/.test(filenames[0]))
  ) {
    throw new Error(`${label} must contain exactly one main.cpp file`);
  }

  if (
    environment === "csharp" &&
    (filenames.length !== 1 || !filenames[0].endsWith("program.cs"))
  ) {
    throw new Error(`${label} must contain exactly one Program.cs file`);
  }

  if (
    environment === "python" &&
    (filenames.length !== 1 || !filenames[0].endsWith("main.py"))
  ) {
    throw new Error(`${label} must contain exactly one main.py file`);
  }

  if (
    environment === "react" &&
    !filenames.some((filename) => /(?:^|\/)app\.(?:jsx?|tsx?)$/.test(filename))
  ) {
    throw new Error(`${label} must contain a React App file`);
  }

  if (
    environment === "css" &&
    (!filenames.some((filename) => filename.endsWith("index.html")) ||
      !filenames.some((filename) => filename.endsWith("styles.css")))
  ) {
    throw new Error(`${label} must contain index.html and styles.css`);
  }
}

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
- The starter must omit at least one explicit task requirement that the student
  has to implement. Never place a complete solution in starter code.
- Add a short TODO at the exact place where the student should work, but never
  include the finished implementation in comments.
- Preserve proper indentation and line breaks.
- The starter code must NOT already satisfy validationRegex.
- Follow the supplied programmingEnvironment exactly.
- html: use index.html and add styles.css or script.js only when needed.
- css: use index.html plus styles.css. The HTML must already contain the elements the learner will style.
- react: use a runnable Sandpack React project, normally App.js plus styles.css. Use JSX and React APIs.
- python: use exactly one main.py file. Never generate HTML, CSS, JavaScript, package.json, or DOM code.
- csharp: use exactly one Program.cs file containing a console application. Use modern beginner-friendly C# and never generate a project file, HTML, CSS, JavaScript, or DOM code.
- cpp: use exactly one main.cpp file containing a standard console application. Use portable C++17, include every standard-library header the program needs, and never generate project files, HTML, CSS, JavaScript, or DOM code.
- For Python, starter code may contain setup data or function signatures, but it
  must omit the required calculation, branch, loop, collection operation,
  function body, class behavior, file action, or final output.
- For C#, starter code may contain using directives, a Program entry point,
  setup data, or method and class signatures, but it must omit the behavior
  explicitly requested by the task.
- For C++, starter code may contain #include directives, a main function,
  setup data, or function and class declarations, but it must omit the behavior
  explicitly requested by the task. Prefer explicit std:: names, RAII, nullptr,
  std::vector, and other safe C++17 patterns over C-style alternatives.

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
- For HTML, CSS, and React, return a short HTML example of the rendered result.
- For Python, C#, and C++, return terminal output wrapped in a <pre> element.
- It is a visual reference, not the only accepted answer.

hintXp requirements:
- Easy: 30 to 40.
- Medium: 45 to 60.
- Hard: 65 to 80.
`;

const REPAIR_INSTRUCTIONS = `
You repair one CodeQuest exercise that failed deterministic server validation.

Return the complete repaired exercise object.
Keep exerciseId and exerciseName exactly unchanged.
Use the supplied serverValidationError to identify the problem.
Preserve already-correct educational content unless it caused the failure.
The validationRegex must be JavaScript-compatible.
Return only the regex source, without Markdown fences, new RegExp(), or surrounding / delimiters.
Use only (?i), (?s), or (?is) at the beginning when flags are needed.
Prefer short independent lookaheads over one large exact-match expression.
Do not depend on exact whitespace, indentation, prose text, or attribute order.
Before responding, verify that validationRegex fails for starterFiles and passes for referenceFiles.
`;

const REGEX_REPAIR_INSTRUCTIONS = `
You repair only the validationRegex of one CodeQuest exercise.

The starterFiles and referenceFiles are fixed and must not be changed.
Return one JavaScript-compatible regex source that:
- fails for every starter file and for their combined code;
- passes for at least one reference file or for their combined code;
- checks the actual requested programming behavior;
- accepts reasonable whitespace, quote, variable-name, and formatting differences.

Use short positive lookaheads with [\\s\\S] when several requirements may appear
in different parts of a file. Do not require exact prose or the entire reference
solution. Return only validationRegex without Markdown fences, new RegExp(), or
surrounding / delimiters. You may start it with (?i), (?s), or (?is).
`;

function isRegexValidationError(message: string) {
  return (
    message.startsWith("AI generated an invalid regex") ||
    message.startsWith("Starter code already solves") ||
    message.startsWith("Validation regex rejects the solution")
  );
}

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

function getRegexSourceAndFlags(value: string) {
  let source = value
    .trim()
    .replace(/^```(?:regex|regexp|javascript|js)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const flags = new Set<string>();

  if (source.startsWith("/")) {
    let closingSlash = -1;

    for (let index = source.length - 1; index > 0; index -= 1) {
      if (source[index] !== "/") {
        continue;
      }

      let backslashCount = 0;

      for (
        let backslashIndex = index - 1;
        backslashIndex >= 0 && source[backslashIndex] === "\\";
        backslashIndex -= 1
      ) {
        backslashCount += 1;
      }

      if (backslashCount % 2 === 0) {
        closingSlash = index;
        break;
      }
    }

    if (closingSlash > 0) {
      const literalFlags = source.slice(closingSlash + 1).trim();

      if (/^[dgimsuvy]*$/.test(literalFlags)) {
        source = source.slice(1, closingSlash);

        for (const flag of literalFlags) {
          flags.add(flag);
        }
      }
    }
  }

  const inlineFlags = source.match(/^\(\?([dgimsuvy]+)\)/);

  if (inlineFlags) {
    source = source.slice(inlineFlags[0].length);

    for (const flag of inlineFlags[1]) {
      flags.add(flag);
    }
  }

  flags.delete("d");
  flags.delete("g");
  flags.delete("v");
  flags.delete("y");

  const orderedFlags = ["i", "m", "s", "u"].filter((flag) => flags.has(flag));

  return {
    source,
    flags: orderedFlags.join(""),
    storedValue: `${
      orderedFlags.length > 0 ? `(?${orderedFlags.join("")})` : ""
    }${source}`,
  };
}

function compileValidationRegex(value: string) {
  const { source, flags, storedValue } = getRegexSourceAndFlags(value);

  return {
    pattern: new RegExp(source, flags),
    storedValue,
  };
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
  environment: CourseEnvironment,
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

  validateEnvironmentFiles(
    environment,
    starterCode,
    `${metadata.slug} starterFiles`,
  );
  validateEnvironmentFiles(
    environment,
    referenceCode,
    `${metadata.slug} referenceFiles`,
  );

  let validationPattern: RegExp;
  let normalizedValidationRegex: string;

  try {
    const compiledRegex = compileValidationRegex(generated.validationRegex);
    validationPattern = compiledRegex.pattern;
    normalizedValidationRegex = compiledRegex.storedValue;
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
    validationRegex: normalizedValidationRegex,
    expectedOutput: generated.expectedOutput.trim(),
    hintXp: generated.hintXp,
  };
}

function getNormalizedTaskKey(task: string) {
  return task
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/admin/generate-exercises-v3",
    generatorVersion: GENERATOR_ROUTE_VERSION,
  });
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

    const programmingEnvironment = getCourseEnvironment(course);

    if (targetExercises.length === 0) {
      return NextResponse.json({
        generated: 0,
        skipped: chapter.exercises.length,
        message: "All exercises in this chapter already have content",
      });
    }

    const openai = getOpenAIClient();
    const model = process.env.OPENAI_EXERCISE_MODEL ?? "gpt-5-mini";

    const response = await openai.responses.parse({
      model,
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
                tags: course.tags,
                programmingEnvironment,
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
        console.warn(
          `AI duplicated ${generatedExercise.exerciseId}; keeping the first result`,
        );
        continue;
      }

      generatedBySlug.set(generatedExercise.exerciseId, generatedExercise);
    }

    const validatedExercises: GeneratedExerciseRecord[] = [];
    const validatedTaskKeys = new Set<string>();
    const failedExercises: Array<{
      exerciseId: string;
      exerciseName: string;
      error: string;
    }> = [];

    for (const metadata of targetExercises) {
      const initialGeneratedExercise = generatedBySlug.get(metadata.slug);

      if (!initialGeneratedExercise) {
        failedExercises.push({
          exerciseId: metadata.slug,
          exerciseName: metadata.name,
          error: `AI did not generate ${metadata.slug}`,
        });
        continue;
      }

      try {
        let generatedExercise = initialGeneratedExercise;
        let validatedExercise: GeneratedExerciseRecord | null = null;
        let validationError = "";

        for (
          let repairAttempt = 0;
          repairAttempt <= MAX_EXERCISE_REPAIR_ATTEMPTS;
          repairAttempt += 1
        ) {
          try {
            validatedExercise = validateGeneratedExercise(
              generatedExercise,
              metadata,
              programmingEnvironment,
            );
            break;
          } catch (error) {
            validationError =
              error instanceof Error
                ? error.message
                : `Unknown validation error for ${metadata.slug}`;

            if (repairAttempt === MAX_EXERCISE_REPAIR_ATTEMPTS) {
              break;
            }

            console.warn(
              `Repairing ${metadata.slug}, attempt ${repairAttempt + 1}/${MAX_EXERCISE_REPAIR_ATTEMPTS}:`,
              validationError,
            );

            if (isRegexValidationError(validationError)) {
              const regexRepairResponse = await openai.responses.parse({
                model,
                input: [
                  {
                    role: "system",
                    content: REGEX_REPAIR_INSTRUCTIONS,
                  },
                  {
                    role: "user",
                    content: JSON.stringify(
                      {
                        programmingEnvironment,
                        chapter: {
                          name: chapter.name,
                          description: chapter.desc,
                        },
                        exerciseMetadata: metadata,
                        task: generatedExercise.task,
                        starterFiles: generatedExercise.starterFiles,
                        referenceFiles: generatedExercise.referenceFiles,
                        rejectedValidationRegex:
                          generatedExercise.validationRegex,
                        serverValidationError: validationError,
                      },
                      null,
                      2,
                    ),
                  },
                ],
                text: {
                  format: zodTextFormat(
                    RepairedValidationRegexSchema,
                    "repaired_validation_regex",
                  ),
                },
              });

              if (!regexRepairResponse.output_parsed) {
                throw new Error(
                  `AI did not return a repaired regex for ${metadata.slug}`,
                );
              }

              generatedExercise = {
                ...generatedExercise,
                validationRegex:
                  regexRepairResponse.output_parsed.validationRegex,
              };
              continue;
            }

            const repairResponse = await openai.responses.parse({
              model,
              input: [
                {
                  role: "system",
                  content: `${GENERATOR_INSTRUCTIONS}\n${REPAIR_INSTRUCTIONS}`,
                },
                {
                  role: "user",
                  content: JSON.stringify(
                    {
                      course: {
                        title: course.title,
                        description: course.desc,
                        tags: course.tags,
                        programmingEnvironment,
                      },
                      chapter: {
                        chapterId,
                        name: chapter.name,
                        description: chapter.desc,
                      },
                      exerciseMetadata: metadata,
                      rejectedExercise: generatedExercise,
                      serverValidationError: validationError,
                    },
                    null,
                    2,
                  ),
                },
              ],
              text: {
                format: zodTextFormat(
                  RepairedExerciseSchema,
                  "repaired_exercise",
                ),
              },
            });

            if (!repairResponse.output_parsed) {
              throw new Error(`AI did not return repaired ${metadata.slug}`);
            }

            generatedExercise = repairResponse.output_parsed.exercise;
          }
        }

        if (!validatedExercise) {
          throw new Error(
            `AI could not repair ${metadata.slug} after ${MAX_EXERCISE_REPAIR_ATTEMPTS} attempts. Last validation error: ${validationError}`,
          );
        }

        const taskKey = getNormalizedTaskKey(validatedExercise.task);

        if (validatedTaskKeys.has(taskKey)) {
          throw new Error(`AI generated a duplicate task for ${metadata.slug}`);
        }

        validatedTaskKeys.add(taskKey);
        validatedExercises.push(validatedExercise);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : `Unknown generation error for ${metadata.slug}`;

        console.error(`Skipping invalid exercise ${metadata.slug}:`, message);
        failedExercises.push({
          exerciseId: metadata.slug,
          exerciseName: metadata.name,
          error: message,
        });
      }
    }

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

    const hasFailures = failedExercises.length > 0;

    return NextResponse.json(
      {
        generated: validatedExercises.length,
        failed: failedExercises.length,
        skipped: overwrite ? 0 : existingExercises.length,
        exercises: validatedExercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
        })),
        failedExercises,
        generatorVersion: GENERATOR_ROUTE_VERSION,
        message: hasFailures
          ? `Saved ${validatedExercises.length} exercises. ${failedExercises.length} exercise${failedExercises.length === 1 ? "" : "s"} remain missing and can be retried.`
          : `Generated ${validatedExercises.length} unique exercises`,
      },
      { status: hasFailures ? 207 : 201 },
    );
  } catch (error) {
    console.error("AI exercise generation error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate exercises";

    return NextResponse.json(
      {
        generatorVersion: GENERATOR_ROUTE_VERSION,
        error:
          process.env.NODE_ENV === "development"
            ? `[${GENERATOR_ROUTE_VERSION}] ${message}`
            : "Failed to generate exercises",
      },
      { status: 500 },
    );
  }
}
