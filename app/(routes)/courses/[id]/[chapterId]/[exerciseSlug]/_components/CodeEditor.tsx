"use client";

import { useMemo } from "react";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

import {
  autocompletion,
} from "@codemirror/autocomplete";

import { codeQuestSandpackTheme } from "@/app/sandpack/sandpackTheme";

import {
  ACTIVE_FILE,
  createStarterFiles,
} from "@/app/sandpack/starterCode";

import type { ExerciseData } from "./types";

interface CodeEditorProps {
  exerciseTitle: string;
  exercise: ExerciseData;
}

const PLAYGROUND_HEIGHT =
  "calc(100dvh - 64px)";

export default function CodeEditor({
  exerciseTitle,
  exercise,
}: CodeEditorProps) {
  const files = useMemo(
    () =>
      createStarterFiles(
        exercise.starterCode,
      ),
    [exercise.starterCode],
  );

  const visibleFiles = useMemo(
    () => Object.keys(files),
    [files],
  );

  return (
    <div
      role="region"
      aria-label={`${exerciseTitle} code playground`}
      className="h-[calc(100dvh-64px)] min-h-0 w-full overflow-hidden"
    >
      <SandpackProvider
        key={exercise.id}
        template="static"
        theme={codeQuestSandpackTheme}
        files={files}
        options={{
          activeFile: ACTIVE_FILE,
          visibleFiles,
          autorun: true,
          autoReload: true,
          recompileMode:
            "immediate",
        }}
      >
        <SandpackLayout
          style={{
            width: "100%",
            height: PLAYGROUND_HEIGHT,
            minHeight: 0,
            border: 0,
            borderRadius: 0,
          }}
        >
          <SandpackCodeEditor
            extensions={[
              autocompletion({
                activateOnTyping: true,
              }),
            ]}
            initMode="immediate"
            showTabs={
              visibleFiles.length > 1
            }
            showLineNumbers
            showInlineErrors
            wrapContent={false}
            style={{
              height: "100%",
              minHeight: 0,
            }}
          />

          <SandpackPreview
            showNavigator={false}
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{
              height: "100%",
              minHeight: 0,
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}