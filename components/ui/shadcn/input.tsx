import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Розмір і текст
        "h-11 w-full min-w-0 px-3 py-2",
        "font-pixel text-xl text-black caret-black",

        // Піксельний дизайн
        "rounded-none border-2 border-black bg-accent",
        "shadow-[4px_4px_0_0_#FF8C00]",

        // Placeholder
        "placeholder:text-black/50",

        // Анімація
        "outline-none transition-all duration-200",

        // Hover
        "hover:bg-accent",

        // Focus — ефект натиснутої кнопки
        "focus-visible:translate-x-[2px]",
        "focus-visible:translate-y-[2px]",
        "focus-visible:shadow-[2px_2px_0_0_#FF8C00]",
        "focus-visible:ring-0",

        // File input
        "file:mr-3 file:border-0 file:bg-transparent",
        "file:font-pixel file:text-lg file:text-black",

        // Disabled
        "disabled:pointer-events-none",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",

        // Error
        "aria-invalid:border-destructive",
        "aria-invalid:shadow-[4px_4px_0_0_var(--destructive)]",

        className,
      )}
      {...props}
    />
  );
}

export { Input };