"use client";

import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  Search,
  TerminalSquare,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import { CHEAT_SHEETS } from "@/lib/resources/cheat-sheets";
import { getCheatSheets } from "@/lib/resources/cheat-sheets.uk";

export default function CheatSheetsExplorer() {
  const { locale, t, formatNumber } = useI18n();
  const sheets = useMemo(() => getCheatSheets(locale), [locale]);
  const [activeSlug, setActiveSlug] = useState(CHEAT_SHEETS[0].slug);
  const [query, setQuery] = useState("");
  const [copiedEntryId, setCopiedEntryId] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSheet =
    sheets.find((sheet) => sheet.slug === activeSlug) ?? sheets[0];

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return activeSheet.sections;
    }

    return activeSheet.sections
      .map((section) => ({
        ...section,
        entries: section.entries.filter((entry) =>
          [
            section.title,
            section.description,
            entry.title,
            entry.description,
            entry.code,
          ].some((value) => value.toLowerCase().includes(normalizedQuery)),
        ),
      }))
      .filter((section) => section.entries.length > 0);
  }, [activeSheet, query]);

  const visibleEntryCount = filteredSections.reduce(
    (total, section) => total + section.entries.length,
    0,
  );

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const copyCode = async (entryId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedEntryId(entryId);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopiedEntryId(null);
      }, 1600);
    } catch {
      setCopiedEntryId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 lg:py-14">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit border-2 border-[#899DFF]/35 bg-[#10152A] p-4 shadow-[6px_6px_0_#020307] lg:sticky lg:top-24">
          <p className="px-2 font-pixel text-xs uppercase tracking-[0.22em] text-[#899DFF]">
            {t("Select language")}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
            {sheets.map((sheet) => {
              const isActive = sheet.slug === activeSheet.slug;

              return (
                <button
                  key={sheet.slug}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setActiveSlug(sheet.slug);
                    setQuery("");
                  }}
                  className="group flex cursor-pointer items-center gap-3 border px-3 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
                  style={{
                    borderColor: isActive
                      ? sheet.accent
                      : "rgba(255,255,255,.1)",
                    backgroundColor: isActive
                      ? sheet.accent + "16"
                      : "rgba(0,0,0,.12)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0"
                    style={{ backgroundColor: sheet.accent }}
                  />
                  <span
                    className="font-pixel text-lg text-white/55 transition-colors group-hover:text-white"
                    style={isActive ? { color: sheet.accent } : undefined}
                  >
                    {sheet.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-white/10 px-2 pt-4 font-sans text-sm leading-6 text-white/40">
            {t(
              "Pick a language, search for a concept, then copy the pattern you need.",
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="border-2 border-[#899DFF]/35 bg-[#10152A] p-4 shadow-[6px_6px_0_#020307] sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="border px-2.5 py-1 font-pixel text-sm"
                    style={{
                      borderColor: activeSheet.accent + "80",
                      backgroundColor: activeSheet.accent + "12",
                      color: activeSheet.accent,
                    }}
                  >
                    {activeSheet.name}
                  </span>
                  <span className="font-pixel text-xs uppercase tracking-widest text-white/30">
                    {t("{count} patterns", {
                      count: formatNumber(visibleEntryCount),
                    })}
                  </span>
                </div>

                <h2 className="mt-3 break-words font-pixel text-3xl text-white sm:text-5xl">
                  {t("{language} quick reference", {
                    language: activeSheet.name,
                  })}
                </h2>
                <p className="mt-2 max-w-2xl font-sans leading-7 text-white/50">
                  {activeSheet.description}
                </p>
              </div>

              <Link
                href={`/playground?language=${activeSheet.playgroundLanguage}`}
                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 border-2 border-[#FFD400] bg-[#FFD400] px-5 py-2 text-center font-pixel text-base text-[#07080C] shadow-[4px_4px_0_#FF8C00] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#FF8C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
              >
                <TerminalSquare className="size-4" />
                {t("Open Playground")}
                <ExternalLink className="size-3.5" />
              </Link>
            </div>

            <label className="mt-6 flex items-center gap-3 border border-[#899DFF]/30 bg-[#07080C] px-4 py-3 focus-within:border-[#FFD400]">
              <Search className="size-5 shrink-0 text-[#899DFF]" />
              <span className="sr-only">
                {t("Search {language} patterns", {
                  language: activeSheet.name,
                })}
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Search {language}: loops, grid, arrays...", {
                  language: activeSheet.name,
                })}
                className="min-w-0 flex-1 bg-transparent font-sans text-base text-white outline-none placeholder:text-white/25"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="cursor-pointer font-pixel text-xs uppercase tracking-wider text-white/35 hover:text-[#FFD400]"
                >
                  {t("Clear")}
                </button>
              )}
            </label>
          </div>

          {filteredSections.length > 0 ? (
            <div className="mt-7 space-y-8">
              {filteredSections.map((section, sectionIndex) => (
                <section key={section.title}>
                  <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
                    <div>
                      <p className="font-pixel text-xs uppercase tracking-[0.2em] text-[#899DFF]">
                        {t("Section {number}", {
                          number: String(sectionIndex + 1).padStart(2, "0"),
                        })}
                      </p>
                      <h3 className="mt-1 font-pixel text-3xl text-white">
                        {section.title}
                      </h3>
                    </div>
                    <p className="hidden max-w-md text-right font-sans text-sm text-white/35 sm:block">
                      {section.description}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {section.entries.map((entry) => {
                      const isCopied = copiedEntryId === entry.id;

                      return (
                        <article
                          key={entry.id}
                          className="flex min-w-0 flex-col border border-[#899DFF]/25 bg-[#0C0F1B] shadow-[4px_4px_0_#020307]"
                        >
                          <header className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3">
                            <div className="min-w-0">
                              <h4 className="font-pixel text-xl text-white">
                                {entry.title}
                              </h4>
                              <p className="mt-1 font-sans text-sm leading-5 text-white/40">
                                {entry.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                void copyCode(entry.id, entry.code)
                              }
                              aria-label={t("Copy {title} code", {
                                title: entry.title,
                              })}
                              className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 border border-[#899DFF]/30 px-2.5 font-pixel text-xs text-[#899DFF] transition-colors hover:border-[#FFD400] hover:text-[#FFD400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
                            >
                              {isCopied ? (
                                <Check className="size-3.5" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                              {isCopied ? t("Copied") : t("Copy")}
                            </button>
                          </header>

                          <pre className="min-h-44 flex-1 overflow-auto p-4 font-mono text-[13px] leading-6 text-[#DCE2FF] [tab-size:2]">
                            <code>{entry.code}</code>
                          </pre>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-7 border-2 border-dashed border-[#899DFF]/30 bg-[#10152A]/40 px-6 py-16 text-center">
              <Search className="mx-auto size-8 text-[#899DFF]/50" />
              <h3 className="mt-4 font-pixel text-2xl text-white">
                {t("No matching patterns")}
              </h3>
              <p className="mt-2 font-sans text-white/40">
                {t("Try another term or clear the search field.")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
