import type { Metadata } from "next";
import { BookA, Search, Tags } from "lucide-react";

import Footer from "@/app/_components/Footer";
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_ENTRIES,
} from "@/lib/resources/glossary";

import CodeGlossaryExplorer from "./_components/CodeGlossaryExplorer";

export const metadata: Metadata = {
  title: "Code Glossary | CodeQuest",
  description:
    "Plain-language explanations of programming, web, data, architecture, and development-tool terms.",
};

export default function CodeGlossaryPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07080C] text-white">
      <section className="relative isolate border-b border-[#899DFF]/25">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 opacity-[0.06] [background-image:linear-gradient(to_right,#899DFF_1px,transparent_1px),linear-gradient(to_bottom,#899DFF_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_94%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_25%,rgba(255,212,0,0.09),transparent_26%),radial-gradient(circle_at_20%_76%,rgba(137,157,255,0.16),transparent_28%)]"
        />

        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#899DFF]/40 bg-[#899DFF]/5 px-3 py-2 font-pixel text-xs uppercase tracking-[0.2em] text-[#AAB6FF]">
              <BookA className="size-4 text-[#FFD400]" />
              Programmer dictionary
            </div>

            <h1 className="mt-6 font-pixel text-6xl leading-[0.82] sm:text-7xl lg:text-8xl">
              CODE <span className="text-[#FFD400]">GLOSSARY</span>
            </h1>

            <p className="mt-6 max-w-2xl font-sans text-lg leading-8 text-white/55">
              Confusing programming words translated into clear language, with
              small examples that show what each term means in real code.
            </p>
          </div>

          <div className="grid grid-cols-3 border-2 border-[#899DFF]/35 bg-[#10152A] shadow-[6px_6px_0_#020307]">
            <div className="min-w-24 border-r border-[#899DFF]/20 p-4 text-center">
              <BookA className="mx-auto size-5 text-[#FFD400]" />
              <p className="mt-2 font-pixel text-3xl text-[#FFD400]">
                {GLOSSARY_ENTRIES.length}
              </p>
              <p className="font-pixel text-[10px] uppercase tracking-widest text-white/35">
                Terms
              </p>
            </div>
            <div className="min-w-24 border-r border-[#899DFF]/20 p-4 text-center">
              <Tags className="mx-auto size-5 text-[#899DFF]" />
              <p className="mt-2 font-pixel text-3xl text-white">
                {GLOSSARY_CATEGORIES.length}
              </p>
              <p className="font-pixel text-[10px] uppercase tracking-widest text-white/35">
                Categories
              </p>
            </div>
            <div className="min-w-24 p-4 text-center">
              <Search className="mx-auto size-5 text-[#6FFFA2]" />
              <p className="mt-2 font-pixel text-3xl text-[#6FFFA2]">A–Z</p>
              <p className="font-pixel text-[10px] uppercase tracking-widest text-white/35">
                Searchable
              </p>
            </div>
          </div>
        </div>
      </section>

      <CodeGlossaryExplorer />
      <Footer />
    </main>
  );
}
