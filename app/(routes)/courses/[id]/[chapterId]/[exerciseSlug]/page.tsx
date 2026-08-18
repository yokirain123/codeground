"use client";

import axios from "axios";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { ChevronLeft, ChevronRight, Library } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { useI18n } from "@/components/i18n/I18nProvider";

import PlaygroundLayout from "./_components/PlaygroundLayout";

import type { ExerciseResponse } from "./_components/types";
import TokenStateScreen from "@/components/TokenStateScreen";

interface CourseExercise {
  name: string;
  slug: string;
  xp: number;
  difficulty: string;
}

interface CourseChapter {
  id: number;
  courseId: number;
  chapterId: number;
  name: string;
  desc: string;
  exercises: CourseExercise[];
}

interface ExerciseLocation {
  chapterId: number;
  exerciseSlug: string;
  exerciseName: string;
}

interface PlaygroundState {
  requestKey: string | null;
  exerciseDetail: ExerciseResponse | null;
  chapters: CourseChapter[];
  error: string;
}

interface CompletionState {
  requestKey: string | null;
  isCompleted: boolean;
}

function normalizeParameter(value: string | string[] | undefined) {
  const parameter = Array.isArray(value) ? value[0] : value;

  if (!parameter) {
    return "";
  }

  try {
    return decodeURIComponent(parameter);
  } catch {
    return parameter;
  }
}

export default function Playground() {
  const { t } = useI18n();
  const router = useRouter();

  const params = useParams<{
    id: string;
    chapterId: string;
    exerciseSlug: string;
  }>();

  const [playgroundState, setPlaygroundState] = useState<PlaygroundState>({
    requestKey: null,
    exerciseDetail: null,
    chapters: [],
    error: "",
  });

  const [completionState, setCompletionState] = useState<CompletionState>({
    requestKey: null,
    isCompleted: false,
  });

  const courseId = Number(normalizeParameter(params.id));

  const chapterId = Number(normalizeParameter(params.chapterId));

  const exerciseSlug = normalizeParameter(params.exerciseSlug);

  const hasValidParameters =
    Number.isInteger(courseId) &&
    courseId > 0 &&
    Number.isInteger(chapterId) &&
    chapterId > 0 &&
    Boolean(exerciseSlug);

  const requestKey = hasValidParameters
    ? `${courseId}:${chapterId}:${exerciseSlug}`
    : null;

  const isCurrentRequest =
    requestKey !== null && playgroundState.requestKey === requestKey;

  const loading = requestKey !== null && !isCurrentRequest;

  const exerciseDetail = isCurrentRequest
    ? playgroundState.exerciseDetail
    : null;

  const error = !hasValidParameters
    ? t("Invalid exercise URL")
    : isCurrentRequest
      ? playgroundState.error
      : "";

  const exerciseTitle = useMemo(() => {
    if (exerciseDetail?.exerciseData.exerciseName) {
      return exerciseDetail.exerciseData.exerciseName;
    }

    return exerciseSlug.replaceAll("-", " ").toUpperCase();
  }, [exerciseDetail, exerciseSlug]);

  const exerciseLocations = useMemo<ExerciseLocation[]>(() => {
    const chapters = isCurrentRequest ? playgroundState.chapters : [];

    return [...chapters]
        .sort(
          (firstChapter, secondChapter) =>
            firstChapter.chapterId - secondChapter.chapterId,
        )
        .flatMap((chapter) =>
          chapter.exercises.map((exercise) => ({
            chapterId: chapter.chapterId,

            exerciseSlug: exercise.slug,

            exerciseName: exercise.name,
          })),
        );
  }, [isCurrentRequest, playgroundState.chapters]);

  const currentExerciseIndex = useMemo(
    () =>
      exerciseLocations.findIndex(
        (location) =>
          location.chapterId === chapterId &&
          location.exerciseSlug === exerciseSlug,
      ),
    [exerciseLocations, chapterId, exerciseSlug],
  );

  const previousExercise =
    currentExerciseIndex > 0
      ? exerciseLocations[currentExerciseIndex - 1]
      : null;

  const nextExercise =
    currentExerciseIndex >= 0 &&
    currentExerciseIndex < exerciseLocations.length - 1
      ? exerciseLocations[currentExerciseIndex + 1]
      : null;

  const isCurrentExerciseCompleted =
    requestKey !== null &&
    completionState.requestKey === requestKey &&
    completionState.isCompleted;

  const handleCompletionChange = useCallback(
    (isCompleted: boolean) => {
      if (!requestKey) {
        return;
      }

      setCompletionState({
        requestKey,
        isCompleted,
      });
    },
    [requestKey],
  );

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    const controller = new AbortController();

    const getPlaygroundData = async () => {
      try {
        const [exerciseResponse, chaptersResponse] = await Promise.all([
          axios.post<ExerciseResponse>(
            "/api/exercise",
            {
              courseId,
              chapterId,
              exerciseId: exerciseSlug,
            },
            {
              signal: controller.signal,
            },
          ),

          axios.get<CourseChapter[]>("/api/admin/save-chapters", {
            params: {
              courseId,
            },

            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setPlaygroundState({
          requestKey,

          exerciseDetail: exerciseResponse.data,

          chapters: chaptersResponse.data,

          error: "",
        });
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.error("Playground loading error:", error);

        let errorMessage = t("Failed to load exercise");

        if (
          axios.isAxiosError<{
            error?: string;
          }>(error)
        ) {
          errorMessage =
            error.response?.data?.error ?? t("Failed to load exercise");
        }

        if (!controller.signal.aborted) {
          setPlaygroundState({
            requestKey,
            exerciseDetail: null,
            chapters: [],
            error: errorMessage,
          });
        }
      }
    };

    void getPlaygroundData();

    return () => {
      controller.abort();
    };
  }, [requestKey, courseId, chapterId, exerciseSlug, t]);

  const openExercise = (location: ExerciseLocation | null) => {
    if (!location) {
      return;
    }

    router.push(
      `/courses/${courseId}/${location.chapterId}/${encodeURIComponent(location.exerciseSlug)}`,
    );
  };

  if (loading) {
    return (
      <TokenStateScreen mode="loading" />
    );
  }

  if (error || !exerciseDetail) {
    return (
      <main className="flex h-[calc(100dvh-64px)] items-center justify-center bg-[#07080C] p-6">
        <p className="border border-red-400/30 bg-red-400/10 p-5 font-pixel text-2xl text-red-400">
          {error || t("Exercise not found")}
        </p>
      </main>
    );
  }
  const navigationButtonStyles =
  "group relative h-8 w-24 shrink-0 cursor-pointer overflow-hidden border-2 border-black bg-[#FFD400] py-0 text-base text-black shadow-[3px_3px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-px hover:translate-y-px hover:bg-[#FFD400] hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:bg-[#FFD400] disabled:text-black disabled:opacity-40 disabled:shadow-[3px_3px_0_0_#FF8C00]";
  return (
    <main className="flex h-[calc(100dvh-64px)] min-h-0 flex-col overflow-hidden bg-[#07080C] text-white">
      <nav
        aria-label={t("Exercise navigation")}
        className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#10152A] px-4 py-3"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.push(`/courses/${courseId}`);
          }}
          className="border-[#899DFF]/45 bg-black/20 font-pixel text-lg text-[#899DFF] hover:border-[#FFD400]/70 hover:bg-[#FFD400]/10 hover:text-[#FFD400]"
        >
          <Library className="size-4" />
          {t("All chapters")}
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="default"
            disabled={!previousExercise}
            title={
              previousExercise
                ? previousExercise.exerciseName
                : t("This is the first exercise")
            }
            onClick={() => {
              openExercise(previousExercise);
            }}
            className={navigationButtonStyles}
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#FF8C00] transition-transform duration-700 ease-in-out group-hover:scale-[18]"
            />

            <span className="relative z-10 flex items-center justify-center transition-colors duration-500 group-hover:text-white">
              <ChevronLeft className="size-5 shrink-0" />
              {t("Previous")}
            </span>
          </Button>

          <Button
            type="button"
            variant="default"
            disabled={!nextExercise || !isCurrentExerciseCompleted}
            title={
              !isCurrentExerciseCompleted
                ? t("Complete this exercise first")
                : nextExercise
                  ? nextExercise.exerciseName
                  : t("This is the final exercise")
            }
            onClick={() => {
              openExercise(nextExercise);
            }}
            className={navigationButtonStyles}
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#FF8C00] transition-transform duration-700 ease-in-out group-hover:scale-[18]"
            />

            <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-500 group-hover:text-white">
              {t("Next")}
              <ChevronRight className="size-5 shrink-0" />
            </span>
          </Button>
        </div>
      </nav>

      <div className="min-h-0 flex-1 overflow-hidden">
        <PlaygroundLayout
          exerciseTitle={exerciseTitle}
          exercise={exerciseDetail.exerciseData}
          onCompletionChange={handleCompletionChange}
        />
      </div>
    </main>
  );
}
