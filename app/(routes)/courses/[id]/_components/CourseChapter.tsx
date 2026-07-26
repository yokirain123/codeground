"use client";

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
  isEnrolled: boolean;
}

interface CourseChapterItemProps {
  chapter: Chapter;
  isEnrolled: boolean;
}

function CourseChapterItem({ chapter, isEnrolled }: CourseChapterItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      open={isOpen}
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
      className="group border-b border-border last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 transition-all duration-500 hover:bg-accent/10 [&::-webkit-details-marker]:hidden">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border font-pixel text-xl">
          {chapter.chapterId}
        </span>

        <h3 className="min-w-0 flex-1 font-pixel text-2xl font-bold text-foreground">
          {chapter.name}
        </h3>

        <span className="hidden font-pixel text-lg text-foreground/50 sm:block">
          {chapter.exercises.length} exercises
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5 shrink-0 transition-transform duration-500 group-open:rotate-180"
        >
          <path d="M13 16h-2v-2h2v2Zm-2-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-6-2H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 10H5V8h2v2Zm12 0h-2V8h2v2Z" />
        </svg>
      </summary>

      <div className="border px-8 py-5">
        <p className="mb-5 font-pixel text-lg text-foreground/70">
          {chapter.desc}
        </p>

        {!isEnrolled && (
          <div className="mb-5 flex items-center gap-3 border border-accent bg-accent/10 px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 shrink-0 text-accent"
              aria-hidden="true"
            >
              <path d="M9 3h6v2h2v5h2v11H5V10h2V5h2V3Zm0 7h6V5H9v5Zm2 4v4h2v-4h-2Z" />
            </svg>

            <p className="font-pixel text-lg text-accent">
              Enroll in this course to unlock exercises.
            </p>
          </div>
        )}

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

              <span
                className={`font-pixel text-lg ${
                  isEnrolled ? "text-accent" : "text-foreground/30"
                }`}
              >
                +{exercise.xp} XP
              </span>

              <button
                type="button"
                disabled={!isEnrolled}
                title={
                  isEnrolled
                    ? `Start ${exercise.name}`
                    : "Enroll to unlock this exercise"
                }
                aria-label={
                  isEnrolled
                    ? `Start ${exercise.name}`
                    : `${exercise.name} is locked`
                }
                className="flex size-9 items-center justify-center border border-border bg-secondary text-foreground transition-all duration-500 hover:border-accent hover:bg-accent hover:text-black disabled:cursor-not-allowed disabled:bg-secondary/30 disabled:text-foreground/20 disabled:hover:border-border disabled:hover:bg-secondary/30"
              >
                {isEnrolled ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-5"
                  >
                    <path d="M9 5h2v2H9v10h2v2H9v2H7V3h2v2Zm4 12h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2v-2h2v2Zm-2-2h-2V9h2v2Zm-2-2h-2V7h2v2Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5 shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M9 3h6v2h2v5h2v11H5V10h2V5h2V3Zm0 7h6V5H9v5Zm2 4v4h2v-4h-2Z" />
                  </svg>
                )}
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
  isEnrolled,
}: CourseChaptersProps) {
  return (
    <div className="col-span-2 min-w-0">
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
          {chapters.map((chapter) => (
            <CourseChapterItem
              key={chapter.id}
              chapter={chapter}
              isEnrolled={isEnrolled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
