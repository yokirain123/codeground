export const codeQuestSandpackTheme = {
  colors: {
    surface1: "#171717",
    surface2: "#171717",
    surface3: "#484747",
    clickable: "#939293",
    base: "#C1C0C1",
    disabled: "#444344",
    hover: "#FCFCFA",
    accent: "#FFD866",
    error: "#ffcdca",
    errorSurface: "#c24038",
  },

  syntax: {
    plain: "#ebdbb2",
    comment: {
      color: "#928374",
      fontStyle: "italic"
    },
    keyword: "#ff453a",
    tag: "#83a598",
    punctuation: "#ebdbb2",
    definition: "#83a598",
    property: "#fabd2f",
    static: "#ebdbb2",
    string: "#b8bb26"
  },

  font: {
    body:
      'var(--font-vt323), "Segoe UI Emoji", sans-serif',

    mono:
      'var(--font-vt323), "Fira Mono", Menlo, Consolas, monospace',

    size: "16px",
    lineHeight: "22px",
  },
} as const;