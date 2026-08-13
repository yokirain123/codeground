"use client";

import { useEffect, useState } from "react";

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

import { Group, Panel, Separator } from "react-resizable-panels";

import { ChevronDown, Code2, Play, RotateCcw } from "lucide-react";

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
  onOpenChange: (open: boolean) => void;
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-none border-2 border-[#899DFF] bg-[#10152A] text-white shadow-[6px_6px_0_0_#020307] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-pixel text-3xl text-[#FFD400]">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-lg text-white/65">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-3 sm:gap-3">
          <AlertDialogCancel className="h-10 cursor-pointer rounded-none border border-[#899DFF] bg-transparent px-5 font-pixel text-lg text-[#AAB6FF] hover:bg-[#899DFF]/15 hover:text-white">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="group relative h-10 cursor-pointer overflow-hidden rounded-none border-2 border-[#FFD400] bg-[#FFD400] px-5 font-pixel text-lg text-[#07080C] shadow-[3px_3px_0_0_#899DFF] transition-all duration-300 hover:translate-x-px hover:translate-y-px hover:bg-[#FFD400] hover:shadow-[1px_1px_0_0_#899DFF] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#899DFF] transition-transform duration-700 ease-out group-hover:scale-[18]"
            />

            <span className="relative z-10 transition-colors duration-500 group-hover:text-[#07080C]">
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
  onPresetChange: (presetId: PlaygroundPresetId) => void;
}

type PanelOrientation = "horizontal" | "vertical";

function usePanelOrientation(): PanelOrientation {
  const [orientation, setOrientation] =
    useState<PanelOrientation>("horizontal");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateOrientation = () => {
      setOrientation(mediaQuery.matches ? "vertical" : "horizontal");
    };

    updateOrientation();
    mediaQuery.addEventListener("change", updateOrientation);

    return () => {
      mediaQuery.removeEventListener("change", updateOrientation);
    };
  }, []);

  return orientation;
}

function PlaygroundToolbar({
  presetId,
  onPresetChange,
}: PlaygroundToolbarProps) {
  const { sandpack } = useSandpack();

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const preset = playgroundPresets[presetId];

  const resetCode = () => {
    sandpack.resetAllFiles();
    setIsResetDialogOpen(false);
  };

  const runCode = () => {
    void sandpack.runSandpack();
  };

  return (
    <>
      <header className="flex shrink-0 flex-col gap-3 border-b border-[#899DFF]/25 bg-[#10152A] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="hidden size-10 shrink-0 items-center justify-center border-2 border-[#899DFF] bg-[#07080C] text-[#FFD400] shadow-[3px_3px_0_0_#020307] sm:flex">
            <Code2 className="size-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate font-pixel text-2xl text-[#FFD400] md:text-3xl">
              Code Playground
            </h1>

            <p className="truncate text-sm text-white/50">
              {preset.description}
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 sm:w-auto">
          <div className="relative min-w-0">
            <label htmlFor="playground-preset" className="sr-only">
              Playground type
            </label>

            <select
              id="playground-preset"
              value={presetId}
              onChange={(event) => {
                onPresetChange(event.target.value as PlaygroundPresetId);
              }}
              className="h-9 w-full min-w-0 cursor-pointer appearance-none rounded-none border border-[#899DFF] bg-[#07080C] py-1 pr-10 pl-3 font-pixel text-base text-white outline-none transition-colors hover:bg-[#899DFF]/10 focus:ring-2 focus:ring-[#FFD400]/50 sm:min-w-52"
            >
              {playgroundPresetIds.map((currentPresetId) => {
                const currentPreset = playgroundPresets[currentPresetId];

                return (
                  <option
                    key={currentPreset.id}
                    value={currentPreset.id}
                    className="bg-[#10152A] text-white"
                  >
                    {currentPreset.label}
                  </option>
                );
              })}
            </select>

            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#FFD400]" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsResetDialogOpen(true);
            }}
            aria-label="Reset playground"
            className="h-9 cursor-pointer rounded-none border-[#899DFF] bg-transparent px-3 font-pixel text-base text-[#AAB6FF] hover:bg-[#899DFF] hover:text-[#07080C]"
          >
            <RotateCcw className="size-4" />

            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={runCode}
            aria-label="Run code"
            className="group relative h-9 cursor-pointer overflow-hidden rounded-none border-2 border-[#FFD400] bg-[#FFD400] px-4 font-pixel text-base text-[#07080C] shadow-[3px_3px_0_0_#899DFF] transition-all duration-300 hover:translate-x-px hover:translate-y-px hover:bg-[#FFD400] hover:shadow-[2px_2px_0_0_#899DFF] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#899DFF] transition-transform duration-700 ease-out group-hover:scale-[18]"
            />

            <span className="relative z-10 flex items-center gap-2 transition-colors duration-500 group-hover:text-[#07080C]">
              <Play className="size-4" />

              <span className="hidden sm:inline">Run code</span>
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
        onOpenChange={setIsResetDialogOpen}
      />
    </>
  );
}

export default function PlaygroundPage() {
  const [presetId, setPresetId] = useState<PlaygroundPresetId>("html");

  const [pendingPresetId, setPendingPresetId] =
    useState<PlaygroundPresetId | null>(null);

  const preset = playgroundPresets[presetId];

  const panelOrientation = usePanelOrientation();

  const requestPresetChange = (nextPresetId: PlaygroundPresetId) => {
    if (nextPresetId === presetId) {
      return;
    }

    setPendingPresetId(nextPresetId);
  };

  const confirmPresetChange = () => {
    if (!pendingPresetId) {
      return;
    }

    setPresetId(pendingPresetId);
    setPendingPresetId(null);
  };

  const handlePresetDialogChange = (open: boolean) => {
    if (!open) {
      setPendingPresetId(null);
    }
  };

  return (
    <main className="h-[calc(100dvh-64px)] min-h-0 w-full overflow-hidden bg-[#07080C] text-white">
      <SandpackProvider
        key={preset.id}
        template={preset.template}
        theme={codeQuestSandpackTheme}
        files={preset.files}
        className="h-full min-h-0 w-full overflow-hidden"
        style={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
        options={{
          activeFile: preset.activeFile,
          visibleFiles: preset.visibleFiles,
          externalResources: preset.externalResources ?? [],
          autorun: true,
          autoReload: true,
          recompileMode: "immediate",
        }}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <PlaygroundToolbar
            presetId={presetId}
            onPresetChange={requestPresetChange}
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
                  id="playground-editor"
                  defaultSize="50%"
                  minSize="20%"
                  maxSize="80%"
                  className="min-h-0 min-w-0 overflow-hidden"
                >
                  <div
                    className="
    h-full min-h-0 overflow-hidden
    [&_.sp-stack]:h-full
    [&_.sp-stack]:min-h-0
    [&_.sp-code-editor]:min-h-0
    [&_.sp-code-editor]:overflow-hidden
    [&_.cm-editor]:h-full
    [&_.cm-editor]:min-h-0
    [&_.cm-scroller]:overflow-auto
    [&_.cm-scroller]:overscroll-contain
  "
                  >
                    <SandpackCodeEditor
                      extensions={[
                        autocompletion({
                          activateOnTyping: true,
                        }),
                      ]}
                      initMode="immediate"
                      showTabs={preset.visibleFiles.length > 1}
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
                  </div>
                </Panel>

                <Separator
                  className={`relative z-20 shrink-0 bg-[#899DFF]/30 transition-colors duration-200 hover:bg-[#FFD400] focus:bg-[#FFD400] focus:outline-none ${
                    panelOrientation === "vertical"
                      ? "h-1 w-full cursor-row-resize"
                      : "h-full w-1 cursor-col-resize"
                  }`}
                />

                <Panel
                  id="playground-preview"
                  defaultSize="50%"
                  minSize="20%"
                  maxSize="80%"
                  className="min-h-0 min-w-0 overflow-hidden"
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

      <ConfirmDialog
        open={pendingPresetId !== null}
        title="Change playground?"
        description="Changing the playground type will reset your current code. This action cannot be undone."
        confirmText="Change template"
        onConfirm={confirmPresetChange}
        onOpenChange={handlePresetDialogChange}
      />
    </main>
  );
}
