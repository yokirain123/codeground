"use client";

import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

import CodeEditor from "./CodeEditor";
import ContentSection from "./ContentSection";

import type {
  ExerciseData,
} from "./types";

interface PlaygroundLayoutProps {
  exerciseTitle: string;
  exercise: ExerciseData;
  onCompletionChange?: (
    isCompleted: boolean,
  ) => void;
}

export default function PlaygroundLayout({
  exerciseTitle,
  exercise,
  onCompletionChange,
}: PlaygroundLayoutProps) {
  return (
    <div className="h-full min-h-0 overflow-hidden">
      <Group
        orientation="horizontal"
        className="h-full min-h-0 w-full"
        style={{
          height: "100%",
        }}
      >
        <Panel
          id="instructions"
          defaultSize="35%"
          minSize="20%"
          className="h-full min-h-0 overflow-hidden"
        >
          <ContentSection
            exerciseTitle={
              exerciseTitle
            }
            exercise={exercise}
          />
        </Panel>

        <Separator className="w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-accent" />

        <Panel
          id="playground"
          defaultSize="65%"
          minSize="30%"
          className="relative h-full min-h-0 min-w-0 overflow-hidden"
        >
          <div className="absolute inset-0 min-h-0 overflow-hidden">
            <CodeEditor
              exerciseTitle={
                exerciseTitle
              }
              exercise={exercise}
              onCompletionChange={
                onCompletionChange
              }
            />
          </div>
        </Panel>
      </Group>
    </div>
  );
}
