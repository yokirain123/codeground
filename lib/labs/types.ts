export const labIds = ["git-sandbox", "bug-hunt"] as const;

export type LabId = (typeof labIds)[number];

export const labLanguages = [
  "javascript",
  "typescript",
  "python",
  "csharp",
  "cpp",
  "html",
  "css",
  "react",
  "other",
] as const;

export type LabLanguage = (typeof labLanguages)[number];

export const runnableLabLanguages = [
  "javascript",
  "python",
  "csharp",
  "cpp",
] as const;

export type RunnableLabLanguage = (typeof runnableLabLanguages)[number];

export const labLanguageLabels: Record<LabLanguage, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  csharp: "C#",
  cpp: "C++",
  html: "HTML",
  css: "CSS",
  react: "React",
  other: "Other",
};

export function isLabLanguage(value: unknown): value is LabLanguage {
  return (
    typeof value === "string" &&
    (labLanguages as readonly string[]).includes(value)
  );
}

export function isRunnableLabLanguage(
  value: unknown,
): value is RunnableLabLanguage {
  return (
    typeof value === "string" &&
    (runnableLabLanguages as readonly string[]).includes(value)
  );
}
