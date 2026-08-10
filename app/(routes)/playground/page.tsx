"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/shadcn/alert-dialog";

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
  ChevronDown,
  Code2,
  Play,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";

import { codeQuestSandpackTheme } from "@/app/sandpack/sandpackTheme";

import {
  playgroundPresetIds,
  playgroundPresets,
  type PlaygroundPresetId,
} from "./_components/playgroundTemplates";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  onOpenChange: (
    open: boolean,
  ) => void;
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="border-2 border-accent bg-card shadow-[6px_6px_0_0_#FF8C00] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl text-accent">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-lg text-foreground/70">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-3 sm:gap-3">
          <AlertDialogCancel className="h-10 cursor-pointer border border-accent bg-transparent px-5 text-lg text-accent hover:bg-accent/10 hover:text-accent">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="group relative h-10 cursor-pointer overflow-hidden border bg-accent px-5 text-lg text-black shadow-[3px_3px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-px hover:translate-y-px hover:bg-accent hover:shadow-[1px_1px_0_0_#FF8C00]"
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
            />

            <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
              {confirmText}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface PlaygroundToolbarProps {
  presetId: PlaygroundPresetId;
  onPresetChange: (
    presetId: PlaygroundPresetId,
  ) => void;
}

function PlaygroundToolbar({
  presetId,
  onPresetChange,
}: PlaygroundToolbarProps) {
  const { sandpack } = useSandpack();

  const [
    isResetDialogOpen,
    setIsResetDialogOpen,
  ] = useState(false);

  const preset =
    playgroundPresets[presetId];

  const resetCode = () => {
    sandpack.resetAllFiles();
    setIsResetDialogOpen(false);
  };

  const runCode = () => {
    void sandpack.runSandpack();
  };

  return (
    <>
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden size-10 shrink-0 items-center justify-center border border-accent text-accent sm:flex">
            <Code2 className="size-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-2xl text-accent md:text-3xl">
              Code Playground
            </h1>

            <p className="truncate text-sm text-foreground/50">
              {preset.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <label
              htmlFor="playground-preset"
              className="sr-only"
            >
              Playground type
            </label>

            <select
              id="playground-preset"
              value={presetId}
              onChange={(event) => {
                onPresetChange(
                  event.target
                    .value as PlaygroundPresetId,
                );
              }}
              className="h-9 min-w-52 cursor-pointer appearance-none border border-accent bg-background py-1 pr-10 pl-3 text-base text-accent outline-none transition-colors hover:bg-accent/10 focus:ring-2 focus:ring-accent/40"
            >
              {playgroundPresetIds.map(
                (currentPresetId) => {
                  const currentPreset =
                    playgroundPresets[
                      currentPresetId
                    ];

                  return (
                    <option
                      key={
                        currentPreset.id
                      }
                      value={
                        currentPreset.id
                      }
                      className="bg-card text-foreground"
                    >
                      {
                        currentPreset.label
                      }
                    </option>
                  );
                },
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-accent" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsResetDialogOpen(
                true,
              );
            }}
            className="h-9 cursor-pointer border-accent px-3 text-base text-accent hover:bg-accent hover:text-black"
          >
            <RotateCcw className="size-4" />

            <span className="hidden sm:inline">
              Reset
            </span>
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={runCode}
            className="group relative h-9 cursor-pointer overflow-hidden border bg-accent px-4 text-base text-black shadow-[3px_3px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-px hover:translate-y-px hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
            />

            <span className="relative z-10 flex items-center gap-2 transition-colors duration-500 group-hover:text-white">
              <Play className="size-4" />

              Run code
            </span>
          </Button>
        </div>
      </header>

      <ConfirmDialog
        open={isResetDialogOpen}
        title="Reset playground?"
        description="All your changes will be replaced with the original starter code. This action cannot be undone."
        confirmText="Reset code"
        onConfirm={resetCode}
        onOpenChange={
          setIsResetDialogOpen
        }
      />
    </>
  );
}

export default function PlaygroundPage() {
  const [
    presetId,
    setPresetId,
  ] =
    useState<PlaygroundPresetId>(
      "html",
    );

  const [
    pendingPresetId,
    setPendingPresetId,
  ] =
    useState<PlaygroundPresetId | null>(
      null,
    );

  const preset =
    playgroundPresets[presetId];

  const requestPresetChange = (
    nextPresetId: PlaygroundPresetId,
  ) => {
    if (nextPresetId === presetId) {
      return;
    }

    setPendingPresetId(
      nextPresetId,
    );
  };

  const confirmPresetChange = () => {
    if (!pendingPresetId) {
      return;
    }

    setPresetId(pendingPresetId);
    setPendingPresetId(null);
  };

  const handlePresetDialogChange = (
    open: boolean,
  ) => {
    if (!open) {
      setPendingPresetId(null);
    }
  };

  return (
    <main className="h-[calc(100dvh-64px)] min-h-0 w-full overflow-hidden">
      <SandpackProvider
  key={preset.id}
  className="codequest-sandpack h-full min-h-0"
  style={{
    height: "100%",
    minHeight: 0,
  }}
  template={preset.template}
  theme={codeQuestSandpackTheme}
  files={preset.files}
  options={{
    activeFile:
      preset.activeFile,

    visibleFiles:
      preset.visibleFiles,

    externalResources:
      preset.externalResources ??
      [],

    autorun: true,
    autoReload: true,
    recompileMode:
      "immediate",
  }}
>
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <PlaygroundToolbar
            presetId={presetId}
            onPresetChange={
              requestPresetChange
            }
          />

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
                      autocompletion(
                        {
                          activateOnTyping:
                            true,
                        },
                      ),
                    ]}
                    initMode="immediate"
                    showTabs={
                      preset
                        .visibleFiles
                        .length > 1
                    }
                    showLineNumbers
                    showInlineErrors
                    wrapContent={
                      false
                    }
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
                    showNavigator={
                      false
                    }
                    showOpenInCodeSandbox={
                      false
                    }
                    showRefreshButton={
                      false
                    }
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

      <ConfirmDialog
        open={
          pendingPresetId !== null
        }
        title="Change playground?"
        description="Changing the playground type will reset your current code. This action cannot be undone."
        confirmText="Change template"
        onConfirm={
          confirmPresetChange
        }
        onOpenChange={
          handlePresetDialogChange
        }
      />
    </main>
  );
}