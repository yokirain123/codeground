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
    <section className="relative overflow-hidden border-y border-white/10 bg-[#0C0E15] px-6 py-20 text-white md:px-10 lg:px-16 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(to_right,#899DFF_1px,transparent_1px),linear-gradient(to_bottom,#899DFF_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(63,86,189,0.2),transparent_42%),radial-gradient(circle_at_85%_75%,rgba(255,212,0,0.06),transparent_28%)]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-pixel text-sm uppercase tracking-[0.3em] text-[#899DFF]">
            Your journey
          </p>

          <h2 className="mt-3 font-pixel text-4xl text-white [text-shadow:4px_4px_0_#28336B] md:text-6xl">
            How{" "}
            <span className="text-[#FFD400] [text-shadow:4px_4px_0_#FF8C00]">
              CodeQuest
            </span>{" "}
            works
          </h2>

          <p className="mt-5 font-sans text-lg text-white/60 md:text-xl">
            From your first lesson to your next achievement in three simple
            steps.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div
            aria-hidden="true"
            className="absolute top-12 right-[16.66%] left-[16.66%] hidden border-t-2 border-dashed border-[#899DFF]/35 md:block"
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
                <div className="h-full border-2 border-[#899DFF]/45 bg-[#10152A] p-6 shadow-[6px_6px_0_0_#020307] transition-all duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:border-[#FFD400]/70 group-hover:shadow-[3px_3px_0_0_#020307]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-16 items-center justify-center border-2 border-black bg-[#FFD400] text-black shadow-[3px_3px_0_0_#FF8C00]">
                      <Icon className="size-8" />
                    </div>

                    <span className="font-pixel text-3xl text-[#899DFF]/55">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-7 font-pixel text-3xl text-white">
                    {step.title}
                  </h3>

                  <p className="mt-3 font-sans text-lg leading-relaxed text-white/60">
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