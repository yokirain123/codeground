"use client";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";

import { autocompletion } from "@codemirror/autocomplete";

import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

import {
  Play,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";

import { codeQuestSandpackTheme } from "@/app/sandpack/sandpackTheme";

const playgroundFiles = {
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
    <!-- Start coding here -->

    <script src="/script.js"></script>
  </body>
</html>`,
  },

  "/styles.css": {
    code: `/* Add your styles here */`,
  },

  "/script.js": {
    code: `// Add your JavaScript here`,
  },
};

function PlaygroundToolbar() {
  const { sandpack } = useSandpack();

  const resetCode = () => {
    sandpack.resetAllFiles();
  };

  const runCode = () => {
    void sandpack.runSandpack();
  };

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-5 py-3">
      <div>
        <p className="text-sm uppercase text-foreground/40">
          HTML · CSS · JavaScript
        </p>

        <h1 className="text-2xl text-accent md:text-3xl">
          Code Playground
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={resetCode}
          className="h-8 border-accent px-3 text-base text-accent hover:bg-accent hover:text-black"
        >
          <RotateCcw className="size-4" />

          Reset
        </Button>

        <Button
          type="button"
          variant="default"
          onClick={runCode}
          className="group relative h-8 cursor-pointer overflow-hidden border bg-accent px-4 text-base text-black shadow-[3px_3px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-px hover:translate-y-px hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          <span
            aria-hidden="true"
            className="absolute top-full left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
          />

          <span className="relative z-10 flex items-center gap-2 transition-colors duration-500 group-hover:text-white">
            <Play className="size-4" />

            Run code
          </span>
        </Button>
      </div>
    </header>
  );
}

export default function PlaygroundPage() {
  const visibleFiles = [
    "/index.html",
    "/styles.css",
    "/script.js",
  ];

  return (
    <main className="h-[calc(100dvh-64px)] min-h-0 overflow-hidden bg-background">
      <SandpackProvider
        template="static"
        theme={codeQuestSandpackTheme}
        files={playgroundFiles}
        className="codequest-sandpack"
        style={{
          height: "100%",
          minHeight: 0,
        }}
        options={{
          activeFile: "/index.html",
          visibleFiles,
          autorun: true,
          autoReload: true,
          recompileMode: "immediate",
        }}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <PlaygroundToolbar />

          <div className="min-h-0 flex-1 overflow-hidden">
            <SandpackLayout
              className="h-full min-h-0"
              style={{
                width: "100%",
                height: "100%",
                minHeight: 0,
                border: 0,
                borderRadius: 0,
                overflow: "hidden",
              }}
            >
              <Group
                orientation="horizontal"
                className="h-full min-h-0 w-full"
                style={{
                  height: "100%",
                }}
              >
                <Panel
                  id="playground-editor"
                  defaultSize="50%"
                  minSize="20%"
                  maxSize="80%"
                  className="h-full min-h-0 min-w-0 overflow-hidden"
                >
                  <SandpackCodeEditor
                    extensions={[
                      autocompletion({
                        activateOnTyping: true,
                      }),
                    ]}
                    initMode="immediate"
                    showTabs
                    showLineNumbers
                    showInlineErrors
                    wrapContent={false}
                    className="h-full min-h-0"
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: 0,
                    }}
                  />
                </Panel>

                <Separator className="relative z-20 w-1 shrink-0 cursor-col-resize bg-border transition-colors duration-200 hover:bg-accent focus:bg-accent focus:outline-none" />

                <Panel
                  id="playground-preview"
                  defaultSize="50%"
                  minSize="20%"
                  maxSize="80%"
                  className="h-full min-h-0 min-w-0 overflow-hidden"
                >
                  <SandpackPreview
                    showNavigator={false}
                    showOpenInCodeSandbox={false}
                    showRefreshButton={false}
                    className="h-full min-h-0"
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: 0,
                    }}
                  />
                </Panel>
              </Group>
            </SandpackLayout>
          </div>
        </div>
      </SandpackProvider>
    </main>
  );
}