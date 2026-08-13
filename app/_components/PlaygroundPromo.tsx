"use client";

import { useState } from "react";

import Link from "next/link";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

import { ArrowRight, ChevronDown, Code2 } from "lucide-react";

import { codeQuestSandpackTheme } from "@/app/sandpack/sandpackTheme";
import { Button } from "@/components/ui/shadcn/button";

type DemoId = "html" | "react" | "react-tailwind";

const demos = {
  html: {
    label: "HTML + CSS",
    template: "static" as const,
    activeFile: "/index.html",
    visibleFiles: ["/index.html"],
    externalResources: [] as string[],
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

    <title>CodeQuest Demo</title>

    <style>
      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #07080c;
        color: white;
        font-family: system-ui, sans-serif;
      }

      .quest {
        width: min(88%, 520px);
        border: 2px solid rgba(137, 157, 255, 0.7);
        background: #10152a;
        padding: 28px;
        box-shadow: 6px 6px 0 #020307;
      }

      .eyebrow {
        color: #899dff;
        letter-spacing: 0.2em;
      }

      h1 { color: #ffd400; }
      .quest p:last-child { color: rgba(255, 255, 255, 0.62); }
    </style>
  </head>

  <body>
    <section class="quest">
      <p class="eyebrow">YOUR FIRST QUEST</p>
      <h1>Build something awesome</h1>
      <p>Learn by creating real projects.</p>
    </section>
  </body>
</html>`,
      },
    },
  },

  react: {
    label: "React",
    template: "react" as const,
    activeFile: "/App.js",
    visibleFiles: ["/App.js"],
    externalResources: [] as string[],
    files: {
      "/App.js": {
        code: `import "./styles.css";

export default function App() {
  const quests = [
    "Learn components",
    "Manage state",
    "Build a project",
  ];

  return (
    <main>
      <section className="quest-card">
        <p className="eyebrow">REACT PATH</p>
        <h1>Choose your next quest</h1>

        {quests.map((quest, index) => (
          <div className="quest" key={quest}>
            <span>{index + 1}</span>
            {quest}
          </div>
        ))}
      </section>
    </main>
  );
}`,
      },

      "/styles.css": {
        hidden: true,
        code: `* { box-sizing: border-box; }

body {
  margin: 0;
  background: #07080c;
  color: white;
  font-family: system-ui, sans-serif;
}

main {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.quest-card {
  width: min(100%, 520px);
  border: 2px solid rgba(137, 157, 255, 0.7);
  background: #10152a;
  padding: 28px;
  box-shadow: 6px 6px 0 #020307;
}

.eyebrow {
  color: #899dff;
  letter-spacing: 0.2em;
}

h1 { color: #ffd400; }

.quest {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
}

.quest span { color: #ffd400; }`,
      },
    },
  },

  "react-tailwind": {
    label: "React + Tailwind",
    template: "react" as const,
    activeFile: "/App.js",
    visibleFiles: ["/App.js"],
    externalResources: ["https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"],
    files: {
      "/App.js": {
        code: `export default function App() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#07080C] p-6 text-white">
      <section className="w-full max-w-lg border-2 border-[#899DFF]/70 bg-[#10152A] p-8 shadow-[6px_6px_0_#020307]">
        <p className="text-sm tracking-[0.25em] text-[#899DFF]">
          TAILWIND QUEST
        </p>

        <h1 className="mt-3 text-4xl font-bold text-[#FFD400]">
          Style at light speed
        </h1>

        <p className="mt-4 text-lg text-white/60">
          Build responsive interfaces directly with utility classes.
        </p>

        <button className="mt-6 border-2 border-black bg-[#FFD400] px-5 py-3 font-bold text-black shadow-[4px_4px_0_#FF8C00]">
          Start quest
        </button>
      </section>
    </main>
  );
}`,
      },
    },
  },
} as const;

export default function PlaygroundPromo() {
  const [demoId, setDemoId] = useState<DemoId>("html");

  const demo = demos[demoId];

  return (
    <section className="relative px-6 py-20 text-white md:px-10 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-pixel text-sm uppercase tracking-[0.3em] text-[#899DFF]">
              Live preview
            </p>

            <h2 className="mt-3 font-pixel text-4xl text-white [text-shadow:4px_4px_0_#28336B] md:text-6xl">
              Try the{" "}
              <span className="text-[#FFD400] [text-shadow:4px_4px_0_#FF8C00]">
                Playground
              </span>
            </h2>

            <p className="mt-5 font-sans text-lg text-white/60 md:text-xl">
              Explore real code and see the result instantly. Open the full
              playground when you are ready to build your own project.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <label htmlFor="promo-demo" className="sr-only">
                Demo technology
              </label>

              <select
                id="promo-demo"
                value={demoId}
                onChange={(event) => {
                  setDemoId(event.target.value as DemoId);
                }}
                className="h-11 min-w-52 cursor-pointer appearance-none border border-[#899DFF]/45 bg-[#10152A] py-2 pr-10 pl-4 font-pixel text-lg text-white outline-none transition-colors hover:border-[#FFD400]/70 focus:ring-2 focus:ring-[#899DFF]/40"
              >
                {(Object.keys(demos) as DemoId[]).map((id) => (
                  <option
                    key={id}
                    value={id}
                    className="bg-[#10152A] text-white"
                  >
                    {demos[id].label}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#FFD400]" />
            </div>

            <Button className="group relative h-11 cursor-pointer overflow-hidden border-2 border-black bg-[#FFD400] px-5 text-lg text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#FFD400] hover:shadow-[2px_2px_0_0_#FF8C00]">
              <Link href="/playground">
                <span
                  aria-hidden="true"
                  className="absolute top-full left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#FF8C00] transition-transform duration-700 group-hover:scale-[18]"
                />

                <span className="relative z-10 flex items-center gap-2 transition-colors duration-500 group-hover:text-white">
                  Open full playground
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-2 border-[#899DFF]/45 bg-[#10152A] shadow-[8px_8px_0_0_#020307]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <Code2 className="size-5 text-[#899DFF]" />
              <span className="font-pixel text-lg text-white">
                {demo.label} demo
              </span>
            </div>

            <span className="border border-white/10 bg-black/20 px-2 py-1 font-pixel text-sm uppercase text-white/40">
              Read only
            </span>
          </div>

          <SandpackProvider
            key={demoId}
            template={demo.template}
            theme={codeQuestSandpackTheme}
            files={demo.files}
            options={{
              activeFile: demo.activeFile,
              visibleFiles: [...demo.visibleFiles],
              externalResources: [...demo.externalResources],
              autorun: true,
              autoReload: true,
              recompileMode: "immediate",
            }}
          >
            <SandpackLayout
              style={{
                width: "100%",
                height: "420px",
                minHeight: 0,
                border: 0,
                borderRadius: 0,
              }}
            >
              <SandpackCodeEditor
                readOnly
                showReadOnly={false}
                showTabs={false}
                showLineNumbers
                showInlineErrors={false}
                wrapContent
                style={{
                  height: "100%",
                  minHeight: 0,
                }}
              />

              <SandpackPreview
                showNavigator={false}
                showRefreshButton={false}
                showOpenInCodeSandbox={false}
                style={{
                  height: "100%",
                  minHeight: 0,
                }}
              />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </section>
  );
}
