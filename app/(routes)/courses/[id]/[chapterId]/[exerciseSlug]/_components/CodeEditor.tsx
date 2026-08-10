"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack
} from "@codesandbox/sandpack-react";

import {
  autocompletion,
} from "@codemirror/autocomplete";

import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

import { toast } from "sonner";

import {
  Button,
} from "@/components/ui/shadcn/button";

import { cn } from "@/lib/utils";

import {
  codeQuestSandpackTheme,
} from "@/app/sandpack/sandpackTheme";

import {
  createStarterFiles,
} from "@/app/sandpack/starterCode";

import {
  getCourseTemplate,
} from "@/app/sandpack/getCourseTemplate";

import type {
  ExerciseData,
} from "./types";

interface CodeEditorProps {
  exerciseTitle: string;
  exercise: ExerciseData;
  courseTags?: string | null;
  onCompletionChange?: (
    isCompleted: boolean,
  ) => void;
}

interface CodeEditorActionsProps {
  onCompleteExercise: (
    files: Record<string, string>,
  ) => Promise<void>;

  isChecking: boolean;
  isCompleting: boolean;
  isCompleted: boolean;
}

interface CompletionResponse {
  completed?: boolean;
  alreadyCompleted?: boolean;
  message?: string;
  error?: string;
  xpEarned?: number;
  courseXpEarned?: number;
  totalPoints?: number;
}

interface CompletionCheckResponse {
  isCompleted: boolean;

  completedExercises?: Array<{
    id: number;
    chapterDatabaseId: number;
    chapterId: number;
    exerciseSlug: string;
    completedAt: string;
  }>;

  error?: string;
}

interface CompletionState {
  requestKey: string | null;
  isCompleted: boolean;
}

function normalizeParameter(
  value:
    | string
    | string[]
    | undefined,
) {
  const parameter =
    Array.isArray(value)
      ? value[0]
      : value;

  if (!parameter) {
    return "";
  }

  try {
    return decodeURIComponent(
      parameter,
    );
  } catch {
    return parameter;
  }
}

function CodeEditorActions({
  onCompleteExercise,
  isChecking,
  isCompleting,
  isCompleted,
}: CodeEditorActionsProps) {
  const { sandpack } =
    useSandpack();

  const buttonText = isChecking
    ? "Checking..."
    : isCompleting
      ? "Checking code..."
      : isCompleted
        ? "Completed"
        : "Check & complete";

  const handleComplete =
    () => {
      const submittedFiles =
        Object.fromEntries(
          Object.entries(
            sandpack.files,
          ).map(
            ([
              path,
              file,
            ]) => [
              path,
              file.code,
            ],
          ),
        );

      void onCompleteExercise(
        submittedFiles,
      );
    };

  return (
    <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-card px-4 py-3">
      <Button
        type="button"
        variant="default"
        disabled={
          isChecking ||
          isCompleting ||
          isCompleted
        }
        onClick={handleComplete}
        className={cn(
          "group relative cursor-pointer overflow-hidden border p-2 text-lg text-black transition-all duration-300",
          "disabled:pointer-events-none disabled:opacity-100",

          isCompleted
            ? [
                "border-[#62FB60]",
                "bg-[#62FB60]",
                "shadow-[4px_4px_0_0_#049F2B]",
              ]
            : [
                "border-accent",
                "bg-accent",
                "shadow-[4px_4px_0_0_#FF8C00]",
                "hover:translate-x-0.5",
                "hover:translate-y-0.5",
                "hover:shadow-[2px_2px_0_0_#FF8C00]",
                "active:translate-x-1",
                "active:translate-y-1",
                "active:shadow-none",
              ],
        )}
      >
        {!isCompleted && (
          <span
            aria-hidden="true"
            className="absolute top-full left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
          />
        )}

        <span
          className={cn(
            "relative z-10 transition-colors duration-500",
            !isCompleted &&
              "group-hover:text-white",
          )}
        >
          {isCompleted && (
            <span
              aria-hidden="true"
              className="mr-2"
            >
              ✓
            </span>
          )}

          {buttonText}
        </span>
      </Button>
    </footer>
  );
}

export default function CodeEditor({
  exerciseTitle,
  exercise,
  courseTags,
  onCompletionChange,
}: CodeEditorProps) {
  const params = useParams<{
    id: string;
    chapterId: string;
    exerciseSlug: string;
  }>();

  const [
    isCompleting,
    setIsCompleting,
  ] = useState(false);

  const [
    completionState,
    setCompletionState,
  ] = useState<CompletionState>({
    requestKey: null,
    isCompleted: false,
  });

  const courseId = Number(
    normalizeParameter(
      params.id,
    ),
  );

  const chapterId = Number(
    normalizeParameter(
      params.chapterId,
    ),
  );

  const exerciseSlug =
    normalizeParameter(
      params.exerciseSlug,
    );

  const hasValidExerciseParams =
    Number.isInteger(courseId) &&
    courseId > 0 &&
    Number.isInteger(chapterId) &&
    chapterId > 0 &&
    Boolean(exerciseSlug);

  const completionRequestKey =
    hasValidExerciseParams
      ? `${courseId}:${chapterId}:${exerciseSlug}`
      : null;

  const isChecking =
    completionRequestKey !== null &&
    completionState.requestKey !==
      completionRequestKey;

  const isCompleted =
    completionRequestKey !== null &&
    completionState.requestKey ===
      completionRequestKey &&
    completionState.isCompleted;

  const templateConfig = useMemo(
    () =>
      getCourseTemplate(
        courseTags,
      ),
    [courseTags],
  );

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

  const activeFile = useMemo(() => {
    if (
      visibleFiles.includes(
        templateConfig
          .preferredActiveFile,
      )
    ) {
      return templateConfig
        .preferredActiveFile;
    }

    return (
      visibleFiles[0] ||
      templateConfig
        .preferredActiveFile
    );
  }, [
    visibleFiles,
    templateConfig,
  ]);

  useEffect(() => {
    if (!completionRequestKey) {
      return;
    }

    const controller =
      new AbortController();

    const checkCompletion =
      async () => {
        try {
          const searchParameters =
            new URLSearchParams({
              courseId:
                String(courseId),

              chapterId:
                String(chapterId),

              exerciseSlug,
            });

          const response =
            await fetch(
              `/api/completed-exercises?${searchParameters.toString()}`,
              {
                method: "GET",
                cache: "no-store",
                signal:
                  controller.signal,
              },
            );

          const data =
            (await response.json()) as CompletionCheckResponse;

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Failed to check exercise completion",
            );
          }

          if (
            controller.signal.aborted
          ) {
            return;
          }

          setCompletionState({
            requestKey:
              completionRequestKey,

            isCompleted:
              data.isCompleted,
          });

          onCompletionChange?.(
            data.isCompleted,
          );
        } catch (error) {
          if (
            error instanceof Error &&
            error.name ===
              "AbortError"
          ) {
            return;
          }

          console.error(
            "Completion check error:",
            error,
          );

          if (
            !controller.signal.aborted
          ) {
            setCompletionState({
              requestKey:
                completionRequestKey,

              isCompleted: false,
            });

            onCompletionChange?.(
              false,
            );
          }
        }
      };

    void checkCompletion();

    return () => {
      controller.abort();
    };
  }, [
    completionRequestKey,
    courseId,
    chapterId,
    exerciseSlug,
    onCompletionChange,
  ]);

  const onCompleteExercise =
  async (
    submittedFiles:
      Record<string, string>,
  ) => {
    if (
      isChecking ||
      isCompleting ||
      isCompleted
    ) {
      return;
    }

    if (
      !Number.isInteger(
        courseId,
      ) ||
      courseId <= 0
    ) {
      toast.error(
        "Invalid course ID",
      );

      return;
    }

    if (
      !Number.isInteger(
        chapterId,
      ) ||
      chapterId <= 0
    ) {
      toast.error(
        "Invalid chapter ID",
      );

      return;
    }

    if (!exerciseSlug) {
      toast.error(
        "Exercise slug is required",
      );

      return;
    }

    if (
      !completionRequestKey
    ) {
      toast.error(
        "Invalid exercise URL",
      );

      return;
    }

    try {
      setIsCompleting(true);

      const response =
        await fetch(
          "/api/completed-exercises",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              courseId,
              chapterId,
              exerciseSlug,

              files:
                submittedFiles,
            }),
          },
        );

      const data =
        (await response.json()) as CompletionResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Code validation failed",
        );
      }

      setCompletionState({
        requestKey:
          completionRequestKey,

        isCompleted: true,
      });

      onCompletionChange?.(
        true,
      );

      if (
        data.alreadyCompleted
      ) {
        toast.info(
          "Exercise was already completed",
        );
      } else {
        toast.success(
          "Exercise completed!",
          {
            description:
              typeof data.xpEarned ===
              "number"
                ? `Your code passed the check. You earned ${data.xpEarned} XP.`
                : "Your code passed the check.",
          },
        );
      }
    } catch (error) {
      console.error(
        "Exercise completion error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Code validation failed",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  if (
    templateConfig.engine ===
    "python"
  ) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-background p-6">
        <div className="border-2 border-accent bg-card p-8 text-center shadow-[5px_5px_0_0_#FF8C00]">
          <p className="text-sm uppercase text-foreground/40">
            Python playground
          </p>

          <h2 className="mt-2 text-3xl text-accent">
            Python runner is not
            connected yet
          </h2>

          <p className="mt-3 max-w-lg text-lg text-foreground/60">
            Python exercises need a
            separate runner such as
            Pyodide. Sandpack does not
            provide a Python template.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={`${exerciseTitle} code playground`}
      className="h-full min-h-0 w-full overflow-hidden"
    >
      <SandpackProvider
        key={`${exercise.id}-${templateConfig.template}`}
        template={
          templateConfig.template
        }
        theme={
          codeQuestSandpackTheme
        }
        files={files}
        className="codequest-sandpack"
        style={{
          height: "100%",
          minHeight: 0,
        }}
        options={{
          activeFile,
          visibleFiles,
          autorun: true,
          autoReload: true,
          recompileMode:
            "immediate",
        }}
      >
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
              id="editor-panel"
              defaultSize="50%"
              minSize="20%"
              maxSize="80%"
              className="h-full min-h-0 min-w-0 overflow-hidden"
            >
              <div className="flex h-full min-h-0 w-full flex-col overflow-hidden text-lg">
                <div className="min-h-0 flex-1 overflow-hidden">
                  <SandpackCodeEditor
                    extensions={[
                      autocompletion({
                        activateOnTyping:
                          true,
                      }),
                    ]}
                    initMode="immediate"
                    showTabs={
                      visibleFiles.length >
                      1
                    }
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

                <CodeEditorActions
                  onCompleteExercise={
                    onCompleteExercise
                  }
                  isChecking={
                    isChecking
                  }
                  isCompleting={
                    isCompleting
                  }
                  isCompleted={
                    isCompleted
                  }
                />
              </div>
            </Panel>

            <Separator className="relative z-20 w-1 shrink-0 cursor-col-resize bg-border transition-colors duration-200 hover:bg-accent focus:bg-accent focus:outline-none" />

            <Panel
              id="preview-panel"
              defaultSize="50%"
              minSize="20%"
              maxSize="80%"
              className="h-full min-h-0 min-w-0 overflow-hidden"
            >
              <SandpackPreview
                showNavigator={false}
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
      </SandpackProvider>
    </div>
  );
}