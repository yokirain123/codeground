"use client";

import { BookA, ChevronDown, FilterX, Hash, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import {
  GLOSSARY_CATEGORIES,
  type GlossaryCategory,
  type GlossaryEntry,
} from "@/lib/resources/glossary";
import { getGlossaryEntries } from "@/lib/resources/glossary.uk";

type CategoryFilter = GlossaryCategory | "All";

const categoryStyles: Record<GlossaryCategory, string> = {
  Fundamentals: "border-[#FFD400]/45 bg-[#FFD400]/10 text-[#FFD400]",
  Web: "border-[#62E6FF]/45 bg-[#62E6FF]/10 text-[#62E6FF]",
  "Object-oriented": "border-[#B28CFF]/45 bg-[#B28CFF]/10 text-[#C7ACFF]",
  Data: "border-[#6FFFA2]/45 bg-[#6FFFA2]/10 text-[#6FFFA2]",
  Tools: "border-[#FF8C42]/45 bg-[#FF8C42]/10 text-[#FFB37A]",
  Architecture: "border-[#899DFF]/45 bg-[#899DFF]/10 text-[#AAB6FF]",
};

function groupByLetter(entries: GlossaryEntry[]) {
  return entries.reduce<Record<string, GlossaryEntry[]>>((groups, entry) => {
    const letter = entry.term.charAt(0).toUpperCase();
    groups[letter] ??= [];
    groups[letter].push(entry);
    return groups;
  }, {});
}

export default function CodeGlossaryExplorer() {
  const { locale, t, formatNumber } = useI18n();
  const glossaryEntries = useMemo(() => getGlossaryEntries(locale), [locale]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return glossaryEntries.filter((entry) => {
      const matchesCategory = category === "All" || entry.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [
          entry.term,
          entry.definition,
          entry.example ?? "",
          entry.category,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [category, glossaryEntries, query]);

  const groupedEntries = useMemo(
    () => groupByLetter(filteredEntries),
    [filteredEntries],
  );
  const allLetters = useMemo(
    () => [...new Set(glossaryEntries.map((entry) => entry.term[0]))],
    [glossaryEntries],
  );
  const visibleLetters = Object.keys(groupedEntries).sort();
  const filtersAreActive = query.trim().length > 0 || category !== "All";

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
  };

  const jumpToLetter = (letter: string) => {
    document
      .getElementById(`glossary-${letter}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 lg:py-14">
      <div className="border-2 border-[#899DFF]/35 bg-[#10152A] p-4 shadow-[6px_6px_0_#020307] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="flex min-w-0 items-center gap-3 border border-[#899DFF]/30 bg-[#07080C] px-4 py-3 focus-within:border-[#FFD400]">
            <Search className="size-5 shrink-0 text-[#899DFF]" />
            <span className="sr-only">{t("Search programming terms")}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Search API, pointer, state, compiler...")}
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

          <div className="flex items-center justify-between gap-4 font-pixel text-sm text-white/40 lg:justify-end">
            <span>
              {t("{count} terms found", {
                count: formatNumber(filteredEntries.length),
              })}
            </span>
            {filtersAreActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex cursor-pointer items-center gap-2 text-[#899DFF] transition-colors hover:text-[#FFD400]"
              >
                <FilterX className="size-4" /> {t("Reset")}
              </button>
            )}
          </div>
        </div>

        <div
          className="mt-5 flex flex-wrap gap-2"
          aria-label={t("Term categories")}
        >
          {(["All", ...GLOSSARY_CATEGORIES] as CategoryFilter[]).map(
            (categoryOption) => {
              const isActive = categoryOption === category;

              return (
                <button
                  key={categoryOption}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCategory(categoryOption)}
                  className={`cursor-pointer border px-3 py-2 font-pixel text-xs uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] ${
                    isActive
                      ? "border-[#FFD400] bg-[#FFD400] text-[#07080C]"
                      : "border-white/10 bg-black/15 text-white/45 hover:border-[#899DFF]/60 hover:text-white"
                  }`}
                >
                  {t(categoryOption)}
                </button>
              );
            },
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-1 border-t border-white/10 pt-5">
          {allLetters.map((letter) => {
            const isVisible = Boolean(groupedEntries[letter]);

            return (
              <button
                key={letter}
                type="button"
                disabled={!isVisible}
                onClick={() => jumpToLetter(letter)}
                className="flex size-8 cursor-pointer items-center justify-center border border-[#899DFF]/20 bg-black/15 font-pixel text-sm text-[#899DFF] transition-colors hover:border-[#FFD400] hover:text-[#FFD400] disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/10"
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {visibleLetters.length > 0 ? (
        <div className="mt-8 space-y-10">
          {visibleLetters.map((letter) => (
            <section
              key={letter}
              id={`glossary-${letter}`}
              className="scroll-mt-28"
            >
              <div className="flex items-center gap-4 border-b border-white/10 pb-3">
                <div className="flex size-12 items-center justify-center border-2 border-[#FFD400] bg-[#FFD400] font-pixel text-3xl text-[#07080C] shadow-[3px_3px_0_#FF8C00]">
                  {letter}
                </div>
                <div>
                  <p className="font-pixel text-xl text-white">
                    {t("{count} terms", {
                      count: formatNumber(groupedEntries[letter].length),
                    })}
                  </p>
                  <p className="font-sans text-sm text-white/35">
                    {t("Programming concepts beginning with {letter}", {
                      letter,
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
                {groupedEntries[letter].map((entry) => (
                  <details
                    key={entry.slug}
                    id={`term-${entry.slug}`}
                    className="group scroll-mt-28 border border-[#899DFF]/25 bg-[#10152A] shadow-[4px_4px_0_#020307] open:border-[#899DFF]/55"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FFD400] sm:gap-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                      <div className="flex size-10 shrink-0 items-center justify-center border border-[#899DFF]/25 bg-[#899DFF]/5">
                        <Hash className="size-4 text-[#899DFF]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-pixel text-xl text-white sm:text-2xl">
                          {entry.term}
                        </h3>
                        <span
                          className={`mt-1 inline-flex border px-2 py-0.5 font-pixel text-[10px] uppercase tracking-wider ${categoryStyles[entry.category]}`}
                        >
                          {t(entry.category)}
                        </span>
                      </div>

                      <ChevronDown className="size-5 shrink-0 text-[#899DFF] transition-transform duration-200 group-open:rotate-180" />
                    </summary>

                    <div className="border-t border-white/10 px-4 py-5 sm:px-5">
                      <p className="font-sans text-base leading-7 text-white/65">
                        {entry.definition}
                      </p>

                      {entry.example && (
                        <div className="mt-4 border-l-2 border-[#FFD400] bg-black/20 px-4 py-3">
                          <div className="flex items-center gap-2 font-pixel text-[10px] uppercase tracking-[0.18em] text-[#FFD400]">
                            <BookA className="size-3.5" /> {t("Example")}
                          </div>
                          <p className="mt-2 break-words font-mono text-sm leading-6 text-[#DCE2FF]">
                            {entry.example}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 border-2 border-dashed border-[#899DFF]/30 bg-[#10152A]/40 px-6 py-16 text-center">
          <Search className="mx-auto size-8 text-[#899DFF]/50" />
          <h2 className="mt-4 font-pixel text-3xl text-white">
            {t("No terms found")}
          </h2>
          <p className="mt-2 font-sans text-white/40">
            {t("Try another search or reset the active category.")}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 cursor-pointer border border-[#FFD400] px-4 py-2 font-pixel text-sm text-[#FFD400] hover:bg-[#FFD400] hover:text-[#07080C]"
          >
            {t("Reset filters")}
          </button>
        </div>
      )}
    </section>
  );
}
