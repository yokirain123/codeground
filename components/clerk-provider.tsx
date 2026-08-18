import {
  ClerkProvider as NextClerkProvider,
} from "@clerk/nextjs";
import { enUS, ukUA } from "@clerk/localizations";
import type { ComponentProps } from "react";

import { clerkAppearance } from "@/config/clerk-appearance";
import type { Locale } from "@/lib/i18n/config";

type ClerkProviderProps = ComponentProps<typeof NextClerkProvider>;

export function ClerkProvider({
  children,
  locale,
  ...props
}: ClerkProviderProps & { locale: Locale }) {
  return (
    <NextClerkProvider
      {...props}
      appearance={clerkAppearance}
      localization={locale === "uk" ? ukUA : enUS}
    >
      {children}
    </NextClerkProvider>
  );
}
