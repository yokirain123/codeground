import {
  BookOpen,
  Code2,
  Trophy,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose a course",
    description:
      "Pick a learning path and begin at your current skill level.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Complete coding quests",
    description:
      "Learn the topic, write real code and solve exercises in the playground.",
    icon: Code2,
  },
  {
    number: "03",
    title: "Earn XP and achievements",
    description:
      "Build your streak, unlock badges and track your course progress.",
    icon: Trophy,
  },
] as const;

export default function HowCodeQuestWorks() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-card/30 px-6 py-20 md:px-10 lg:px-16 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#FFD400_1px,transparent_1px),linear-gradient(to_bottom,#FFD400_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-foreground/40">
            Your journey
          </p>

          <h2 className="mt-2 text-4xl text-accent md:text-6xl">
            How CodeQuest works
          </h2>

          <p className="mt-4 text-lg text-foreground/60 md:text-xl">
            From your first lesson to your next achievement in three simple
            steps.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div
            aria-hidden="true"
            className="absolute top-12 right-[16.66%] left-[16.66%] hidden border-t-2 border-dashed border-accent/40 md:block"
          />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className={`group relative z-10 ${
                  index === 1 ? "md:-translate-y-4" : "md:translate-y-4"
                }`}
              >
                <div className="h-full border-2 border-accent bg-background p-6 shadow-[6px_6px_0_0_#FF8C00] transition-all duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[3px_3px_0_0_#FF8C00]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-16 items-center justify-center border-2 border-accent bg-accent text-black shadow-[3px_3px_0_0_#FF8C00]">
                      <Icon className="size-8" />
                    </div>

                    <span className="text-3xl text-accent/40">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-3xl text-accent">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-lg leading-relaxed text-foreground/60">
                    {step.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
