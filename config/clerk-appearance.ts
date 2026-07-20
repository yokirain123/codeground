import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { ComponentProps } from "react";

type ClerkAppearance = NonNullable<
  ComponentProps<typeof ClerkProvider>["appearance"]
>;

export const clerkAppearance: ClerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",

  variables: {
    colorPrimary: "#FFD400",
    colorPrimaryForeground: "#000000",

    colorBackground: "#151515",
    colorForeground: "#ffffff",

    colorMuted: "#202020",
    colorMutedForeground: "#a3a3a3",

    colorBorder: "#FFD400",
    colorRing: "#FF8C00",

    fontFamily: "var(--font-jersey-10)",
    fontFamilyButtons: "var(--font-jersey-10)",
    fontSize: "1rem",

    borderRadius: "0px",
  },

  userButton: {
    elements: {
      avatarBox: {
        width: "42px",
        height: "42px",
        border: "2px solid #FFD400",
        borderRadius: "0px",
        boxShadow: "3px 3px 0 #FF8C00",
      },

      userButtonTrigger: {
        borderRadius: "0px",
        outline: "none",
      },

      userButtonPopoverCard: {
        width: "340px",
        backgroundColor: "#151515",
        border: "2px solid #FFD400",
        borderRadius: "0px",
        boxShadow: "6px 6px 0 #FF8C00",
      },

      userButtonPopoverActionButton: {
        color: "#ffffff",
        fontSize: "18px",
        borderRadius: "0px",
        transition: "background-color 200ms, color 200ms",

        "&:hover": {
          backgroundColor: "#FFD400",
          color: "#000000",
        },
      },

      userButtonPopoverActionButtonIcon: {
        color: "#FFD400",
      },

      userPreviewMainIdentifier: {
        color: "#FFD400",
        fontSize: "18px",
      },

      userPreviewSecondaryIdentifier: {
        color: "#a3a3a3",
        fontSize: "15px",
      },

      userButtonPopoverFooter: {
        backgroundColor: "#111111",
        borderTop: "1px solid #333333",
      },
    },
  },
};