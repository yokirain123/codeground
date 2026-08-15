import type { Metadata } from "next";

import LabPageHeader from "@/components/labs/LabPageHeader";

import RefactorLab from "./_components/RefactorLab";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: "Refactor Lab | CodeQuest",
  description: "Turn working code into clean and readable code.",
};

export default function RefactorLabPage() {
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <LabPageHeader
        eyebrow="AI maintainability workshop"
        title="Refactor"
        accent="Lab"
        description="Improve working code without changing what it does. Compare the full result or inspect and apply each suggested change separately."
      />
      <RefactorLab />
      <Footer/>
    </main>
  );
}
