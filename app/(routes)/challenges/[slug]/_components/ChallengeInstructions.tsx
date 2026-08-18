import {
  CheckCircle2,
  Clock3,
  Lightbulb,
  ScrollText,
  Trophy,
} from "lucide-react";

import { useI18n } from "@/components/i18n/I18nProvider";
import type { ChallengeDefinition } from "@/lib/challenges/types";

interface ChallengeInstructionsProps {
  challenge: ChallengeDefinition;
}

const htmlStyles = `
  space-y-3
  font-sans
  text-sm
  leading-6
  text-white/60
  [&_code]:border
  [&_code]:border-[#899DFF]/25
  [&_code]:bg-[#899DFF]/10
  [&_code]:px-1.5
  [&_code]:py-0.5
  [&_code]:font-mono
  [&_code]:text-[#FFD400]
`;

export default function ChallengeInstructions({
  challenge,
}: ChallengeInstructionsProps) {
  const { t, formatNumber } = useI18n();

  return (
    <aside className="h-full overflow-y-auto bg-[#0B0E19]">
      <div className="border-b border-[#899DFF]/20 p-5 sm:p-6">
        <p className="flex items-center gap-2 font-pixel text-xs uppercase tracking-[0.18em] text-[#899DFF]">
          <ScrollText className="size-4" />
          {t("Challenge brief")}
        </p>
        <h1 className="mt-3 font-pixel text-4xl leading-none text-[#FFD400]">
          {challenge.title}
        </h1>
        <p className="mt-4 font-sans text-sm leading-6 text-white/55">
          {challenge.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-4 font-pixel text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <Clock3 className="size-4 text-[#899DFF]" />
            {t("{count} min", {
              count: formatNumber(challenge.estimatedMinutes),
            })}
          </span>
          <span className="flex items-center gap-1.5 text-[#FFD400]">
            <Trophy className="size-4" />+{formatNumber(challenge.xp)} XP
          </span>
        </div>
      </div>

      <div className="space-y-8 p-5 sm:p-6">
        <section>
          <h2 className="font-pixel text-2xl text-white">
            {t("What you need")}
          </h2>
          <div
            className={`mt-3 ${htmlStyles}`}
            dangerouslySetInnerHTML={{ __html: challenge.learn }}
          />
        </section>

        <section className="border-t border-[#899DFF]/20 pt-7">
          <h2 className="font-pixel text-2xl text-white">
            {t("Your mission")}
          </h2>
          <div
            className={`mt-3 ${htmlStyles}`}
            dangerouslySetInnerHTML={{ __html: challenge.task }}
          />

          <ul className="mt-5 space-y-3">
            {challenge.requirements.map((requirement) => (
              <li
                key={requirement}
                className="flex gap-3 font-sans text-sm leading-6 text-white/60"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#62FB60]" />
                {requirement}
              </li>
            ))}
          </ul>
        </section>

        {challenge.exampleOutput && (
          <section className="border-t border-[#899DFF]/20 pt-7">
            <h2 className="font-pixel text-2xl text-white">
              {t("Example run")}
            </h2>
            <pre className="mt-3 overflow-x-auto border border-[#899DFF]/30 bg-[#050609] p-4 font-mono text-sm leading-6 text-[#62FB60]">
              {challenge.exampleOutput}
            </pre>
          </section>
        )}

        <details className="group border border-[#FFD400]/35 bg-[#FFD400]/5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-pixel text-sm text-[#FFD400] [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <Lightbulb className="size-4" />
              {t("Show hint")}
            </span>
            <span className="transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="border-t border-[#FFD400]/20 px-4 py-3 font-sans text-sm leading-6 text-white/55">
            {challenge.hint}
          </p>
        </details>
      </div>
    </aside>
  );
}
