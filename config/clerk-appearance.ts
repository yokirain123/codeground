import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { ComponentProps } from "react";

type ClerkAppearance = NonNullable<
  ComponentProps<typeof ClerkProvider>["appearance"]
>;

const pixelFont = "var(--font-jersey-10)";

export const clerkAppearance: ClerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",

  variables: {
    colorPrimary: "#FFD400",
    colorPrimaryForeground: "#07080C",

    colorBackground: "#10152A",
    colorForeground: "#FFFFFF",

    colorMuted: "#0B0F20",
    colorMutedForeground: "rgba(255, 255, 255, 0.58)",
    colorNeutral: "#899DFF",

    colorBorder: "rgba(137, 157, 255, 0.45)",
    colorRing: "#FFD400",
    colorShadow: "#020307",

    colorInput: "#07080C",
    colorInputForeground: "#FFFFFF",
    colorShimmer: "#899DFF",
    colorModalBackdrop: "rgba(2, 3, 7, 0.82)",
    colorDanger: "#FF5C7A",

    fontFamily: pixelFont,
    fontFamilyButtons: pixelFont,
    fontSize: "1rem",

    borderRadius: "0px",
  },

  userButton: {
    elements: {
      avatarBox: {
        width: "42px",
        height: "42px",
        overflow: "hidden",
        border: "2px solid #FFD400",
        borderRadius: "0px",
        boxShadow: "3px 3px 0 #FF8C00",
      },

      userButtonTrigger: {
        borderRadius: "0px",
        outline: "none",
        transition: "transform 160ms ease",

        "&:hover": {
          transform: "translate(-1px, -1px)",
        },

        "&:focus-visible": {
          boxShadow: "0 0 0 2px #07080C, 0 0 0 4px #FFD400",
        },
      },

      userButtonPopoverCard: {
        width: "min(340px, calc(100vw - 24px))",
        overflow: "hidden",
        backgroundColor: "#10152A",
        color: "#FFFFFF",
        border: "2px solid rgba(137, 157, 255, 0.65)",
        borderRadius: "0px",
        boxShadow: "8px 8px 0 #020307",
      },

      userButtonPopoverMain: {
        backgroundColor: "#10152A",
      },

      /*
       * Dashboard, Playground, Courses, Achievements
       */
      userButtonPopoverCustomItemButton: {
        minHeight: "48px",
        color: "#FFFFFF",
        fontFamily: pixelFont,
        fontSize: "1.125rem",
        borderRadius: "0px",
        transition: "background-color 160ms ease, color 160ms ease",

        "&:hover, &:focus-visible": {
          backgroundColor: "#FFD400",
          color: "#07080C",
        },

        "&:focus-visible": {
          outline: "2px solid #FF8C00",
          outlineOffset: "-2px",
        },
      },

      userButtonPopoverCustomItemButtonIconBox: {
        color: "inherit",
      },

      userButtonPopoverActionItemButtonIcon: {
        width: "20px",
        height: "20px",
        color: "currentColor",
      },

      /*
       * Manage account та Sign out
       */
      userButtonPopoverActionButton: {
        minHeight: "48px",
        color: "#FFFFFF",
        fontFamily: pixelFont,
        fontSize: "1.125rem",
        borderRadius: "0px",
        transition: "background-color 160ms ease, color 160ms ease",

        "&:hover, &:focus-visible": {
          backgroundColor: "#FFD400",
          color: "#07080C",
        },

        "&:focus-visible": {
          outline: "2px solid #FF8C00",
          outlineOffset: "-2px",
        },
      },

      userButtonPopoverActionButtonIconBox: {
        color: "inherit",
      },

      userButtonPopoverActionButtonIcon: {
        width: "20px",
        height: "20px",
        color: "currentColor",
      },

      userPreviewMainIdentifier: {
        color: "#FFD400",
        fontFamily: pixelFont,
        fontSize: "1.125rem",
      },

      userPreviewSecondaryIdentifier: {
        color: "rgba(255, 255, 255, 0.58)",
        fontFamily: pixelFont,
        fontSize: "0.9375rem",
      },

      userButtonPopoverFooter: {
        backgroundColor: "#0B0F20",
        borderTop: "1px solid rgba(137, 157, 255, 0.25)",
      },
    },
  },
};