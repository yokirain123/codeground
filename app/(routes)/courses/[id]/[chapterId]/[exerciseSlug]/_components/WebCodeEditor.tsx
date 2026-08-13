"use client";

import { useEffect, useMemo, useState } from "react";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { autocompletion } from "@codemirror/autocomplete";
import { Group, Panel, Separator } from "react-resizable-panels";

import { codeQuestSandpackTheme } from "@/app/sandpack/sandpackTheme";

import CompleteExerciseButton from "./CompleteExerciseButton";
import type { ExerciseData } from "./types";
import { useExerciseCompletion } from "./useExerciseCompletion";

interface WebCodeEditorProps {
  exerciseTitle: string;
  exercise: ExerciseData;
  onCompletionChange?: (isCompleted: boolean) => void;
}

interface EditorActionsProps {
  completeExercise: (files: Record<string, string>) => Promise<void>;
  isChecking: boolean;
  isCompleting: boolean;
  isCompleted: boolean;
}

type PanelOrientation = "horizontal" | "vertical";

function normalizeFilename(filename: string) {
  return filename.startsWith("/") ? filename : `/${filename}`;
}

function usePanelOrientation(): PanelOrientation {
  const [orientation, setOrientation] =
    useState<PanelOrientation>("horizontal");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setOrientation(media.matches ? "vertical" : "horizontal");

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return orientation;
}

function EditorActions({
  completeExercise,
  isChecking,
  isCompleting,
  isCompleted,
}: EditorActionsProps) {
  const { sandpack } = useSandpack();

  return (
    <footer className="flex shrink-0 justify-end border-t border-[#899DFF]/25 bg-[#10152A] px-4 py-3">
      <CompleteExerciseButton
        isChecking={isChecking}
        isCompleting={isCompleting}
        isCompleted={isCompleted}
        onClick={() => {
          const files = Object.fromEntries(
            Object.entries(sandpack.files).map(([filename, file]) => [
              filename,
              file.code,
            ]),
          );

          void completeExercise(files);
        }}
      />
    </footer>
  );
}

export default function WebCodeEditor({
  exerciseTitle,
  exercise,
  onCompletionChange,
}: WebCodeEditorProps) {
  const panelOrientation = usePanelOrientation();
  const { completeExercise, isChecking, isCompleting, isCompleted } =
    useExerciseCompletion(onCompletionChange);

  const files = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(exercise.starterCode).map(([filename, code]) => [
          normalizeFilename(filename),
          code,
        ]),
      ),
    [exercise.starterCode],
  );

  const visibleFiles = useMemo(() => Object.keys(files), [files]);
  const isReactExercise = visibleFiles.some((filename) =>
    /\/(?:App|index)\.(?:jsx?|tsx?)$/i.test(filename),
  );

  const activeFile =
    visibleFiles.find((filename) => /\/App\.(?:jsx?|tsx?)$/i.test(filename)) ??
    visibleFiles.find((filename) => /\/index\.html$/i.test(filename)) ??
    visibleFiles[0];

  return (
    <div
      role="region"
      aria-label={`${exerciseTitle} code playground`}
      className="h-full min-h-0 w-full overflow-hidden bg-[#07080C]"
    >
      <SandpackProvider
  key={exercise.id}
  template={isReactExercise ? "react" : "static"}
  theme={codeQuestSandpackTheme}
  files={files}
  className="h-full min-h-0 w-full overflow-hidden"
  style={{
    width: "100%",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
  }}
  options={{
    activeFile,
    visibleFiles,
    autorun: true,
    autoReload: true,
    recompileMode: "immediate",
  }}
>
  <SandpackLayout
    className="h-full min-h-0 w-full overflow-hidden"
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
      key={panelOrientation}
      orientation={panelOrientation}
      className="h-full min-h-0 w-full"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
      }}
    >
            <Panel
  id="web-editor-panel"
  defaultSize="50%"
  minSize="20%"
  maxSize="80%"
  className="h-full min-h-0 min-w-0 overflow-hidden"
>
              <div className="flex h-full min-h-0 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-hidden">
                  <SandpackCodeEditor
                    extensions={[autocompletion({ activateOnTyping: true })]}
                    initMode="immediate"
                    showTabs={visibleFiles.length > 1}
                    showLineNumbers
                    showInlineErrors
                    wrapContent={false}
                    style={{ width: "100%", height: "100%", minHeight: 0 }}
                  />
                </div>

                <EditorActions
                  completeExercise={completeExercise}
                  isChecking={isChecking}
                  isCompleting={isCompleting}
                  isCompleted={isCompleted}
                />
              </div>
            </Panel>

            <Separator
              className={`relative z-20 shrink-0 bg-[#899DFF]/30 transition-colors hover:bg-[#FFD400] focus:bg-[#FFD400] focus:outline-none ${
                panelOrientation === "vertical"
                  ? "h-1 w-full cursor-row-resize"
                  : "h-full w-1 cursor-col-resize"
              }`}
            />

            <Panel
  id="web-preview-panel"
  defaultSize="50%"
  minSize="20%"
  maxSize="80%"
  className="h-full min-h-0 min-w-0 overflow-hidden"
>
              <SandpackPreview
                showNavigator={false}
                showOpenInCodeSandbox={false}
                showRefreshButton={false}
                style={{ width: "100%", height: "100%", minHeight: 0 }}
              />
            </Panel>
          </Group>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
