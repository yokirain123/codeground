import { Check, LoaderCircle, Swords } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";

interface ChallengeSubmitButtonProps {
  isSubmitting: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export default function ChallengeSubmitButton({
  isSubmitting,
  isCompleted,
  onClick,
}: ChallengeSubmitButtonProps) {
  return (
    <Button
      type="button"
      disabled={isSubmitting || isCompleted}
      onClick={onClick}
      className="h-10 cursor-pointer rounded-none border-2 border-[#62FB60] bg-[#62FB60] px-5 font-pixel text-base text-[#07080C] shadow-[3px_3px_0_0_#049F2B] hover:translate-x-px hover:translate-y-px hover:bg-[#62FB60] hover:shadow-[1px_1px_0_0_#049F2B] disabled:pointer-events-none disabled:opacity-60"
    >
      {isSubmitting ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : isCompleted ? (
        <Check className="size-4" />
      ) : (
        <Swords className="size-4" />
      )}
      {isSubmitting
        ? "Checking..."
        : isCompleted
          ? "Completed"
          : "Submit challenge"}
    </Button>
  );
}
