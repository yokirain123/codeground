"use client";

import axios from "axios";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { ChevronLeft, ChevronRight, Library } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";

import PlaygroundLayout from "./_components/PlaygroundLayout";

import type { ExerciseResponse } from "./_components/types";

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

  const chapters = isCurrentRequest ? playgroundState.chapters : [];

  const error = !hasValidParameters
    ? "Invalid exercise URL"
    : isCurrentRequest
      ? playgroundState.error
      : "";

  const exerciseTitle = useMemo(() => {
    if (exerciseDetail?.exerciseData.exerciseName) {
      return exerciseDetail.exerciseData.exerciseName;
    }

    return exerciseSlug.replaceAll("-", " ").toUpperCase();
  }, [exerciseDetail, exerciseSlug]);

  const exerciseLocations = useMemo<ExerciseLocation[]>(
    () =>
      [...chapters]
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
        ),
    [chapters],
  );

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

        let errorMessage = "Failed to load exercise";

        if (
          axios.isAxiosError<{
            error?: string;
          }>(error)
        ) {
          errorMessage =
            error.response?.data?.error ?? "Failed to load exercise";
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
  }, [requestKey, courseId, chapterId, exerciseSlug]);

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
      <main className="flex h-[calc(100dvh-64px)] items-center justify-center">
        <p className="font-pixel text-2xl text-accent">Loading exercise...</p>
      </main>
    );
  }

  if (error || !exerciseDetail) {
    return (
      <main className="flex h-[calc(100dvh-64px)] items-center justify-center p-6">
        <p className="font-pixel text-2xl text-red-400">
          {error || "Exercise not found"}
        </p>
      </main>
    );
  }
  const navigationButtonStyles =
  "group relative h-8 w-24 shrink-0 cursor-pointer overflow-hidden border bg-accent py-0 text-base text-black shadow-[3px_3px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-px hover:translate-y-px hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:bg-accent disabled:text-black disabled:opacity-50 disabled:shadow-[3px_3px_0_0_#FF8C00]";
  return (
    <main className="flex h-[calc(100dvh-64px)] min-h-0 flex-col overflow-hidden">
      <nav
        aria-label="Exercise navigation"
        className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.push(`/courses/${courseId}`);
          }}
          className="border-accent font-pixel text-lg text-accent hover:bg-accent hover:text-black"
        >
          <Library className="size-4" />
          All chapters
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="default"
            disabled={!previousExercise}
            title={
              previousExercise
                ? previousExercise.exerciseName
                : "This is the first exercise"
            }
            onClick={() => {
              openExercise(previousExercise);
            }}
            className={navigationButtonStyles}
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
            />

            <span className="relative z-10 flex items-center justify-center transition-colors duration-500 group-hover:text-white">
              <ChevronLeft className="size-5 shrink-0" />
              Previous
            </span>
          </Button>

          <Button
            type="button"
            variant="default"
            disabled={!nextExercise || !isCurrentExerciseCompleted}
            title={
              !isCurrentExerciseCompleted
                ? "Complete this exercise first"
                : nextExercise
                  ? nextExercise.exerciseName
                  : "This is the final exercise"
            }
            onClick={() => {
              openExercise(nextExercise);
            }}
            className={navigationButtonStyles}
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
            />

            <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-500 group-hover:text-white">
              Next
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
