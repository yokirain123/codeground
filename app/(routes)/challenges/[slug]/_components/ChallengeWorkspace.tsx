"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, Trophy } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { useI18n } from "@/components/i18n/I18nProvider";
import type { ChallengeDefinition } from "@/lib/challenges/types";

import ChallengeInstructions from "./ChallengeInstructions";
import PythonChallengeEditor from "./PythonChallengeEditor";
import WebChallengeEditor from "./WebChallengeEditor";

interface ChallengeWorkspaceProps {
  challenge: ChallengeDefinition;
  initialCompleted: boolean;
}

type PanelOrientation = "horizontal" | "vertical";

function usePanelOrientation(): PanelOrientation {
  const [orientation, setOrientation] =
    useState<PanelOrientation>("horizontal");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () =>
      setOrientation(media.matches ? "vertical" : "horizontal");

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return orientation;
}

export default function ChallengeWorkspace({
  challenge,
  initialCompleted,
}: ChallengeWorkspaceProps) {
  const { t, formatNumber } = useI18n();
  const orientation = usePanelOrientation();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);

  return (
    <main className="flex h-[calc(100svh-4rem)] min-h-[620px] flex-col overflow-hidden bg-[#07080C] text-white">
      <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#899DFF]/25 bg-[#10152A] px-4 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/challenges"
            aria-label={t("Back to challenges")}
            className="flex size-9 shrink-0 items-center justify-center border border-[#899DFF]/40 text-[#AAB6FF] transition-colors hover:border-[#FFD400] hover:bg-[#FFD400] hover:text-[#07080C]"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="min-w-0">
            <p className="truncate font-pixel text-lg text-white sm:text-xl">
              {challenge.title}
            </p>
            <p className="font-pixel text-[10px] uppercase tracking-widest text-[#899DFF]">
              {challenge.language} · {challenge.difficulty === "easy"
                ? t("easy")
                : challenge.difficulty === "medium"
                  ? t("medium")
                  : t("hard")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-pixel text-xs text-white/45">
          <span className="hidden items-center gap-1.5 sm:flex">
            <Clock3 className="size-4 text-[#899DFF]" />
            {t("{count} min", {
              count: formatNumber(challenge.estimatedMinutes),
            })}
          </span>
          <span className="flex items-center gap-1.5 text-[#FFD400]">
            <Trophy className="size-4" />+{formatNumber(challenge.xp)} XP
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1.5 text-[#62FB60]">
              <Check className="size-4" /> {t("Cleared")}
            </span>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Group
          key={orientation}
          orientation={orientation}
          className="h-full min-h-0 w-full"
          style={{ width: "100%", height: "100%", minHeight: 0 }}
        >
          <Panel
            id="challenge-instructions"
            defaultSize="34%"
            minSize="20%"
            maxSize="55%"
            className="min-h-0 min-w-0 overflow-hidden"
          >
            <ChallengeInstructions challenge={challenge} />
          </Panel>

          <Separator
            className={`relative z-20 shrink-0 bg-[#899DFF]/30 transition-colors hover:bg-[#FFD400] focus:bg-[#FFD400] focus:outline-none ${
              orientation === "vertical"
                ? "h-1 w-full cursor-row-resize"
                : "h-full w-1 cursor-col-resize"
            }`}
          />

          <Panel
            id="challenge-editor"
            defaultSize="66%"
            minSize="35%"
            className="min-h-0 min-w-0 overflow-hidden"
          >
            {challenge.environment === "python" ? (
              <PythonChallengeEditor
                key={challenge.slug}
                challenge={challenge}
                initialCompleted={initialCompleted}
                onCompletionChange={setIsCompleted}
              />
            ) : (
              <WebChallengeEditor
                key={challenge.slug}
                challenge={challenge}
                initialCompleted={initialCompleted}
                onCompletionChange={setIsCompleted}
              />
            )}
          </Panel>
        </Group>
      </div>
    </main>
  );
}
