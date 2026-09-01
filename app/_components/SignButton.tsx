"use client";

import { Button } from "@/components/ui/shadcn/button";
import { useI18n } from "@/components/i18n/I18nProvider";

function SignButton() {
  const { t } = useI18n();

  return (
    <div>
        <Button
        variant="default"
        className="group relative w-full cursor-pointer overflow-hidden border bg-accent px-3 py-3 text-2xl whitespace-normal text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none sm:w-auto sm:py-4 sm:text-3xl"
      >
        <span
          aria-hidden="true"
          className="absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
        />

        <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
          {t("Sign up")}
        </span>
      </Button>
    </div>
  )
}

export default SignButton
