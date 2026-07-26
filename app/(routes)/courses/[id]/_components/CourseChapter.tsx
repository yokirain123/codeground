"use client";

import { ChevronDown, Play } from "lucide-react";

import { useState } from "react";

export interface Exercise {
  name: string;
  slug: string;
  xp: number;
  difficulty: string;
}

export interface Chapter {
  id: number;
  courseId: number;
  chapterId: number;
  name: string;
  desc: string;
  exercises: Exercise[];
}

interface CourseChaptersProps {
  chapters: Chapter[];
}

interface CourseChapterItemProps {
  chapter: Chapter;
  defaultOpen?: boolean;
}

function CourseChapterItem({
  chapter,
  defaultOpen = false,
}: CourseChapterItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      open={isOpen}
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
      className="group border-b border-border last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 transition-colors hover:bg-accent/10 [&::-webkit-details-marker]:hidden transition-all duration-500">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border font-pixel text-xl">
          {chapter.chapterId}
        </span>

        <h3 className="min-w-0 flex-1 font-pixel text-2xl font-bold text-foreground">
          {chapter.name}
        </h3>

        <span className="hidden font-pixel text-lg text-foreground/50 sm:block">
          {chapter.exercises.length} exercises
        </span>

        <svg className="size-5 shrink-0 transition-transform duration-500 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M13 16h-2v-2h2v2Zm-2-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-6-2H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 10H5V8h2v2Zm12 0h-2V8h2v2Z"/></svg>
      </summary>

      <div className="border py-5 px-8">
        <p className="mb-5 font-pixel text-lg text-foreground/70">
          {chapter.desc}
        </p>

        <div className="flex flex-col">
          {chapter.exercises.map((exercise, exerciseIndex) => (
            <div
              key={exercise.slug}
              className="grid gap-3 border-t border-border/60 py-3 first:border-t-0 sm:grid-cols-[90px_1fr_auto_auto] sm:items-center sm:gap-4"
            >
              <span className="font-pixel text-sm text-foreground/50">
                Exercise {exerciseIndex + 1}
              </span>

              <div>
                <p className="font-pixel text-lg text-foreground">
                  {exercise.name}
                </p>

                <p className="font-pixel text-xs uppercase text-foreground/40">
                  {exercise.difficulty}
                </p>
              </div>

              <span className="font-pixel text-lg text-accent">
                +{exercise.xp} XP
              </span>

              <button
                type="button"
                aria-label={`Start ${exercise.name}`}
                className="flex size-9 transition-all duration-500 items-center justify-center border border-border bg-secondary text-foreground hover:border-accent hover:bg-accent hover:text-black"
              >
                <svg className="size-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M9 5h2v2H9v10h2v2H9v2H7V3h2v2Zm4 12h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2v-2h2v2Zm-2-2h-2V9h2v2Zm-2-2h-2V7h2v2Z"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

export default function CourseChapters({
  chapters,
}: CourseChaptersProps) {
  return (
    <div className="min-w-0 col-span-2">
      <h2 className="mb-6 font-pixel text-4xl text-accent md:text-5xl">
        Course chapters
      </h2>

      {chapters.length === 0 ? (
        <div className="border-2 border-accent p-6 text-center shadow-[5px_5px_0_0_#FF8C00]">
          <p className="font-pixel text-2xl text-foreground/70">
            This course does not have any chapters yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border-2 border-accent bg-background">
          {chapters.map((chapter, index) => (
            <CourseChapterItem
              key={chapter.id}
              chapter={chapter}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}