"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export interface Exercise {
  name: string;
  slug: string;
  xp: number;
  difficulty: Difficulty;
}

type Difficulty = "easy" | "medium" | "hard";

const difficultyColors: Record<Difficulty, string> = {
  easy: "text-green-500",
  medium: "text-orange-500",
  hard: "text-red-500",
};

export interface Chapter {
  id: number;
  courseId: number;
  chapterId: number;
  name: string;
  desc: string;
  exercises: Exercise[];
}

export interface CourseProgressData {
  completedChapters: number;
  completedExercises: number;
  earnedXp: number;
}

interface CompletedExercise {
  id: number;
  chapterId: number;
  exerciseSlug: string;
  completedAt: string;
}

interface CourseChaptersProps {
  chapters: Chapter[];
  isEnrolled: boolean;
  onProgressChange?: (progress: CourseProgressData) => void;
}

interface CourseChapterItemProps {
  chapter: Chapter;
  isEnrolled: boolean;
  isCompletedDataReady: boolean;
  completedExerciseKeys: Set<string>;
  nextExerciseKey: string | null;
}

function getExerciseKey(chapterId: number, exerciseSlug: string) {
  return `${chapterId}:${exerciseSlug}`;
}

function calculateCourseProgress(
  chapters: Chapter[],
  completedExerciseKeys: Set<string>,
): CourseProgressData {
  let completedChapters = 0;
  let completedExercises = 0;
  let earnedXp = 0;

  for (const chapter of chapters) {
    let completedInChapter = 0;

    for (const exercise of chapter.exercises) {
      const exerciseKey = getExerciseKey(chapter.chapterId, exercise.slug);

      if (completedExerciseKeys.has(exerciseKey)) {
        completedInChapter += 1;
        completedExercises += 1;
        earnedXp += exercise.xp;
      }
    }

    const isChapterCompleted =
      chapter.exercises.length > 0 &&
      completedInChapter === chapter.exercises.length;

    if (isChapterCompleted) {
      completedChapters += 1;
    }
  }

  return {
    completedChapters,
    completedExercises,
    earnedXp,
  };
}

function CourseChapterItem({
  chapter,
  isEnrolled,
  isCompletedDataReady,
  completedExerciseKeys,
  nextExerciseKey,
}: CourseChapterItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      open={isOpen}
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
      className="group border-b border-border last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 transition-all duration-500 hover:bg-accent/10 [&::-webkit-details-marker]:hidden">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border font-pixel text-xl">
          {chapter.chapterId}
        </span>

        <h3 className="min-w-0 flex-1 font-pixel text-2xl font-bold text-foreground">
          {chapter.name}
        </h3>

        <span className="hidden font-pixel text-lg text-foreground/50 sm:block">
          {chapter.exercises.length} exercises
        </span>

        <ChevronIcon />
      </summary>

      <div className="border px-8 py-5">
        <p className="mb-5 font-pixel text-lg text-foreground/70">
          {chapter.desc}
        </p>

        {!isEnrolled && (
          <div className="mb-5 flex items-center gap-3 border border-accent bg-accent/10 px-4 py-3">
            <LockIcon />

            <p className="font-pixel text-lg text-accent">
              Enroll in this course to unlock exercises.
            </p>
          </div>
        )}

        {isEnrolled && !isCompletedDataReady && (
          <div className="mb-5 border border-border bg-secondary/20 px-4 py-3">
            <p className="font-pixel text-lg text-foreground/60">
              Loading your progress...
            </p>
          </div>
        )}

        <div className="flex flex-col">
          {chapter.exercises.map((exercise, exerciseIndex) => {
            const exerciseKey = getExerciseKey(
              chapter.chapterId,
              exercise.slug,
            );

            const isCompleted = completedExerciseKeys.has(exerciseKey);

            const canStart =
              isEnrolled &&
              isCompletedDataReady &&
              !isCompleted &&
              exerciseKey === nextExerciseKey;

            return (
              <div
                key={exercise.slug}
                className={`grid gap-3 border-t px-3 border-border/60 py-3 first:border-t-0 sm:grid-cols-[90px_1fr_auto_auto] sm:items-center sm:gap-4 ${
                  isCompleted ? "bg-accent/5" : ""
                }`}
              >
                <span className="font-pixel text-sm text-foreground/50">
                  Exercise {exerciseIndex + 1}
                </span>

                <div>
                  <p
                    className={`font-pixel text-lg ${
                      isCompleted ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {exercise.name}
                  </p>

                  <p
                    className={`font-pixel text-xs uppercase ${
                      isCompleted
                        ? "text-accent"
                        : difficultyColors[exercise.difficulty]
                    }`}
                  >
                    {isCompleted ? "Completed" : exercise.difficulty}
                  </p>
                </div>

                <span
                  className={`font-pixel text-lg ${
                    isCompleted || canStart
                      ? "text-accent"
                      : "text-foreground/30"
                  }`}
                >
                  +{exercise.xp} XP
                </span>
                {isCompleted || canStart ? (
                  <Link
                    href={`/courses/${chapter.courseId}/${chapter.chapterId}/${exercise.slug}`}
                    title={
                      isCompleted
                        ? `Open ${exercise.name}`
                        : `Start ${exercise.name}`
                    }
                    aria-label={
                      isCompleted
                        ? `Open completed exercise ${exercise.name}`
                        : `Start ${exercise.name}`
                    }
                    className={`flex size-9 items-center justify-center border transition-all duration-500 ${
                      isCompleted
                        ? "border-accent bg-accent text-black"
                        : "border-border bg-secondary text-foreground hover:border-accent hover:bg-accent hover:text-black"
                    }`}
                  >
                    {isCompleted ? <CompletedIcon /> : <PlayIcon />}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    title={
                      !isEnrolled
                        ? "Enroll to unlock this exercise"
                        : !isCompletedDataReady
                          ? "Loading your progress"
                          : "Complete the previous exercise first"
                    }
                    aria-label={`${exercise.name} is locked`}
                    className="flex size-9 cursor-not-allowed items-center justify-center border border-border bg-secondary/30 text-foreground/20"
                  >
                    <LockIcon />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}

export default function CourseChapters({
  chapters,
  isEnrolled,
  onProgressChange,
}: CourseChaptersProps) {
  const [completedExerciseKeys, setCompletedExerciseKeys] = useState<
    Set<string>
  >(() => new Set());

  const [loadedCompletedCourseId, setLoadedCompletedCourseId] = useState<
    number | null
  >(null);

  const [loadingError, setLoadingError] = useState("");

  const courseId = chapters[0]?.courseId;

  const isCompletedDataReady =
    isEnrolled && loadedCompletedCourseId === courseId;

  /*
   * Знаходимо першу незавершену
   * вправу в усьому курсі.
   */
  const nextExercise = useMemo(() => {
    if (!isCompletedDataReady) {
      return null;
    }

    const orderedChapters = [...chapters].sort(
      (firstChapter, secondChapter) =>
        firstChapter.chapterId - secondChapter.chapterId,
    );

    for (const chapter of orderedChapters) {
      for (const exercise of chapter.exercises) {
        const exerciseKey = getExerciseKey(chapter.chapterId, exercise.slug);

        if (!completedExerciseKeys.has(exerciseKey)) {
          return {
            chapterId: chapter.chapterId,
            exercise,
            key: exerciseKey,
          };
        }
      }
    }

    return null;
  }, [chapters, completedExerciseKeys, isCompletedDataReady]);

  const nextExerciseKey = nextExercise?.key ?? null;

  /*
   * Завантажуємо завершені вправи.
   */
  useEffect(() => {
    if (!isEnrolled || !courseId) {
      return;
    }

    const controller = new AbortController();

    const loadCompletedExercises = async () => {
      try {
        const response = await fetch(
          `/api/completed-exercises?courseId=${courseId}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load completed exercises");
        }

        const completedExercises = Array.isArray(data.completedExercises)
          ? (data.completedExercises as CompletedExercise[])
          : [];

        const loadedExerciseKeys = new Set(
          completedExercises.map((item) =>
            getExerciseKey(item.chapterId, item.exerciseSlug),
          ),
        );

        setCompletedExerciseKeys(loadedExerciseKeys);

        setLoadedCompletedCourseId(courseId);

        setLoadingError("");

        onProgressChange?.(
          calculateCourseProgress(chapters, loadedExerciseKeys),
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Completed exercises loading error:", error);

        setLoadingError(
          error instanceof Error
            ? error.message
            : "Failed to load completed exercises",
        );
      }
    };

    void loadCompletedExercises();

    return () => {
      controller.abort();
    };
  }, [courseId, chapters, isEnrolled, onProgressChange]);

  return (
    <div className="col-span-2 min-w-0">
      <h2 className="mb-6 font-pixel text-4xl text-accent md:text-5xl">
        Course chapters
      </h2>

      {isEnrolled && isCompletedDataReady && nextExercise && courseId && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-accent bg-accent/10 p-4">
          <div>
            <p className="font-pixel text-sm uppercase text-foreground/50">
              Next available exercise
            </p>

            <p className="font-pixel text-2xl text-accent">
              {nextExercise.exercise.name}
            </p>
          </div>

          <Link
            href={`/courses/${courseId}/${nextExercise.chapterId}/${nextExercise.exercise.slug}`}
            className="border bg-accent px-4 py-2 font-pixel text-xl text-black shadow-[3px_3px_0_0_#FF8C00] transition-all hover:translate-x-px hover:translate-y-px hover:bg-accent-hover hover:text-white hover:shadow-[2px_2px_0_0_#FF8C00]"
          >
            Start next exercise
          </Link>
        </div>
      )}

      {isEnrolled &&
        isCompletedDataReady &&
        !nextExercise &&
        chapters.length > 0 && (
          <div className="mb-6 border border-green-500 bg-green-500/10 p-4">
            <p className="font-pixel text-xl text-green-400">
              Course completed! Every exercise is finished.
            </p>
          </div>
        )}

      {loadingError && (
        <div className="mb-4 border border-red-500 bg-red-500/10 p-3">
          <p className="font-pixel text-lg text-red-400">{loadingError}</p>
        </div>
      )}

      {chapters.length === 0 ? (
        <div className="border-2 border-accent p-6 text-center shadow-[5px_5px_0_0_#FF8C00]">
          <p className="font-pixel text-2xl text-foreground/70">
            This course does not have any chapters yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border-2 border-accent bg-background">
          {chapters.map((chapter) => (
            <CourseChapterItem
              key={chapter.id}
              chapter={chapter}
              isEnrolled={isEnrolled}
              isCompletedDataReady={isCompletedDataReady}
              completedExerciseKeys={completedExerciseKeys}
              nextExerciseKey={nextExerciseKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 shrink-0 transition-transform duration-500 group-open:rotate-180"
    >
      <path d="M13 16h-2v-2h2v2Zm-2-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-6-2H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 10H5V8h2v2Zm12 0h-2V8h2v2Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M9 5h2v2H9v10h2v2H9v2H7V3h2v2Zm4 12h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2v-2h2v2Zm-2-2h-2V9h2v2Zm-2-2h-2V7h2v2Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M9 3h6v2h2v5h2v11H5V10h2V5h2V3Zm0 7h6V5H9v5Zm2 4v4h2v-4h-2Z" />
    </svg>
  );
}

function CompletedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M9 17H7v-2h2v2Zm2 2H9v-2h2v2Zm2-4h-2v4h2v-4Zm2-2h-2v2h2v-2Zm2-2h-2v2h2v-2Zm2-2h-2v2h2V9Z" />
    </svg>
  );
}
