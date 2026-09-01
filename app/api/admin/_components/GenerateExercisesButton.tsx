"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/shadcn/button";
import { useI18n } from "@/components/i18n/I18nProvider";

interface GenerateExercisesButtonProps {
  courseId: number;
  chapterId: number;
  overwrite?: boolean;
}

interface GenerateExercisesResponse {
  generated?: number;
  skipped?: number;
  message?: string;
  error?: string;
}

export default function GenerateExercisesButton({
  courseId,
  chapterId,
  overwrite = false,
}: GenerateExercisesButtonProps) {
  const { locale, t, translateMessage } = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateExercises = async () => {
    if (isGenerating) {
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch("/api/admin/generate-exercises-v3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          chapterId,
          overwrite,
          locale,
        }),
      });

      const data = (await response.json()) as GenerateExercisesResponse;

      if (!response.ok) {
        throw new Error(
          translateMessage(data.error || t("Failed to generate exercises")),
        );
      }

      if ((data.generated ?? 0) === 0) {
        toast.info(t("Nothing to generate"), {
          description:
            locale === "uk"
              ? t("All exercises in this chapter already have content.")
              : data.message,
        });
        return;
      }

      toast.success(t("Exercises generated!"), {
        description: t("{count} exercises were saved to the database.", {
          count: data.generated,
        }),
      });
    } catch (error) {
      console.error("Exercise generation error:", error);

      toast.error(t("Generation failed"), {
        description:
          error instanceof Error
            ? translateMessage(error.message)
            : t("Failed to generate exercises"),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={() => {
        void generateExercises();
      }}
      disabled={isGenerating}
      className="group relative h-auto min-h-10 cursor-pointer overflow-hidden border bg-accent px-4 py-2 text-center text-xl whitespace-normal text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className="absolute top-full left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
      />

      <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
        {isGenerating ? t("Generating...") : t("Generate exercises with AI")}
      </span>
    </Button>
  );
}
