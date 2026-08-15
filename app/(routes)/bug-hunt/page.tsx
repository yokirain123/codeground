import type { Metadata } from "next";

import LabPageHeader from "@/components/labs/LabPageHeader";

import BugHunt from "./_components/BugHunt";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: "Bug Hunt | CodeQuest",
  description: "Find and fix bugs hidden inside broken code.",
};

export default function BugHuntPage() {
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <LabPageHeader
        eyebrow="Debugging arena"
        title="Bug"
        accent="Hunt"
        description="Repair broken programs before your three attempts run out. Use a hint when you are stuck, but part of the XP reward will be lost."
      />
      <BugHunt />
      <Footer/>
    </main>
  );
}
