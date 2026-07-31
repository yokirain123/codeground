import type { ExerciseData } from "./types";

interface ContentSectionProps {
  exerciseTitle: string;
  exercise: ExerciseData;
}

const contentStyles = `
  space-y-2
  text-base
  leading-relaxed
  text-foreground/70

  [&_code]:border
  [&_code]:border-border
  [&_code]:bg-card
  [&_code]:px-1.5
  [&_code]:py-0.5
  [&_code]:font-code
  [&_code]:text-base
  [&_code]:text-accent

  [&_li]:ml-5
  [&_li]:list-disc
`;

export default function ContentSection({
  exerciseTitle,
  exercise,
}: ContentSectionProps) {
  return (
    <section className="h-full overflow-y-auto border-r border-border p-6">
      <header>
        <p className="text-sm uppercase text-foreground/40">
          Exercise
        </p>

        <h1 className="mt-1 text-3xl text-accent md:text-4xl">
          {exerciseTitle}
        </h1>
      </header>

      <section className="mt-6">
        <h2 className="text-2xl text-accent">
          Learn
        </h2>

        <div
          className={contentStyles}
          dangerouslySetInnerHTML={{
            __html: exercise.content,
          }}
        />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-2xl text-accent">
          Your task
        </h2>

        <div
          className={`mt-3 ${contentStyles}`}
          dangerouslySetInnerHTML={{
            __html: exercise.task,
          }}
        />
      </section>

      <details className="group mt-8 border border-accent/50 bg-accent/5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-base text-accent [&::-webkit-details-marker]:hidden">
          <span>Show hint</span>

          <span className="text-sm text-foreground/40">
            -{exercise.hintXp} XP
          </span>
        </summary>

        <div
          className={`
            border-t
            border-accent/30
            px-4
            py-3
            text-base
            text-foreground/70

            [&_code]:font-code
            [&_code]:text-base
            [&_code]:text-accent
          `}
          dangerouslySetInnerHTML={{
            __html: exercise.hint,
          }}
        />
      </details>
    </section>
  );
}