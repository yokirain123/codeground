"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PlaygroundLayout from "./_components/PlaygroundLayout";

import type { ExerciseResponse } from "./_components/types";

export default function Playground() {
  const params = useParams<{
    id: string;
    chapterId: string;
    exerciseSlug: string;
  }>();

  const [
    exerciseDetail,
    setExerciseDetail,
  ] =
    useState<ExerciseResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const courseId = Number(params.id);

  const chapterId = Number(
    params.chapterId,
  );

  const exerciseSlug =
    params.exerciseSlug;

  const exerciseTitle = useMemo(() => {
    if (
      exerciseDetail?.exerciseData
        .exerciseName
    ) {
      return exerciseDetail.exerciseData
        .exerciseName;
    }

    return decodeURIComponent(
      exerciseSlug,
    )
      .replaceAll("-", " ")
      .toUpperCase();
  }, [
    exerciseDetail,
    exerciseSlug,
  ]);

  useEffect(() => {
    const controller =
      new AbortController();

    const getExerciseDetail =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await axios.post<ExerciseResponse>(
              "/api/exercise",
              {
                courseId,
                chapterId,
                exerciseId:
                  exerciseSlug,
              },
              {
                signal:
                  controller.signal,
              },
            );

          setExerciseDetail(
            response.data,
          );
        } catch (error) {
          if (axios.isCancel(error)) {
            return;
          }

          console.error(
            "Exercise loading error:",
            error,
          );

          if (
            axios.isAxiosError(error)
          ) {
            setError(
              error.response?.data
                ?.error ??
                "Failed to load exercise",
            );
          } else {
            setError(
              "Failed to load exercise",
            );
          }
        } finally {
          if (
            !controller.signal.aborted
          ) {
            setLoading(false);
          }
        }
      };

    if (
      Number.isInteger(courseId) &&
      courseId > 0 &&
      Number.isInteger(chapterId) &&
      chapterId > 0 &&
      exerciseSlug
    ) {
      void getExerciseDetail();
    }

    return () => {
      controller.abort();
    };
  }, [
    courseId,
    chapterId,
    exerciseSlug,
  ]);

  if (loading) {
    return (
      <main className="flex h-[calc(100dvh-64px)] items-center justify-center">
        <p className="font-pixel text-2xl text-accent">
          Loading exercise...
        </p>
      </main>
    );
  }

  if (error || !exerciseDetail) {
    return (
      <main className="flex h-[calc(100dvh-64px)] items-center justify-center p-6">
        <p className="font-pixel text-2xl text-red-400">
          {error ||
            "Exercise not found"}
        </p>
      </main>
    );
  }

  return (
    <main className="h-[calc(100dvh-64px)] min-h-0 overflow-hidden">
      <PlaygroundLayout
        exerciseTitle={exerciseTitle}
        exercise={
          exerciseDetail.exerciseData
        }
      />
    </main>
  );
}