"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";

interface LabPageHeaderProps {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  children?: ReactNode;
}

export default function LabPageHeader({
  eyebrow,
  title,
  accent,
  description,
  children,
}: LabPageHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="border-b border-white/10 bg-[#0B0E18] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Link
            href="/dashboard"
            className="mb-5 inline-flex items-center gap-2 font-pixel text-sm uppercase tracking-[0.18em] text-[#899DFF] transition-colors hover:text-[#FFD400]"
          >
            <ArrowLeft className="size-4" />
            {t("Dashboard")}
          </Link>

          <p className="font-pixel text-xs uppercase tracking-[0.24em] text-[#899DFF]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-pixel text-4xl text-white [text-shadow:4px_4px_0_#28336B] sm:text-6xl">
            {title} <span className="text-[#FFD400]">{accent}</span>
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-base leading-7 text-white/55 sm:text-lg">
            {description}
          </p>
        </div>

        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </header>
  );
}
