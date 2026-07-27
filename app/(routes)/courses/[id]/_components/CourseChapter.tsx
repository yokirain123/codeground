"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export interface Exercise {
  name: string;
  slug: string;
  xp: number;
  difficulty: string;
}

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
  completingExerciseKey: string | null;
  nextExerciseKey: string | null;
  onCompleteExercise: (chapter: Chapter, exercise: Exercise) => Promise<void>;
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
      const exerciseKey = getExerciseKey(chapter.id, exercise.slug);

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
  completingExerciseKey,
  nextExerciseKey,
  onCompleteExercise,
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
            const exerciseKey = getExerciseKey(chapter.id, exercise.slug);

            const isCompleted = completedExerciseKeys.has(exerciseKey);

            const isCompleting = completingExerciseKey === exerciseKey;

            const canStart =
              isEnrolled &&
              isCompletedDataReady &&
              !isCompleted &&
              exerciseKey === nextExerciseKey;

            const isLocked = !isCompleted && !canStart;

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

                  <p className="font-pixel text-xs uppercase text-foreground/40">
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

                <button
                  type="button"
                  disabled={!canStart || isCompleting}
                  onClick={() => {
                    void onCompleteExercise(chapter, exercise);
                  }}
                  title={
                    !isEnrolled
                      ? "Enroll to unlock this exercise"
                      : !isCompletedDataReady
                        ? "Loading your progress"
                        : isCompleted
                          ? "Exercise completed"
                          : canStart
                            ? `Start ${exercise.name}`
                            : "Complete the previous exercise first"
                  }
                  aria-label={
                    isCompleted
                      ? `${exercise.name} is completed`
                      : canStart
                        ? `Start ${exercise.name}`
                        : `${exercise.name} is locked`
                  }
                  className={`flex size-9 items-center justify-center border transition-all duration-500 ${
                    isCompleted
                      ? "cursor-default border-accent bg-accent text-black"
                      : canStart
                        ? "border-border bg-secondary text-foreground hover:border-accent hover:bg-accent hover:text-black"
                        : "cursor-not-allowed border-border bg-secondary/30 text-foreground/20"
                  }`}
                >
                  {isCompleting ? (
                    <span className="font-pixel text-sm">...</span>
                  ) : isCompleted ? (
                    <CompletedIcon />
                  ) : isLocked ? (
                    <LockIcon />
                  ) : (
                    <PlayIcon />
                  )}
                </button>
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

  const [completingExerciseKey, setCompletingExerciseKey] = useState<
    string | null
  >(null);

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
  const nextExerciseKey = useMemo(() => {
    if (!isCompletedDataReady) {
      return null;
    }

    const orderedChapters = [...chapters].sort(
      (firstChapter, secondChapter) =>
        firstChapter.chapterId - secondChapter.chapterId,
    );

    for (const chapter of orderedChapters) {
      for (const exercise of chapter.exercises) {
        const exerciseKey = getExerciseKey(chapter.id, exercise.slug);

        if (!completedExerciseKeys.has(exerciseKey)) {
          return exerciseKey;
        }
      }
    }

    return null;
  }, [chapters, completedExerciseKeys, isCompletedDataReady]);

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

  /*
   * Завершуємо поточну доступну вправу.
   */
  const completeExercise = async (chapter: Chapter, exercise: Exercise) => {
    if (!isEnrolled) {
      toast.error("Enroll in the course first");

      return;
    }

    if (!isCompletedDataReady) {
      toast.info("Your progress is still loading");

      return;
    }

    const exerciseKey = getExerciseKey(chapter.id, exercise.slug);

    if (completedExerciseKeys.has(exerciseKey)) {
      return;
    }

    if (exerciseKey !== nextExerciseKey) {
      toast.error("Complete the previous exercise first");

      return;
    }

    if (completingExerciseKey) {
      return;
    }

    try {
      setCompletingExerciseKey(exerciseKey);

      const response = await fetch("/api/completed-exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chapterId: chapter.id,
          exerciseSlug: exercise.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete exercise");
      }

      const updatedExerciseKeys = new Set(completedExerciseKeys);

      updatedExerciseKeys.add(exerciseKey);

      setCompletedExerciseKeys(updatedExerciseKeys);

      /*
       * Відправляємо оновлений прогрес
       * у CoursePage.
       */
      onProgressChange?.(
        calculateCourseProgress(chapters, updatedExerciseKeys),
      );

      if (data.alreadyCompleted) {
        toast.info("Exercise was already completed");
      } else {
        toast.success("Exercise completed!", {
          description: `You earned ${data.xpEarned} XP.`,
        });
      }
    } catch (error) {
      console.error("Exercise completion error:", error);

      toast.error("Could not complete exercise", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setCompletingExerciseKey(null);
    }
  };

  return (
    <div className="col-span-2 min-w-0">
      <h2 className="mb-6 font-pixel text-4xl text-accent md:text-5xl">
        Course chapters
      </h2>

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
              completingExerciseKey={completingExerciseKey}
              nextExerciseKey={nextExerciseKey}
              onCompleteExercise={completeExercise}
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
