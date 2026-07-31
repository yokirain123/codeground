"use client";

import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

import { Button } from "@/components/ui/shadcn/button";

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
  const starterFiles = Object.entries(
    exercise.starterCode,
  );

  const [
    firstFilename,
    firstFileCode,
  ] = starterFiles[0] ?? [
    "index.html",
    "",
  ];

  return (
    <div className="h-full min-h-0 overflow-hidden font-sans">
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

        <Separator className="w-0.5 cursor-col-resize bg-border transition-colors hover:bg-accent focus:bg-accent" />

        <Panel
          id="editor"
          defaultSize="65%"
          minSize="30%"
        >
          <section className="flex h-full min-h-0 flex-col overflow-hidden bg-card">
            <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <p className="text-sm uppercase text-foreground/40">
                  Code editor
                </p>

                <h2 className="font-code text-2xl text-accent">
                  {firstFilename}
                </h2>
              </div>

              <Button
                type="button"
                variant="default"
                className="group relative cursor-pointer overflow-hidden border bg-accent p-4 font-sans text-base text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
                />

                <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                  Run code
                </span>
              </Button>
            </header>

            <div className="min-h-0 flex-1 overflow-auto bg-background p-4">
              <pre className="min-h-full whitespace-pre font-code text-base text-foreground">
                <code className="font-code">
                  {firstFileCode}
                </code>
              </pre>
            </div>
          </section>
        </Panel>
      </Group>
    </div>
  );
}