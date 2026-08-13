"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";
import { toast } from "sonner";

interface CompletionResponse {
  alreadyCompleted?: boolean;
  error?: string;
  xpEarned?: number;
}

interface CompletionCheckResponse {
  isCompleted: boolean;
  error?: string;
}

interface CompletionState {
  requestKey: string | null;
  isCompleted: boolean;
}

interface ExecutionContext {
  executionOutput?: string;
  stdin?: string;
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

export function useExerciseCompletion(
  onCompletionChange?: (isCompleted: boolean) => void,
) {
  const params = useParams<{
    id: string;
    chapterId: string;
    exerciseSlug: string;
  }>();

  const [isCompleting, setIsCompleting] = useState(false);
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

  const isChecking =
    requestKey !== null && completionState.requestKey !== requestKey;

  const isCompleted =
    requestKey !== null &&
    completionState.requestKey === requestKey &&
    completionState.isCompleted;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    const controller = new AbortController();

    const checkCompletion = async () => {
      try {
        const query = new URLSearchParams({
          courseId: String(courseId),
          chapterId: String(chapterId),
          exerciseSlug,
        });

        const response = await fetch(`/api/completed-exercises?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = (await response.json()) as CompletionCheckResponse;

        if (!response.ok) {
          throw new Error(data.error || "Failed to check completion");
        }

        if (!controller.signal.aborted) {
          setCompletionState({ requestKey, isCompleted: data.isCompleted });
          onCompletionChange?.(data.isCompleted);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Completion check error:", error);

        if (!controller.signal.aborted) {
          setCompletionState({ requestKey, isCompleted: false });
          onCompletionChange?.(false);
        }
      }
    };

    void checkCompletion();

    return () => controller.abort();
  }, [requestKey, courseId, chapterId, exerciseSlug, onCompletionChange]);

  const completeExercise = async (
  files: Record<string, string>,
  executionContext: ExecutionContext = {},
) => {
    if (!requestKey || isChecking || isCompleting || isCompleted) {
      return;
    }

    try {
      setIsCompleting(true);

      const response = await fetch("/api/completed-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  courseId,
  chapterId,
  exerciseSlug,
  files,
  executionOutput:
    executionContext.executionOutput,
  stdin: executionContext.stdin,
}),
      });

      const data = (await response.json()) as CompletionResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete exercise");
      }

      setCompletionState({ requestKey, isCompleted: true });
      onCompletionChange?.(true);

      if (data.alreadyCompleted) {
        toast.info("Exercise was already completed");
      } else {
        toast.success("Exercise completed!", {
          description:
            typeof data.xpEarned === "number"
              ? `You earned ${data.xpEarned} XP.`
              : undefined,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to complete exercise";

      toast.error(message);
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    completeExercise,
    isChecking,
    isCompleting,
    isCompleted,
  };
}
