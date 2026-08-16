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
import { RotateCcw } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { codeQuestSandpackTheme } from "@/app/sandpack/sandpackTheme";
import { Button } from "@/components/ui/shadcn/button";
import { getChallengeDraftKey } from "@/lib/challenges/draft";
import type { ChallengeDefinition } from "@/lib/challenges/types";

import ChallengeSubmitButton from "./ChallengeSubmitButton";
import { useChallengeCompletion } from "./useChallengeCompletion";

interface WebChallengeEditorProps {
  challenge: ChallengeDefinition;
  initialCompleted: boolean;
  onCompletionChange: (isCompleted: boolean) => void;
}

interface EditorControlsProps {
  slug: string;
  starterFiles: Record<string, string>;
  isSubmitting: boolean;
  isCompleted: boolean;
  onSubmit: (files: Record<string, string>) => void;
}

type EditorOrientation = "horizontal" | "vertical";

function normalizeFilename(filename: string) {
  return filename.startsWith("/") ? filename : `/${filename}`;
}

function normalizeFiles(files: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(files).map(([filename, code]) => [
      normalizeFilename(filename),
      code,
    ]),
  );
}

function comparableFiles(files: Record<string, string>) {
  return JSON.stringify(
    Object.entries(normalizeFiles(files)).sort(([first], [second]) =>
      first.localeCompare(second),
    ),
  );
}

function useEditorOrientation(): EditorOrientation {
  const [orientation, setOrientation] =
    useState<EditorOrientation>("horizontal");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () =>
      setOrientation(media.matches ? "vertical" : "horizontal");

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return orientation;
}

function EditorControls({
  slug,
  starterFiles,
  isSubmitting,
  isCompleted,
  onSubmit,
}: EditorControlsProps) {
  const { sandpack } = useSandpack();
  const starterComparison = useMemo(
    () => comparableFiles(starterFiles),
    [starterFiles],
  );

  const currentFiles = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(sandpack.files).map(([filename, file]) => [
          filename,
          file.code,
        ]),
      ),
    [sandpack.files],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const draftKey = getChallengeDraftKey(slug);

      if (isCompleted || comparableFiles(currentFiles) === starterComparison) {
        localStorage.removeItem(draftKey);
        return;
      }

      localStorage.setItem(draftKey, JSON.stringify({ files: currentFiles }));
    }, 450);

    return () => window.clearTimeout(timer);
  }, [currentFiles, isCompleted, slug, starterComparison]);

  const resetFiles = () => {
    for (const [filename, code] of Object.entries(starterFiles)) {
      sandpack.updateFile(normalizeFilename(filename), code);
    }

    localStorage.removeItem(getChallengeDraftKey(slug));
  };

  return (
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#899DFF]/25 bg-[#10152A] px-4 py-3">
      <p className="hidden font-pixel text-xs text-white/30 sm:block">
        Draft saved automatically
      </p>

      <div className="ml-auto flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={resetFiles}
          disabled={isSubmitting}
          className="h-10 cursor-pointer rounded-none border-[#899DFF] bg-transparent px-4 font-pixel text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C]"
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>

        <ChallengeSubmitButton
          isSubmitting={isSubmitting}
          isCompleted={isCompleted}
          onClick={() => onSubmit(currentFiles)}
        />
      </div>
    </footer>
  );
}

function readInitialFiles(challenge: ChallengeDefinition) {
  const starterFiles = normalizeFiles(challenge.starterCode);

  try {
    const rawDraft = localStorage.getItem(getChallengeDraftKey(challenge.slug));

    if (!rawDraft) {
      return starterFiles;
    }

    const draft = JSON.parse(rawDraft) as {
      files?: Record<string, unknown>;
    };

    if (!draft.files || typeof draft.files !== "object") {
      return starterFiles;
    }

    const draftFiles = Object.fromEntries(
      Object.entries(draft.files)
        .filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        )
        .map(([filename, code]) => [normalizeFilename(filename), code]),
    );

    return {
      ...starterFiles,
      ...draftFiles,
    };
  } catch {
    localStorage.removeItem(getChallengeDraftKey(challenge.slug));
    return starterFiles;
  }
}

export default function WebChallengeEditor({
  challenge,
  initialCompleted,
  onCompletionChange,
}: WebChallengeEditorProps) {
  const orientation = useEditorOrientation();
  const [initialFiles, setInitialFiles] = useState<Record<
    string,
    string
  > | null>(null);
  const { completeChallenge, isSubmitting, isCompleted } =
    useChallengeCompletion({
      slug: challenge.slug,
      initialCompleted,
      onCompletionChange,
    });

  const starterFiles = useMemo(
    () => normalizeFiles(challenge.starterCode),
    [challenge.starterCode],
  );

  useEffect(() => {
    setInitialFiles(readInitialFiles(challenge));
  }, [challenge]);

  if (!initialFiles) {
    return (
      <div className="grid h-full place-items-center bg-[#07080C] font-pixel text-sm text-[#899DFF]">
        Loading editor...
      </div>
    );
  }

  const visibleFiles = Object.keys(initialFiles);
  const activeFile =
    visibleFiles.find((filename) => /\/App\.(?:jsx?|tsx?)$/i.test(filename)) ??
    visibleFiles.find((filename) => /\/index\.html$/i.test(filename)) ??
    visibleFiles[0];

  return (
    <div
      role="region"
      aria-label={`${challenge.title} code editor`}
      className="h-full min-h-0 w-full overflow-hidden bg-[#07080C]"
    >
      <SandpackProvider
        key={challenge.slug}
        template={challenge.environment === "react" ? "react" : "static"}
        theme={codeQuestSandpackTheme}
        files={initialFiles}
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
            key={orientation}
            orientation={orientation}
            className="h-full min-h-0 w-full"
            style={{ width: "100%", height: "100%", minHeight: 0 }}
          >
            <Panel
              id="challenge-code-panel"
              defaultSize="52%"
              minSize="25%"
              maxSize="80%"
              className="min-h-0 min-w-0 overflow-hidden"
            >
              <div className="flex h-full min-h-0 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-hidden [&_.sp-stack]:h-full [&_.sp-stack]:min-h-0 [&_.sp-code-editor]:min-h-0 [&_.sp-code-editor]:overflow-hidden [&_.cm-editor]:h-full [&_.cm-editor]:min-h-0 [&_.cm-scroller]:overflow-auto [&_.cm-scroller]:overscroll-contain">
                  <SandpackCodeEditor
                    className="h-full min-h-0"
                    extensions={[autocompletion({ activateOnTyping: true })]}
                    initMode="immediate"
                    showTabs={visibleFiles.length > 1}
                    showLineNumbers
                    showInlineErrors
                    wrapContent={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: 0,
                    }}
                  />
                </div>

                <EditorControls
                  slug={challenge.slug}
                  starterFiles={starterFiles}
                  isSubmitting={isSubmitting}
                  isCompleted={isCompleted}
                  onSubmit={(files) => {
                    void completeChallenge(files);
                  }}
                />
              </div>
            </Panel>

            <Separator
              className={`relative z-20 shrink-0 bg-[#899DFF]/30 transition-colors hover:bg-[#FFD400] focus:bg-[#FFD400] focus:outline-none ${
                orientation === "vertical"
                  ? "h-1 w-full cursor-row-resize"
                  : "h-full w-1 cursor-col-resize"
              }`}
            />

            <Panel
              id="challenge-preview-panel"
              defaultSize="48%"
              minSize="20%"
              maxSize="75%"
              className="min-h-0 min-w-0 overflow-hidden"
            >
              <SandpackPreview
                className="h-full min-h-0"
                showNavigator={false}
                showOpenInCodeSandbox={false}
                showRefreshButton={false}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 0,
                }}
              />
            </Panel>
          </Group>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
