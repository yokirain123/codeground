import type {
  SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";

interface SandpackCourseTemplate {
  engine: "sandpack";
  template: SandpackPredefinedTemplate;
  preferredActiveFile: string;
}

interface PythonCourseTemplate {
  engine: "python";
  preferredActiveFile: "/main.py";
}

export type CourseTemplateConfig =
  | SandpackCourseTemplate
  | PythonCourseTemplate;

export function getCourseTemplate(
  courseTags?: string | null,
): CourseTemplateConfig {
  const tags = (
    courseTags || "html"
  ).toLowerCase();

  const hasTag = (
    ...values: string[]
  ) =>
    values.some((value) =>
      tags.includes(value),
    );

  if (hasTag("python")) {
    return {
      engine: "python",
      preferredActiveFile: "/main.py",
    };
  }

  if (
    hasTag(
      "next.js",
      "nextjs",
      "next js",
    )
  ) {
    return {
      engine: "sandpack",
      template: "nextjs",
      preferredActiveFile:
        "/pages/index.js",
    };
  }

  if (
    hasTag("react") &&
    hasTag(
      "typescript",
      "tsx",
    )
  ) {
    return {
      engine: "sandpack",
      template: "react-ts",
      preferredActiveFile:
        "/App.tsx",
    };
  }

  if (hasTag("react")) {
    return {
      engine: "sandpack",
      template: "react",
      preferredActiveFile:
        "/App.js",
    };
  }

  if (
    hasTag("vue") &&
    hasTag("typescript")
  ) {
    return {
      engine: "sandpack",
      template: "vue-ts",
      preferredActiveFile:
        "/src/App.vue",
    };
  }

  if (hasTag("vue")) {
    return {
      engine: "sandpack",
      template: "vue",
      preferredActiveFile:
        "/src/App.vue",
    };
  }

  if (hasTag("svelte")) {
    return {
      engine: "sandpack",
      template: "svelte",
      preferredActiveFile:
        "/App.svelte",
    };
  }

  if (hasTag("angular")) {
    return {
      engine: "sandpack",
      template: "angular",
      preferredActiveFile:
        "/src/app/app.component.ts",
    };
  }

  if (hasTag("node", "node.js")) {
    return {
      engine: "sandpack",
      template: "node",
      preferredActiveFile:
        "/index.js",
    };
  }

  if (
    hasTag(
      "typescript",
      "type script",
    )
  ) {
    return {
      engine: "sandpack",
      template: "vanilla-ts",
      preferredActiveFile:
        "/index.ts",
    };
  }

  if (
    hasTag(
      "javascript",
      "java script",
    )
  ) {
    return {
      engine: "sandpack",
      template: "vanilla",
      preferredActiveFile:
        "/index.js",
    };
  }

  return {
    engine: "sandpack",
    template: "static",
    preferredActiveFile:
      "/index.html",
  };
}