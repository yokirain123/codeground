import type { Chapter } from "./CourseChapter";

interface CourseProgressProps {
  chapters: Chapter[];
  progress?: number;
}

export default function CourseProgress({
  chapters,
  progress = 0,
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

  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <aside className="border-2 border-accent p-6 shadow-[6px_6px_0_0_#FF8C00] mt-18">
      <div className="mb-6 flex items-center gap-3">
        <svg
          className="size-10 text-accent"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16 17h-3v2h2v2H9v-2h2v-2H8v-2h8v2Zm2-12h4v6h-2V7h-2v4h2v2h-2v2h-2V5H8v10H6v-2H4v-2h2V7H4v4H2V5h4V3h12v2Z" />
        </svg>

        <h2 className="font-pixel text-4xl text-accent">Course progress</h2>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex justify-between font-pixel text-lg">
          <span className="flex items-center gap-3 text-2xl">Progress</span>

          <span className="text-accent">{safeProgress}%</span>
        </div>

        <div
          role="progressbar"
          aria-label="Course progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={safeProgress}
          className="h-4 overflow-hidden border border-accent bg-background"
        >
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{
              width: `${safeProgress}%`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <div className="flex justify-between font-pixel text-xl">
          <span className="flex items-center gap-3 text-2xl text-foreground/60">
            <svg
              className="size-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2 3h9v2H2zM0 19h11v2H0zM13 3h9v2h-9zm0 16h11v2H13zM11 5h2v18h-2zM0 5h2v14H0zm22 0h2v14h-2zm-7 2h5v2h-5zm0 4h5v2h-5zm0 4h2v2h-2z" />
            </svg>
            Chapters
          </span>

          <span>{chapters.length}</span>
        </div>

        <div className="flex justify-between font-pixel text-xl items-center">
          <span className="flex items-center gap-3 text-2xl text-foreground/60">
            <svg
              className="size-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4 16H6V18H8V20H10V22H2V14H4V16ZM12 20H10V18H12V20ZM14 18H12V16H14V18ZM10 16H8V14H10V16ZM16 16H14V14H16V16ZM6 14H4V12H6V14ZM12 14H10V12H12V14ZM18 14H16V12H18V14ZM8 12H6V10H8V12ZM14 12H12V10H14V12ZM20 12H18V10H20V12ZM10 10H8V8H10V10ZM18 10H16V8H18V10ZM22 10H20V8H22V10ZM12 8H10V6H12V8ZM16 8H14V6H16V8ZM20 8H18V6H20V8ZM14 6H12V4H14V6ZM18 6H16V4H18V6ZM16 4H14V2H16V4Z" />
            </svg>
            Exercises
          </span>

          <span>{totalExercises}</span>
        </div>

        <div className="flex justify-between font-pixel text-xl">
          <span className="flex items-center gap-3 text-2xl text-foreground/60">
            <svg
              className="size-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 23H3v-2h2v2Zm8 0h-2v-4h2v4ZM3 21H1v-2h2v2Zm4 0H5v-2h2v2Zm-2-2H3v-2h2v2Zm6 0H9v-4h2v4Zm4 0h-2v-4h2v4Zm-6-4H5v-2h4v2Zm10 0h-4v-2h4v2ZM5 13H1v-2h4v2Zm18 0h-4v-2h4v2ZM9 11H5V9h4v2Zm10 0h-4V9h4v2Zm-8-2H9V5h2v4Zm4 0h-2V5h2v4Zm6-6h2v2h-2v2h-2V5h-2V3h2V1h2v2Zm-8 2h-2V1h2v4Z" />
            </svg>
            Total XP
          </span>

          <span className="text-accent">{totalXp} XP</span>
        </div>
      </div>
    </aside>
  );
}
