import type {
  SandpackFiles,
  SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";

export type PlaygroundPresetId =
  | "html"
  | "javascript"
  | "typescript"
  | "react"
  | "react-typescript"
  | "react-tailwind";

export interface PlaygroundPreset {
  id: PlaygroundPresetId;
  label: string;
  description: string;
  template: SandpackPredefinedTemplate;
  activeFile: string;
  visibleFiles: string[];
  files: SandpackFiles;
  externalResources?: string[];
}

const sharedStyles = `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #171717;
  color: #ffffff;
  font-family: system-ui, sans-serif;
}

main,
#app {
  width: min(90%, 700px);
}

.card {
  border: 2px solid #ffd400;
  padding: 32px;
  box-shadow: 6px 6px 0 #ff8c00;
}

h1 {
  margin-top: 0;
  color: #ffd400;
}

button {
  cursor: pointer;
  border: 0;
  padding: 12px 18px;
  background: #ffd400;
  color: #000000;
  font: inherit;
  font-weight: 700;
  box-shadow: 4px 4px 0 #ff8c00;
}

button:hover {
  background: #ff8c00;
  color: #ffffff;
}`;

export const playgroundPresets: Record<
  PlaygroundPresetId,
  PlaygroundPreset
> = {
  html: {
    id: "html",
    label: "HTML · CSS · JavaScript",
    description: "Classic static website",
    template: "static",
    activeFile: "/index.html",
    visibleFiles: [
      "/index.html",
      "/styles.css",
      "/script.js",
    ],
    files: {
      "/index.html": {
        active: true,
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>My Playground</title>

    <link
      rel="stylesheet"
      href="/styles.css"
    />
  </head>

  <body>
    <main class="card">
      <h1>HTML Playground</h1>

      <p>
        Start building something cool.
      </p>

      <button id="action-button">
        Click me
      </button>
    </main>

    <script src="/script.js"></script>
  </body>
</html>`,
      },

      "/styles.css": {
        code: sharedStyles,
      },

      "/script.js": {
        code: `const button = document.querySelector(
  "#action-button",
);

let clicks = 0;

button?.addEventListener("click", () => {
  clicks += 1;

  button.textContent = \`Clicks: \${clicks}\`;
});`,
      },
    },
  },

  javascript: {
    id: "javascript",
    label: "JavaScript",
    description: "Vanilla JavaScript project",
    template: "vanilla",
    activeFile: "/index.js",
    visibleFiles: [
      "/index.js",
      "/index.html",
      "/styles.css",
    ],
    files: {
      "/index.html": {
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>JavaScript Playground</title>
  </head>

  <body>
    <div id="app"></div>

    <script
      type="module"
      src="/index.js"
    ></script>
  </body>
</html>`,
      },

      "/index.js": {
        active: true,
        code: `import "./styles.css";

const app = document.querySelector("#app");

let score = 0;

function render() {
  app.innerHTML = \`
    <div class="card">
      <h1>JavaScript Quest</h1>

      <p>Score: \${score}</p>

      <button id="score-button">
        Earn point
      </button>
    </div>
  \`;

  document
    .querySelector("#score-button")
    ?.addEventListener("click", () => {
      score += 1;
      render();
    });
}

render();`,
      },

      "/styles.css": {
        code: sharedStyles,
      },
    },
  },

  typescript: {
    id: "typescript",
    label: "TypeScript",
    description: "Vanilla TypeScript project",
    template: "vanilla-ts",
    activeFile: "/index.ts",
    visibleFiles: [
      "/index.ts",
      "/index.html",
      "/styles.css",
    ],
    files: {
      "/index.html": {
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>TypeScript Playground</title>
  </head>

  <body>
    <div id="app"></div>

    <script
      type="module"
      src="/index.ts"
    ></script>
  </body>
</html>`,
      },

      "/index.ts": {
        active: true,
        code: `import "./styles.css";

interface Quest {
  title: string;
  xp: number;
}

const quest: Quest = {
  title: "Learn TypeScript",
  xp: 50,
};

const app =
  document.querySelector<HTMLDivElement>(
    "#app",
  );

if (!app) {
  throw new Error("App element not found");
}

app.innerHTML = \`
  <div class="card">
    <h1>\${quest.title}</h1>

    <p>Reward: \${quest.xp} XP</p>

    <button id="complete-button">
      Complete quest
    </button>
  </div>
\`;`,
      },

      "/styles.css": {
        code: sharedStyles,
      },
    },
  },

  react: {
    id: "react",
    label: "React",
    description: "React with JavaScript",
    template: "react",
    activeFile: "/App.js",
    visibleFiles: [
      "/App.js",
      "/styles.css",
    ],
    files: {
      "/App.js": {
        active: true,
        code: `import { useState } from "react";

import "./styles.css";

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <main>
      <div className="card">
        <h1>React Playground</h1>

        <p>Score: {score}</p>

        <button
          onClick={() => {
            setScore((current) => current + 1);
          }}
        >
          Earn point
        </button>
      </div>
    </main>
  );
}`,
      },

      "/styles.css": {
        code: sharedStyles,
      },
    },
  },

  "react-typescript": {
    id: "react-typescript",
    label: "React + TypeScript",
    description: "Typed React components",
    template: "react-ts",
    activeFile: "/App.tsx",
    visibleFiles: [
      "/App.tsx",
      "/styles.css",
    ],
    files: {
      "/App.tsx": {
        active: true,
        code: `import {
  useState,
} from "react";

import "./styles.css";

interface Quest {
  title: string;
  reward: number;
}

const quest: Quest = {
  title: "React TypeScript Quest",
  reward: 75,
};

export default function App() {
  const [completed, setCompleted] =
    useState<boolean>(false);

  return (
    <main>
      <div className="card">
        <h1>{quest.title}</h1>

        <p>
          Reward: {quest.reward} XP
        </p>

        <button
          onClick={() => {
            setCompleted(true);
          }}
        >
          {completed
            ? "Completed"
            : "Complete quest"}
        </button>
      </div>
    </main>
  );
}`,
      },

      "/styles.css": {
        code: sharedStyles,
      },
    },
  },
"react-tailwind": {
  id: "react-tailwind",
  label: "React + Tailwind",
  description: "React with Tailwind CSS",
  template: "react",
  activeFile: "/App.js",

  visibleFiles: [
    "/App.js",
    "/public/index.html",
  ],

  externalResources: [
    "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
  ],

  files: {
    "/public/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>
      React Tailwind Playground
    </title>
  </head>

  <body>
    <div id="root"></div>
  </body>
</html>`,
    },

    "/App.js": {
      active: true,
      code: `import {
  useState,
} from "react";

export default function App() {
  const [level, setLevel] =
    useState(1);

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-950 p-6 text-white">
      <section className="w-full max-w-xl border-2 border-yellow-400 bg-neutral-900 p-8 shadow-[6px_6px_0_#ff8c00]">
        <p className="text-sm uppercase tracking-widest text-white/50">
          Code Quest
        </p>

        <h1 className="mt-2 text-4xl font-bold text-yellow-400">
          React + Tailwind
        </h1>

        <p className="mt-4 text-lg text-white/70">
          Current level: {level}
        </p>

        <button
          type="button"
          onClick={() => {
            setLevel(
              (current) =>
                current + 1,
            );
          }}
          className="mt-6 cursor-pointer bg-yellow-400 px-5 py-3 font-bold text-black shadow-[4px_4px_0_#ff8c00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-[2px_2px_0_#ff8c00] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Level up
        </button>
      </section>
    </main>
  );
}`,
    },
  },
},
}

export const playgroundPresetIds: PlaygroundPresetId[] = [
  "html",
  "javascript",
  "typescript",
  "react",
  "react-typescript",
  "react-tailwind",
];