import {
  ClerkProvider as NextClerkProvider,
} from "@clerk/nextjs";
import type { ComponentProps } from "react";

import { clerkAppearance } from "@/config/clerk-appearance";

type ClerkProviderProps = ComponentProps<typeof NextClerkProvider>;

export function ClerkProvider({
  children,
  ...props
}: ClerkProviderProps) {
  return (
    <NextClerkProvider
      {...props}
      appearance={clerkAppearance}
    >
      {children}
    </NextClerkProvider>
  );
}