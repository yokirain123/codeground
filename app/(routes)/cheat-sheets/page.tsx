import type { Metadata } from "next";
import { BookOpenCheck, Braces, Copy } from "lucide-react";

import Footer from "@/app/_components/Footer";
import { CHEAT_SHEETS } from "@/lib/resources/cheat-sheets";

import CheatSheetsExplorer from "./_components/CheatSheetsExplorer";

export const metadata: Metadata = {
  title: "Cheat Sheets | CodeQuest",
  description:
    "Search practical HTML, CSS, JavaScript, React, Python, C#, and C++ code patterns.",
};

export default function CheatSheetsPage() {
  const patternCount = CHEAT_SHEETS.reduce(
    (total, sheet) =>
      total +
      sheet.sections.reduce(
        (sectionTotal, section) => sectionTotal + section.entries.length,
        0,
      ),
    0,
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#07080C] text-white">
      <section className="relative isolate border-b border-[#899DFF]/25">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 opacity-[0.06] [background-image:linear-gradient(to_right,#899DFF_1px,transparent_1px),linear-gradient(to_bottom,#899DFF_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_94%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_30%,rgba(137,157,255,0.18),transparent_28%),radial-gradient(circle_at_20%_75%,rgba(255,212,0,0.07),transparent_25%)]"
        />

        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#FFD400]/40 bg-[#FFD400]/5 px-3 py-2 font-pixel text-xs uppercase tracking-[0.2em] text-[#FFD400]">
              <BookOpenCheck className="size-4" />
              Developer field guide
            </div>

            <h1 className="mt-6 font-pixel text-6xl leading-[0.82] sm:text-7xl lg:text-8xl">
              CHEAT <span className="text-[#FFD400]">SHEETS</span>
            </h1>

            <p className="mt-6 max-w-2xl font-sans text-lg leading-8 text-white/55">
              Quick syntax, practical patterns, and copy-ready examples for the
              languages you use across CodeQuest.
            </p>
          </div>

          <div className="grid grid-cols-3 border-2 border-[#899DFF]/35 bg-[#10152A] shadow-[6px_6px_0_#020307]">
            <div className="min-w-24 border-r border-[#899DFF]/20 p-4 text-center">
              <Braces className="mx-auto size-5 text-[#899DFF]" />
              <p className="mt-2 font-pixel text-3xl text-white">
                {CHEAT_SHEETS.length}
              </p>
              <p className="font-pixel text-[10px] uppercase tracking-widest text-white/35">
                Languages
              </p>
            </div>
            <div className="min-w-24 border-r border-[#899DFF]/20 p-4 text-center">
              <Copy className="mx-auto size-5 text-[#FFD400]" />
              <p className="mt-2 font-pixel text-3xl text-[#FFD400]">
                {patternCount}
              </p>
              <p className="font-pixel text-[10px] uppercase tracking-widest text-white/35">
                Patterns
              </p>
            </div>
            <div className="min-w-24 p-4 text-center">
              <span className="font-pixel text-xl text-[#6FFFA2]">⌘</span>
              <p className="mt-2 font-pixel text-3xl text-[#6FFFA2]">1</p>
              <p className="font-pixel text-[10px] uppercase tracking-widest text-white/35">
                Click copy
              </p>
            </div>
          </div>
        </div>
      </section>

      <CheatSheetsExplorer />
      <Footer />
    </main>
  );
}
