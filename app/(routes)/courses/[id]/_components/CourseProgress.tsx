import type { ReactNode } from "react";

import type { Chapter, CourseProgressData } from "./CourseChapter";

interface CourseProgressProps {
  chapters: Chapter[];
  completion: CourseProgressData;
}

function clamp(value: number, maximum: number) {
  return Math.max(0, Math.min(value, maximum));
}

export default function CourseProgress({
  chapters,
  completion,
}: CourseProgressProps) {
  const totalExercises = chapters.reduce(
    (total, chapter) => total + chapter.exercises.length,
    0,
  );

  const totalXp = chapters.reduce(
    (chapterTotal, chapter) =>
      chapterTotal +
      chapter.exercises.reduce(
        (exerciseTotal, exercise) => exerciseTotal + exercise.xp,
        0,
      ),
    0,
  );

  const completedChapters = clamp(
    completion.completedChapters,
    chapters.length,
  );
  const completedExercises = clamp(
    completion.completedExercises,
    totalExercises,
  );
  const earnedXp = clamp(completion.earnedXp, totalXp);
  const progress =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;
  const isComplete = totalExercises > 0 && progress === 100;

  return (
    <aside className="border-2 border-[#899DFF]/45 bg-[#10152A] p-6 text-white shadow-[6px_6px_0_#020307] lg:sticky lg:top-24 lg:mt-[4.5rem]">
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="flex size-12 shrink-0 items-center justify-center border border-[#899DFF]/35 bg-[#899DFF]/5 text-[#899DFF]">
          <svg
            className="size-7"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M16 17h-3v2h2v2H9v-2h2v-2H8v-2h8v2Zm2-12h4v6h-2V7h-2v4h2v2h-2v2h-2V5H8v10H6v-2H4v-2h2V7H4v4H2V5h4V3h12v2Z" />
          </svg>
        </div>

        <div>
          <p className="font-pixel text-xs uppercase tracking-[0.2em] text-[#899DFF]">
            Player stats
          </p>
          <h2 className="mt-1 font-pixel text-3xl text-white">
            Course progress
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-end justify-between gap-4 font-pixel">
          <span className="text-xl text-white/60">Completion</span>
          <span className={isComplete ? "text-[#6FFFA2]" : "text-[#FFD400]"}>
            {progress}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Course progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={`${progress}% complete`}
          className="h-4 overflow-hidden border border-white/15 bg-black/40 p-px"
        >
          <div
            className={`h-full transition-[width] duration-500 ${
              isComplete ? "bg-[#6FFFA2]" : "bg-[#FFD400]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 pt-5">
        <ProgressRow
          icon={<ChaptersIcon />}
          label="Chapters"
          value={`${completedChapters}/${chapters.length}`}
        />
        <ProgressRow
          icon={<ExercisesIcon />}
          label="Exercises"
          value={`${completedExercises}/${totalExercises}`}
        />
        <ProgressRow
          icon={<XpIcon />}
          label="Total XP"
          value={`${earnedXp}/${totalXp} XP`}
          highlighted
        />
      </div>
    </aside>
  );
}

interface ProgressRowProps {
  icon: ReactNode;
  label: string;
  value: string;
  highlighted?: boolean;
}

function ProgressRow({
  icon,
  label,
  value,
  highlighted = false,
}: ProgressRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 font-pixel text-lg">
      <span className="flex items-center gap-3 text-white/50">
        <span className="text-[#899DFF]">{icon}</span>
        {label}
      </span>

      <span className={highlighted ? "text-[#FFD400]" : "text-white"}>
        {value}
      </span>
    </div>
  );
}

function ChaptersIcon() {
  return (
    <svg
      className="size-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M2 3h9v2H2zM0 19h11v2H0zM13 3h9v2h-9zm0 16h11v2H13zM11 5h2v18h-2zM0 5h2v14H0zm22 0h2v14h-2zm-7 2h5v2h-5zm0 4h5v2h-5zm0 4h2v2h-2z" />
    </svg>
  );
}

function ExercisesIcon() {
  return (
    <svg
      className="size-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 16H6V18H8V20H10V22H2V14H4V16ZM12 20H10V18H12V20ZM14 18H12V16H14V18ZM10 16H8V14H10V16ZM16 16H14V14H16V16ZM6 14H4V12H6V14ZM12 14H10V12H12V14ZM18 14H16V12H18V14ZM8 12H6V10H8V12ZM14 12H12V10H14V12ZM20 12H18V10H20V12ZM10 10H8V8H10V10ZM18 10H16V8H18V10ZM22 10H20V8H22V10ZM12 8H10V6H12V8ZM16 8H14V6H16V8ZM20 8H18V6H20V8ZM14 6H12V4H14V6ZM18 6H16V4H18V6ZM16 4H14V2H16V4Z" />
    </svg>
  );
}

function XpIcon() {
  return (
    <svg
      className="size-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 23H3v-2h2v2Zm8 0h-2v-4h2v4ZM3 21H1v-2h2v2Zm4 0H5v-2h2v2Zm-2-2H3v-2h2v2Zm6 0H9v-4h2v4Zm4 0h-2v-4h2v4Zm-6-4H5v-2h4v2Zm10 0h-4v-2h4v2ZM5 13H1v-2h4v2Zm18 0h-4v-2h4v2ZM9 11H5V9h4v2Zm10 0h-4V9h4v2Zm-8-2H9V5h2v4Zm4 0h-2V5h2v4Zm6-6h2v2h-2v2h-2V5h-2V3h2V1h2v2Zm-8 2h-2V1h2v4Z" />
    </svg>
  );
}