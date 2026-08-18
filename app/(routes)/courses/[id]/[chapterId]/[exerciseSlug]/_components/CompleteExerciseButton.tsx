"use client";

import { Check, Loader2 } from "lucide-react";

import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/shadcn/button";

interface CompleteExerciseButtonProps {
  isChecking: boolean;
  isCompleting: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export default function CompleteExerciseButton({
  isChecking,
  isCompleting,
  isCompleted,
  onClick,
}: CompleteExerciseButtonProps) {
  const { t } = useI18n();
  const isBusy = isChecking || isCompleting;

  return (
    <Button
      type="button"
      disabled={isBusy || isCompleted}
      onClick={onClick}
      className="h-10 cursor-pointer rounded-none border-2 border-[#62FB60] bg-[#62FB60] px-4 font-pixel text-lg text-[#07080C] shadow-[4px_4px_0_0_#049F2B] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#62FB60] hover:shadow-[2px_2px_0_0_#049F2B] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-60"
    >
      {isBusy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Check className="size-4" />
      )}
      {isChecking
  ? t("Loading status...")
  : isCompleting
    ? t("Checking solution...")
    : isCompleted
      ? t("Completed")
      : t("Check solution")}
    </Button>
  );
}
