"use client";

import { Languages } from "lucide-react";

import { useI18n } from "@/components/i18n/I18nProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale, t, isChangingLocale } = useI18n();
  const nextLocale = locale === "en" ? "uk" : "en";
  const label =
    nextLocale === "uk"
      ? t("Switch to Ukrainian")
      : t("Switch to English");

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      disabled={isChangingLocale}
      aria-label={label}
      title={label}
      className="group flex h-9 cursor-pointer items-center gap-2 border border-[#899DFF]/35 bg-[#10152A] px-2.5 font-pixel text-sm text-[#AAB6FF] transition-all hover:border-[#FFD400] hover:text-[#FFD400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] disabled:cursor-wait disabled:opacity-60"
    >
      <Languages className="size-4 transition-transform group-hover:rotate-12" />
      <span>{locale === "uk" ? "UA" : "EN"}</span>
    </button>
  );
}
