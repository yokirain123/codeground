"use client";

import Footer from "@/app/_components/Footer";
import Link from "next/link";
import React, { useMemo, useState } from "react";

type Category = "All" | "General" | "Courses" | "Progress" | "Account" | "Playground";

type FaqEntry = {
  id: string;
  category: Exclude<Category, "All">;
  question: string;
  answer: string;
};

const categories: Category[] = [
  "All",
  "General",
  "Courses",
  "Progress",
  "Account",
  "Playground",
];

const faqEntries: FaqEntry[] = [
  {
    id: "what-is-codequest",
    category: "General",
    question: "What is CodeQuest?",
    answer:
      "CodeQuest is an interactive learning platform where programming lessons are presented as quests. You learn a concept, test it in the editor, complete a challenge, and gain experience as you progress.",
  },
  {
    id: "beginner-friendly",
    category: "General",
    question: "Do I need coding experience to begin?",
    answer:
      "No. Beginner paths start with the fundamentals and explain each new idea before asking you to use it. You can also repeat any completed lesson whenever you need a refresher.",
  },
  {
    id: "free-courses",
    category: "General",
    question: "Is CodeQuest free to use?",
    answer:
      "The core learning experience is free. If optional premium quests are introduced later, they will always be clearly marked before you enter them.",
  },
  {
    id: "choose-course",
    category: "Courses",
    question: "Which course should I start with?",
    answer:
      "Choose the language that matches what you want to build. JavaScript is a strong first choice for websites, while Python is beginner-friendly and useful for automation, data, and general programming.",
  },
  {
    id: "unlock-chapters",
    category: "Courses",
    question: "How do I unlock the next chapter?",
    answer:
      "Complete the required exercises in your current chapter. When the chapter progress reaches its target, the next part of the quest becomes available automatically.",
  },
  {
    id: "repeat-exercise",
    category: "Courses",
    question: "Can I repeat a completed exercise?",
    answer:
      "Yes. Completed exercises remain available, so you can revisit the explanation, experiment with another solution, or practice the challenge again without losing progress.",
  },
  {
    id: "earn-xp",
    category: "Progress",
    question: "How do I earn XP?",
    answer:
      "XP is awarded when you complete eligible lessons and coding challenges. More demanding quests may reward more XP, but repeating the same completed task does not create unlimited rewards.",
  },
  {
    id: "save-progress",
    category: "Progress",
    question: "Is my course progress saved automatically?",
    answer:
      "Yes. When you are signed in, completed exercises, course progress, and earned XP are saved to your account automatically after a successful submission.",
  },
  {
    id: "progress-missing",
    category: "Progress",
    question: "Why is my completed quest still marked unfinished?",
    answer:
      "Refresh the page once and confirm that you are signed into the same account. If the quest is still unfinished, run the code again and wait for the successful completion message before leaving the page.",
  },
  {
    id: "account-required",
    category: "Account",
    question: "Do I need an account?",
    answer:
      "You can explore public areas without one, but an account is required to enroll in courses and keep your progress, XP, and completed quests synced between sessions.",
  },
  {
    id: "sync-devices",
    category: "Account",
    question: "Can I continue on another device?",
    answer:
      "Yes. Sign in with the same account and your saved course progress will be available on the other device. Code that has not been submitted or saved may remain only in the original browser.",
  },
  {
    id: "supported-languages",
    category: "Playground",
    question: "Which languages work in the Playground?",
    answer:
      "The available languages depend on the current course and challenge. The language selector shows every runtime supported by that exercise, and more languages can be added as new paths launch.",
  },
  {
    id: "code-not-running",
    category: "Playground",
    question: "Why does my code not run?",
    answer:
      "Check the console message first. Most problems come from a syntax error, a missing value, or output that does not match the quest objective. The highlighted line usually points to the first place to inspect.",
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(faqEntries[0].id);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = normalize(query);

    return faqEntries.filter((entry) => {
      const matchesCategory =
        activeCategory === "All" || entry.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        normalize(`${entry.question} ${entry.answer} ${entry.category}`).includes(
          normalizedQuery,
        );

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const chooseCategory = (category: Category) => {
    setActiveCategory(category);
    setOpenId(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07080c] text-white selection:bg-[#ffd400] selection:text-black">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] [background-size:4px_4px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(63,86,189,0.26),transparent_40%),radial-gradient(circle_at_85%_55%,rgba(255,212,0,0.08),transparent_32%)]"
      />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="grid items-end gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1fr_auto] lg:pb-12">
          <div>
            <div className="mb-5 inline-flex items-center gap-3 border border-[#ffd400]/35 bg-[#ffd400]/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#ffd400] sm:text-xs">
              <span className="size-2 animate-pulse bg-[#ffd400] shadow-[0_0_10px_#ffd400]" />
              Help archive // online
            </div>

            <p className="font-pixel text-sm font-bold uppercase tracking-[0.28em] text-[#899dff]">
              Adventurer support menu
            </p>
            <h1 className="mt-3 max-w-4xl font-pixel text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-white [text-shadow:4px_4px_0_#28336b] sm:text-7xl lg:text-[6.2rem]">
              Frequently Asked
              <span className="block text-[#ffd400] [text-shadow:4px_4px_0_#ff8c00]">
                Quests
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
              Lost on the map? Search the archive for answers about courses,
              progress, accounts, and the CodeQuest Playground.
            </p>
          </div>

          <div className="hidden min-w-64 border-2 border-[#899dff]/45 bg-[#10152a] p-1 shadow-[6px_6px_0_rgba(0,0,0,0.45)] md:block">
            <div className="border border-white/10 px-5 py-4 font-mono text-xs uppercase tracking-[0.16em]">
              <div className="flex justify-between border-b border-white/10 pb-3 text-white/45">
                <span>Archive status</span>
                <span className="text-[#6fffa2]">Online</span>
              </div>
              <div className="mt-3 flex justify-between text-white/45">
                <span>Records found</span>
                <span className="text-white">{faqEntries.length.toString().padStart(2, "0")}</span>
              </div>
              <div className="mt-2 flex justify-between text-white/45">
                <span>Region</span>
                <span className="text-white">Global</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-2 border-white/15 bg-[#0b0d14]/90 p-2 shadow-[7px_7px_0_#020205] sm:p-3">
          <label className="flex min-h-16 items-center gap-3 border border-white/10 bg-black/45 px-4 sm:px-5">
            <span aria-hidden="true" className="font-mono text-xl text-[#ffd400]">
              &gt;_
            </span>
            <span className="sr-only">Search the help archive</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                setOpenId(null);

                if (nextQuery.trim()) {
                  setActiveCategory("All");
                }
              }}
              placeholder="SEARCH THE HELP ARCHIVE..."
              className="min-w-0 flex-1 bg-transparent py-5 font-mono text-sm uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/25 sm:text-base"
            />
            <kbd className="hidden border border-white/15 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/35 sm:block">
              {filteredEntries.length} FOUND
            </kbd>
          </label>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[245px_1fr] lg:gap-10">
          <aside>
            <div className="lg:sticky lg:top-6">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
                Select category
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {categories.map((category, index) => {
                  const active = activeCategory === category;
                  const amount =
                    category === "All"
                      ? faqEntries.length
                      : faqEntries.filter((entry) => entry.category === category)
                          .length;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => chooseCategory(category)}
                      aria-pressed={active}
                      className={`group relative flex min-h-12 items-center justify-between border px-3 text-left font-pixel text-xs font-bold uppercase tracking-[0.08em] transition-all sm:px-4 sm:text-sm ${
                        active
                          ? "translate-x-1 border-[#ffd400] bg-[#ffd400] text-black shadow-[-4px_4px_0_#ff8c00]"
                          : "border-white/10 bg-white/[0.025] text-white/50 hover:border-[#ffd400]/60 hover:text-[#ffd400]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={active ? "text-black" : "text-white/20"}
                        >
                          {index.toString().padStart(2, "0")}
                        </span>
                        {category}
                      </span>
                      <span
                        className={`font-mono text-[10px] ${active ? "text-black/60" : "text-white/20"}`}
                      >
                        {amount.toString().padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section aria-live="polite">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
                  Current archive
                </p>
                <h2 className="mt-1 font-pixel text-2xl font-black uppercase text-white sm:text-3xl">
                  {query ? "Search results" : `${activeCategory} records`}
                </h2>
              </div>
              <span className="font-mono text-xs text-[#ffd400]">
                {filteredEntries.length.toString().padStart(2, "0")} / {faqEntries.length.toString().padStart(2, "0")}
              </span>
            </div>

            {filteredEntries.length > 0 ? (
              <div className="space-y-3">
                {filteredEntries.map((entry, index) => {
                  const isOpen = openId === entry.id;

                  return (
                    <article
                      key={entry.id}
                      className={`border-2 transition-colors ${
                        isOpen
                          ? "border-[#899dff] bg-[#10152a] shadow-[6px_6px_0_#05060a]"
                          : "border-white/10 bg-[#0c0e15] hover:border-white/25"
                      }`}
                    >
                      <h3>
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : entry.id)}
                          aria-expanded={isOpen}
                          aria-controls={`${entry.id}-answer`}
                          className="flex w-full items-center gap-3 px-4 py-5 text-left sm:gap-5 sm:px-6"
                        >
                          <span
                            className={`grid size-9 shrink-0 place-items-center border font-mono text-xs ${
                              isOpen
                                ? "border-[#ffd400] bg-[#ffd400] text-black"
                                : "border-white/10 bg-white/[0.03] text-white/35"
                            }`}
                          >
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.2em] text-[#899dff] sm:text-[10px]">
                              {entry.category}
                            </span>
                            <span className="block font-pixel text-base font-bold leading-snug text-white sm:text-lg">
                              {entry.question}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={`grid size-8 shrink-0 place-items-center border font-mono text-lg transition-transform ${
                              isOpen
                                ? "rotate-45 border-[#ffd400] text-[#ffd400]"
                                : "border-white/10 text-white/35"
                            }`}
                          >
                            +
                          </span>
                        </button>
                      </h3>

                      <div
                        id={`${entry.id}-answer`}
                        hidden={!isOpen}
                        className="px-4 pb-5 sm:px-6 sm:pb-6"
                      >
                        <div className="ml-12 border-l-2 border-[#ffd400]/50 pl-4 sm:ml-14 sm:pl-6">
                          <p className="max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
                            {entry.answer}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
                <span className="font-mono text-4xl text-[#ffd400]">?!</span>
                <h3 className="mt-4 font-pixel text-2xl font-black uppercase">
                  No records found
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">
                  The archive has no match for that command. Try another keyword
                  or return to all categories.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-6 border-2 border-black bg-[#ffd400] px-5 py-3 font-pixel text-sm font-black uppercase text-black shadow-[4px_4px_0_#ff8c00] transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  Reset archive
                </button>
              </div>
            )}
          </section>
        </div>

        <section className="relative mt-16 overflow-hidden border-2 border-[#ffd400] bg-[#ffd400] p-1 text-black shadow-[8px_8px_0_#ff8c00]">
          <div className="relative grid gap-6 border-2 border-black/20 bg-[linear-gradient(135deg,#ffd400,#ffb800)] px-6 py-7 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div aria-hidden="true" className="absolute -right-5 -top-9 font-mono text-[8rem] font-black leading-none text-black/[0.06]">
              ?
            </div>
            <div className="relative">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black/55">
                Side quest available
              </p>
              <h2 className="mt-2 font-pixel text-2xl font-black uppercase sm:text-3xl">
                Still trapped in the dungeon?
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-black/65 sm:text-base">
                Tell us where you got stuck and the guild will help you find the
                next path.
              </p>
            </div>
            <Link
              href="/contact"
              className="relative inline-flex min-h-12 items-center justify-center gap-3 border-2 border-black bg-[#0a0b10] px-6 font-pixel text-sm font-black uppercase tracking-[0.08em] text-white shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-all hover:-translate-y-0.5 hover:text-[#ffd400]"
            >
              Contact the guild <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </section>
      <Footer/>
    </main>
  );
}