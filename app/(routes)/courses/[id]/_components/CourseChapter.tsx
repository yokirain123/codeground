"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";

export interface Exercise {
  name: string;
  slug: string;
  xp: number;
  difficulty: Difficulty;
}

type Difficulty = "easy" | "medium" | "hard";

const difficultyColors: Record<Difficulty, string> = {
  easy: "text-[#6FFFA2]",
  medium: "text-[#FFD400]",
  hard: "text-red-400",
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

/**
 * Renders an expandable course chapter with its exercises and availability controls.
 *
 * @param chapter - The chapter and its exercises to display
 * @param isEnrolled - Whether the user is enrolled in the course
 * @param isCompletedDataReady - Whether the user's completion data is available
 * @param completedExerciseKeys - Keys identifying the exercises the user has completed
 * @param nextExerciseKey - The key of the next exercise the user can start
 */
function CourseChapterItem({
  chapter,
  isEnrolled,
  isCompletedDataReady,
  completedExerciseKeys,
  nextExerciseKey,
}: CourseChapterItemProps) {
  const { t, formatNumber } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      open={isOpen}
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
      className="group border-b border-white/10 last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 outline-none transition-all duration-300 hover:bg-[#899DFF]/5 focus-visible:bg-[#899DFF]/10 sm:gap-4 sm:px-5 sm:py-5 [&::-webkit-details-marker]:hidden">
        <span className="flex size-9 shrink-0 items-center justify-center border border-[#899DFF]/35 bg-[#899DFF]/5 font-pixel text-xl text-[#899DFF]">
          {chapter.chapterId}
        </span>

        <h3 className="min-w-0 flex-1 break-words font-pixel text-xl font-bold text-white sm:text-2xl">
          {chapter.name}
        </h3>

        <span className="hidden font-pixel text-lg text-white/45 sm:block">
          {t("{count} exercises", {
            count: formatNumber(chapter.exercises.length),
          })}
        </span>

        <ChevronIcon />
      </summary>

      <div className="border-t border-white/10 bg-black/15 px-4 py-5 sm:px-8">
        <p className="mb-5 font-sans text-base leading-7 text-white/60">
          {chapter.desc}
        </p>

        {!isEnrolled && (
          <div className="mb-5 flex items-center gap-3 border border-[#FFD400]/35 bg-[#FFD400]/5 px-4 py-3 text-[#FFD400]">
            <LockIcon />

            <p className="font-pixel text-lg">
              {t("Enroll in this course to unlock exercises.")}
            </p>
          </div>
        )}

        {isEnrolled && !isCompletedDataReady && (
          <div className="mb-5 border border-[#899DFF]/25 bg-[#899DFF]/5 px-4 py-3">
            <p className="font-pixel text-lg text-[#899DFF]">
              {t("Loading your progress...")}
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
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-t border-white/10 px-2 py-3 first:border-t-0 sm:grid-cols-[90px_1fr_auto_auto] sm:gap-4 sm:px-3 ${
                  isCompleted ? "bg-[#6FFFA2]/[0.035]" : ""
                }`}
              >
                <span className="col-start-1 row-start-1 font-pixel text-sm text-white/40 sm:col-auto sm:row-auto">
                  {t("Exercise {number}", {
                    number: formatNumber(exerciseIndex + 1),
                  })}
                </span>

                <div className="col-start-1 row-start-2 min-w-0 sm:col-auto sm:row-auto">
                  <p
                    className={`break-words font-pixel text-lg ${
                      isCompleted ? "text-[#6FFFA2]" : "text-white"
                    }`}
                  >
                    {exercise.name}
                  </p>

                  <p
                    className={`font-pixel text-xs uppercase ${
                      isCompleted
                        ? "text-[#6FFFA2]"
                        : difficultyColors[exercise.difficulty]
                    }`}
                  >
                    {isCompleted
                      ? t("Completed")
                      : exercise.difficulty === "easy"
                        ? t("easy")
                        : exercise.difficulty === "medium"
                          ? t("medium")
                          : t("hard")}
                  </p>
                </div>

                <span
                  className={`col-start-2 row-start-1 text-right font-pixel text-lg sm:col-auto sm:row-auto ${
                    isCompleted
                      ? "text-[#6FFFA2]"
                      : canStart
                        ? "text-[#FFD400]"
                        : "text-white/25"
                  }`}
                >
                  +{formatNumber(exercise.xp)} XP
                </span>
                {isCompleted || canStart ? (
                  <Link
                    href={`/courses/${chapter.courseId}/${chapter.chapterId}/${encodeURIComponent(exercise.slug)}`}
                    title={
                      isCompleted
                        ? t("Open {exercise}", { exercise: exercise.name })
                        : t("Start {exercise}", { exercise: exercise.name })
                    }
                    aria-label={
                      isCompleted
                        ? t("Open completed exercise {exercise}", {
                            exercise: exercise.name,
                          })
                        : t("Start {exercise}", { exercise: exercise.name })
                    }
                    className={`col-start-2 row-start-2 flex size-9 items-center justify-center justify-self-end border transition-all duration-300 sm:col-auto sm:row-auto sm:justify-self-auto ${
                      isCompleted
                        ? "border-[#6FFFA2] bg-[#6FFFA2] text-black"
                        : "border-[#FFD400] bg-[#FFD400] text-black shadow-[3px_3px_0_#FF8C00] hover:translate-x-px hover:translate-y-px hover:shadow-none"
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
                        ? t("Enroll to unlock this exercise")
                        : !isCompletedDataReady
                          ? t("Loading your progress")
                          : t("Complete the previous exercise first")
                    }
                    aria-label={t("{exercise} is locked", {
                      exercise: exercise.name,
                    })}
                    className="col-start-2 row-start-2 flex size-9 cursor-not-allowed items-center justify-center justify-self-end border border-white/10 bg-white/[0.025] text-white/20 sm:col-auto sm:row-auto sm:justify-self-auto"
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

/**
 * Renders the course chapters and tracks exercise completion for enrolled users.
 *
 * @param chapters - The chapters and exercises to display.
 * @param isEnrolled - Whether the current user is enrolled in the course.
 * @param onProgressChange - Callback invoked with the calculated course progress.
 */
export default function CourseChapters({
  chapters,
  isEnrolled,
  onProgressChange,
}: CourseChaptersProps) {
  const { t, translateMessage } = useI18n();
  const [completedExerciseKeys, setCompletedExerciseKeys] = useState<
    Set<string>
  >(() => new Set());

  const [loadedCompletedCourseId, setLoadedCompletedCourseId] = useState<
    number | null
  >(null);

  const [loadingError, setLoadingError] = useState("");

  const courseId = chapters[0]?.courseId;

  const orderedChapters = useMemo(
    () =>
      [...chapters].sort(
        (firstChapter, secondChapter) =>
          firstChapter.chapterId - secondChapter.chapterId,
      ),
    [chapters],
  );

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
  }, [orderedChapters, completedExerciseKeys, isCompletedDataReady]);

  const nextExerciseKey = nextExercise?.key ?? null;

  /*
   * Завантажуємо завершені вправи.
   */
  useEffect(() => {
    if (!isEnrolled || !courseId) {
      setCompletedExerciseKeys(new Set());
      setLoadedCompletedCourseId(null);
      setLoadingError("");
      return;
    }

    const controller = new AbortController();

    setLoadedCompletedCourseId(null);
    setLoadingError("");

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
          throw new Error(
            translateMessage(
              data.error || t("Failed to load completed exercises"),
            ),
          );
        }

        const completedExercises = Array.isArray(data.completedExercises)
          ? (data.completedExercises as CompletedExercise[])
          : [];

        const loadedExerciseKeys = new Set(
          completedExercises.map((item) =>
            getExerciseKey(item.chapterId, item.exerciseSlug),
          ),
        );

        if (!controller.signal.aborted) {
          setCompletedExerciseKeys(loadedExerciseKeys);
          setLoadedCompletedCourseId(courseId);
          setLoadingError("");

          onProgressChange?.(
            calculateCourseProgress(orderedChapters, loadedExerciseKeys),
          );
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Completed exercises loading error:", error);

        if (!controller.signal.aborted) {
          setCompletedExerciseKeys(new Set());
          setLoadedCompletedCourseId(null);
          setLoadingError(
            error instanceof Error
              ? translateMessage(error.message)
              : t("Failed to load completed exercises"),
          );
        }
      }
    };

    void loadCompletedExercises();

    return () => {
      controller.abort();
    };
  }, [
    courseId,
    isEnrolled,
    onProgressChange,
    orderedChapters,
    t,
    translateMessage,
  ]);

  return (
    <div className="min-w-0 lg:col-span-2">
      <p className="font-pixel text-sm uppercase tracking-[0.25em] text-[#899DFF]">
        {t("Quest log")}
      </p>

      <h2 className="mb-6 mt-2 break-words font-pixel text-3xl text-white [text-shadow:3px_3px_0_#28336B] sm:text-4xl md:text-5xl">
        {t("Course")} {" "}
        <span className="text-[#FFD400] [text-shadow:3px_3px_0_#FF8C00]">
          {t("chapters")}
        </span>
      </h2>

      {isEnrolled && isCompletedDataReady && nextExercise && courseId && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-2 border-[#899DFF]/45 bg-[#10152A] p-4 shadow-[5px_5px_0_#020307]">
          <div>
            <p className="font-pixel text-sm uppercase tracking-[0.16em] text-[#899DFF]">
              {t("Next available exercise")}
            </p>

            <p className="mt-1 font-pixel text-2xl text-white">
              {nextExercise.exercise.name}
            </p>
          </div>

          <Link
            href={`/courses/${courseId}/${nextExercise.chapterId}/${encodeURIComponent(nextExercise.exercise.slug)}`}
            className="w-full border-2 border-black bg-[#FFD400] px-4 py-2 text-center font-pixel text-xl text-black shadow-[3px_3px_0_#FF8C00] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-none sm:w-auto"
          >
            {t("Start next exercise")}
          </Link>
        </div>
      )}

      {isEnrolled &&
        isCompletedDataReady &&
        !nextExercise &&
        chapters.length > 0 && (
          <div className="mb-6 border border-[#6FFFA2]/40 bg-[#6FFFA2]/5 p-4">
            <p className="font-pixel text-xl text-[#6FFFA2]">
              {t("Course completed! Every exercise is finished.")}
            </p>
          </div>
        )}

      {loadingError && (
        <div className="mb-4 border border-red-500 bg-red-500/10 p-3">
          <p className="font-pixel text-lg text-red-400">{loadingError}</p>
        </div>
      )}

      {chapters.length === 0 ? (
        <div className="border-2 border-[#899DFF]/45 bg-[#10152A] p-6 text-center shadow-[5px_5px_0_#020307]">
          <p className="font-pixel text-2xl text-white/60">
            {t("This course does not have any chapters yet.")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border-2 border-[#899DFF]/45 bg-[#10152A] shadow-[7px_7px_0_#020307]">
          {orderedChapters.map((chapter) => (
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
