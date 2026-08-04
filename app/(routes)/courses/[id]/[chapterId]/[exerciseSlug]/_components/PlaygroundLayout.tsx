"use client";

import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

import CodeEditor from "./CodeEditor";
import ContentSection from "./ContentSection";

import type { ExerciseData } from "./types";

interface PlaygroundLayoutProps {
  exerciseTitle: string;
  exercise: ExerciseData;
}

export default function PlaygroundLayout({
  exerciseTitle,
  exercise,
}: PlaygroundLayoutProps) {
  return (
    <div className="h-full min-h-0 overflow-hidden">
      <Group
        orientation="horizontal"
        className="h-full w-full"
      >
        <Panel
          id="instructions"
          defaultSize="35%"
          minSize="20%"
        >
          <ContentSection
            exerciseTitle={exerciseTitle}
            exercise={exercise}
          />
        </Panel>

        <Separator className="w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-accent" />

        <Panel
          id="playground"
          defaultSize="65%"
          minSize="30%"
          className="min-w-0"
        >
          <CodeEditor
            exerciseTitle={exerciseTitle}
            exercise={exercise}
          />
        </Panel>
      </Group>
    </div>
  );
}