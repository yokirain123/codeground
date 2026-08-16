"use client";

import { useState } from "react";
import { toast } from "sonner";

import { getChallengeDraftKey } from "@/lib/challenges/draft";

interface CompleteChallengeResponse {
  completed?: boolean;
  alreadyCompleted?: boolean;
  xpEarned?: number;
  error?: string;
  validationErrors?: string[];
}

interface ExecutionContext {
  executionOutput?: string;
  stdin?: string;
}

interface UseChallengeCompletionOptions {
  slug: string;
  initialCompleted: boolean;
  onCompletionChange?: (isCompleted: boolean) => void;
}

export function useChallengeCompletion({
  slug,
  initialCompleted,
  onCompletionChange,
}: UseChallengeCompletionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);

  const completeChallenge = async (
    files: Record<string, string>,
    executionContext: ExecutionContext = {},
  ) => {
    if (isSubmitting || isCompleted) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/challenges/${encodeURIComponent(slug)}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files,
            executionOutput: executionContext.executionOutput,
            stdin: executionContext.stdin,
          }),
        },
      );

      const data = (await response.json()) as CompleteChallengeResponse;

      if (!response.ok) {
        throw new Error(
          data.validationErrors?.[0] ||
            data.error ||
            "The challenge is not complete yet.",
        );
      }

      setIsCompleted(true);
      onCompletionChange?.(true);
      localStorage.removeItem(getChallengeDraftKey(slug));

      if (data.alreadyCompleted) {
        toast.info("Challenge already completed");
      } else {
        toast.success("Challenge cleared!", {
          description:
            typeof data.xpEarned === "number"
              ? `You earned ${data.xpEarned} XP.`
              : undefined,
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete the challenge.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    completeChallenge,
    isSubmitting,
    isCompleted,
  };
}
