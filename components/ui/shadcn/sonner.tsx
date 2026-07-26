"use client";

import { useTheme } from "next-themes";
import {
  Toaster as SonnerToaster,
  type ToasterProps,
} from "sonner";

export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      closeButton
      toastOptions={{
        unstyled: true,
        duration: 2500,

        classNames: {
          toast:
            "flex w-full items-center gap-3 border-2 border-accent bg-background px-4 py-3 font-pixel text-xl text-foreground shadow-[4px_4px_0_0_#FF8C00]",

          success:
            "border-accent bg-background text-foreground",

          error:
            "border-red-500 bg-background text-red-400 shadow-[4px_4px_0_0_#991B1B]",

          warning:
            "border-orange-500 bg-background text-orange-400",

          info:
            "border-blue-500 bg-background text-blue-400",

          title:
            "font-pixel text-xl text-accent",

          description:
            "font-pixel text-base text-foreground/60",

          icon:
            "text-accent",

          closeButton:
            "border border-accent bg-background text-accent hover:bg-accent hover:text-black",
        },
      }}
      {...props}
    />
  );
}