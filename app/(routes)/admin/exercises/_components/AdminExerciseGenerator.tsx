"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/shadcn/button";
import { useI18n } from "@/components/i18n/I18nProvider";

interface AdminExercise {
  name: string;
  slug: string;
  xp: number;
  difficulty: "easy" | "medium" | "hard";
  isReady: boolean;
}

interface AdminChapter {
  databaseId: number;
  chapterId: number;
  name: string;
  desc: string;
  exercises: AdminExercise[];
  readyCount: number;
  totalCount: number;
}

export interface AdminCourse {
  id: number;
  title: string;
  desc: string;
  level: string;
  tags: string | null;
  chapters: AdminChapter[];
}

interface AdminExerciseGeneratorProps {
  courses: AdminCourse[];
}

interface GenerateResponse {
  generated?: number;
  skipped?: number;
  message?: string;
  error?: string;
}

function difficultyColor(difficulty: AdminExercise["difficulty"]) {
  if (difficulty === "hard") {
    return "text-red-400";
  }

  if (difficulty === "medium") {
    return "text-orange-400";
  }

  return "text-green-400";
}

export default function AdminExerciseGenerator({
  courses,
}: AdminExerciseGeneratorProps) {
  const router = useRouter();
  const { locale, t, translateMessage } = useI18n();

  const [openCourseId, setOpenCourseId] = useState<number | null>(
    courses[0]?.id ?? null,
  );

  const [activeChapterKey, setActiveChapterKey] = useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);

  const [courseProgress, setCourseProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const toggleCourse = (courseId: number) => {
    setOpenCourseId((currentId) =>
      currentId === courseId ? null : courseId,
    );
  };

  const generateChapter = async ({
    courseId,
    chapterId,
    overwrite,
    showToast = true,
  }: {
    courseId: number;
    chapterId: number;
    overwrite: boolean;
    showToast?: boolean;
  }) => {
    const endpoint = "/api/admin/generate-exercises-v3";

    const response = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-CodeQuest-Generator": "focused-repair-v3",
      },
      body: JSON.stringify({
        courseId,
        chapterId,
        overwrite,
        locale,
      }),
    });

    const responseText = await response.text();
    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      console.error("Generator returned HTML instead of JSON:", {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        response: responseText.slice(0, 500),
      });

      throw new Error(
        t(
          "Generator API returned {status} {statusText}. Check the terminal for the server error.",
          {
            status: response.status,
            statusText: response.statusText,
          },
        ),
      );
    }

    let data: GenerateResponse;

    try {
      data = JSON.parse(responseText) as GenerateResponse;
    } catch {
      throw new Error(
        t("Generator API returned invalid JSON with status {status}.", {
          status: response.status,
        }),
      );
    }

    if (!response.ok) {
      throw new Error(
        translateMessage(data.error || t("Failed to generate exercises")),
      );
    }

    if (showToast) {
      if ((data.generated ?? 0) > 0) {
        toast.success(t("Exercises generated!"), {
          description: t("{count} exercises were saved.", {
            count: data.generated,
          }),
        });
      } else {
        toast.info(t("Nothing to generate"), {
          description:
            locale === "uk"
              ? t("All exercises in this chapter already have content.")
              : data.message,
        });
      }
    }

    return data;
  };

  const handleChapterGeneration = async (
    courseId: number,
    chapterId: number,
    overwrite: boolean,
  ) => {
    if (activeChapterKey || activeCourseId !== null) {
      return;
    }

    if (
      overwrite &&
      !window.confirm(
        t(
          "Regenerate this chapter? Existing exercise content will be replaced.",
        ),
      )
    ) {
      return;
    }

    const chapterKey = `${courseId}:${chapterId}`;

    try {
      setActiveChapterKey(chapterKey);

      await generateChapter({
        courseId,
        chapterId,
        overwrite,
      });

      router.refresh();
    } catch (error) {
      console.error("Chapter generation error:", error);

      toast.error(t("Generation failed"), {
        description:
          error instanceof Error
            ? translateMessage(error.message)
            : t("Failed to generate exercises"),
      });
    } finally {
      setActiveChapterKey(null);
    }
  };

  const handleCourseGeneration = async (course: AdminCourse) => {
    if (activeChapterKey || activeCourseId !== null) {
      return;
    }

    const chaptersToGenerate = course.chapters.filter(
      (chapter) => chapter.readyCount < chapter.totalCount,
    );

    if (chaptersToGenerate.length === 0) {
      toast.info(t("Course is ready"), {
        description: t("Every exercise already has generated content."),
      });

      return;
    }

    setOpenCourseId(course.id);

    try {
      setActiveCourseId(course.id);

      setCourseProgress({
        current: 0,
        total: chaptersToGenerate.length,
      });

      let generatedExercises = 0;
      const failedChapters: string[] = [];

      for (let index = 0; index < chaptersToGenerate.length; index += 1) {
        const chapter = chaptersToGenerate[index];

        setCourseProgress({
          current: index + 1,
          total: chaptersToGenerate.length,
        });

        try {
          const result = await generateChapter({
            courseId: course.id,
            chapterId: chapter.chapterId,
            overwrite: false,
            showToast: false,
          });

          generatedExercises += result.generated ?? 0;
        } catch (error) {
          console.error(
            `Failed to generate chapter ${chapter.chapterId}:`,
            error,
          );

          failedChapters.push(chapter.name);
        }
      }

      if (generatedExercises > 0) {
        toast.success(t("Course generation finished!"), {
          description: t("{count} exercises were generated.", {
            count: generatedExercises,
          }),
        });
      }

      if (failedChapters.length > 0) {
        toast.error(t("Some chapters failed"), {
          description: failedChapters.join(", "),
        });
      }

      router.refresh();
    } finally {
      setActiveCourseId(null);
      setCourseProgress(null);
    }
  };

  if (courses.length === 0) {
    return (
      <section className="border-2 border-accent p-8 text-center shadow-[6px_6px_0_0_#FF8C00]">
        <h2 className="font-pixel text-3xl text-accent">
          {t("No courses yet")}
        </h2>

        <p className="mt-2 text-xl text-foreground/60">
          {t(
            "Create a course and its chapters before generating exercises.",
          )}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {courses.map((course) => {
        const totalExercises = course.chapters.reduce(
          (total, chapter) => total + chapter.totalCount,
          0,
        );

        const readyExercises = course.chapters.reduce(
          (total, chapter) => total + chapter.readyCount,
          0,
        );

        const isOpen = openCourseId === course.id;
        const isGeneratingCourse = activeCourseId === course.id;
        const isCourseReady =
          totalExercises > 0 && readyExercises === totalExercises;

        const contentId = `course-content-${course.id}`;

        return (
          <section
            key={course.id}
            className="border-2 border-accent bg-background shadow-[7px_7px_0_0_#FF8C00]"
          >
            <header
              className={`flex flex-col gap-5 bg-card p-5 lg:flex-row lg:items-center lg:justify-between md:p-6 ${
                isOpen ? "border-b border-accent/40" : ""
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleCourse(course.id)}
                className="group flex min-w-0 flex-1 cursor-pointer items-start gap-4 text-left"
              >
                <span className="mt-1 flex size-10 shrink-0 items-center justify-center border border-accent bg-background text-accent transition-colors group-hover:bg-accent group-hover:text-black">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`size-6 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="m6 9 6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="font-pixel text-3xl text-accent md:text-4xl">
                      {course.title}
                    </span>

                    <span className="border border-border px-2 py-1 text-sm uppercase text-foreground/50">
                      {course.level === "Beginner"
                        ? t("Beginner")
                        : course.level === "Intermediate"
                          ? t("Intermediate")
                          : course.level === "Advanced"
                            ? t("Advanced")
                            : course.level}
                    </span>

                    {course.tags && (
                      <span className="border border-border px-2 py-1 text-sm text-foreground/50">
                        {course.tags}
                      </span>
                    )}
                  </span>

                  <span className="mt-2 block max-w-4xl text-lg text-foreground/55">
                    {course.desc}
                  </span>

                  <span className="mt-3 block text-lg">
                    <span className="text-green-400">
                      {t("{count} ready", { count: readyExercises })}
                    </span>

                    <span className="text-foreground/35">
                      {" "}
                      / {totalExercises}
                    </span>
                  </span>
                </span>
              </button>

              <div className="flex shrink-0 flex-wrap items-center gap-4 pl-14 lg:pl-0">
                <Link
                  href={`/courses/${course.id}`}
                  className="border border-border bg-secondary px-4 py-2 text-lg transition-colors hover:border-accent hover:text-accent"
                >
                  {t("Open course")}
                </Link>

                <PixelButton
                  disabled={
                    activeChapterKey !== null ||
                    activeCourseId !== null ||
                    isCourseReady ||
                    totalExercises === 0
                  }
                  onClick={() => {
                    void handleCourseGeneration(course);
                  }}
                >
                  {isGeneratingCourse && courseProgress
                    ? t("Generating {current}/{total}", {
                        current: courseProgress.current,
                        total: courseProgress.total,
                      })
                    : isCourseReady
                      ? t("Course ready")
                      : t("Generate entire course")}
                </PixelButton>
              </div>
            </header>

            {isOpen && (
              <div
                id={contentId}
                className="divide-y divide-border"
              >
                {course.chapters.length === 0 ? (
                  <p className="p-6 text-xl text-foreground/50">
                    {t("This course does not have chapters yet.")}
                  </p>
                ) : (
                  course.chapters.map((chapter) => {
                    const chapterKey = `${course.id}:${chapter.chapterId}`;

                    const isGeneratingChapter =
                      activeChapterKey === chapterKey;

                    const isChapterReady =
                      chapter.totalCount > 0 &&
                      chapter.readyCount === chapter.totalCount;

                    return (
                      <article
                        key={chapter.databaseId}
                        className="p-5 md:p-6"
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-xl">
                                {chapter.chapterId}
                              </span>

                              <div>
                                <h3 className="font-pixel text-2xl text-foreground">
                                  {chapter.name}
                                </h3>

                                <p
                                  className={
                                    isChapterReady
                                      ? "text-green-400"
                                      : "text-orange-400"
                                  }
                                >
                                  {t("{ready}/{total} exercises ready", {
                                    ready: chapter.readyCount,
                                    total: chapter.totalCount,
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
                              {chapter.exercises.map((exercise) => (
                                <div
                                  key={exercise.slug}
                                  className="flex min-w-0 items-center justify-between gap-3 border border-border bg-card/50 px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-lg">
                                      {exercise.name}
                                    </p>

                                    <p
                                      className={`text-xs uppercase ${difficultyColor(
                                        exercise.difficulty,
                                      )}`}
                                    >
                                      {t(exercise.difficulty)} · {exercise.xp} XP
                                    </p>
                                  </div>

                                  <span
                                    className={`shrink-0 text-sm ${
                                      exercise.isReady
                                        ? "text-green-400"
                                        : "text-foreground/35"
                                    }`}
                                  >
                                    {exercise.isReady
                                      ? t("READY")
                                      : t("MISSING")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={
                                isGeneratingChapter ||
                                activeChapterKey !== null ||
                                activeCourseId !== null ||
                                chapter.totalCount === 0
                              }
                              onClick={() => {
                                void handleChapterGeneration(
                                  course.id,
                                  chapter.chapterId,
                                  true,
                                );
                              }}
                              className="cursor-pointer border-border bg-secondary px-3 py-2 text-lg hover:border-red-400 hover:bg-red-400/10 hover:text-red-400 disabled:pointer-events-none disabled:opacity-50"
                            >
                              {t("Regenerate all")}
                            </Button>

                            <PixelButton
                              disabled={
                                isGeneratingChapter ||
                                activeChapterKey !== null ||
                                activeCourseId !== null ||
                                isChapterReady ||
                                chapter.totalCount === 0
                              }
                              onClick={() => {
                                void handleChapterGeneration(
                                  course.id,
                                  chapter.chapterId,
                                  false,
                                );
                              }}
                            >
                              {isGeneratingChapter
                                ? t("Generating...")
                                : isChapterReady
                                  ? t("Chapter ready")
                                  : t("Generate missing")}
                            </PixelButton>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function PixelButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative cursor-pointer overflow-hidden border bg-accent px-4 py-2 text-lg text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
    >
      <span
        aria-hidden="true"
        className="absolute top-full left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
      />

      <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
        {children}
      </span>
    </Button>
  );
}
