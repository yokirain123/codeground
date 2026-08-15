import type { Metadata } from "next";

import LabPageHeader from "@/components/labs/LabPageHeader";

import GitSandbox from "./_components/GitSandbox";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: "Git Sandbox | CodeQuest",
  description: "Practice Git without breaking a real project.",
};

export default function GitSandboxPage() {
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <LabPageHeader
        eyebrow="Version control simulator"
        title="Git"
        accent="Sandbox"
        description="Practice commits, branches, merges and conflict resolution inside a disposable repository. Nothing here can damage a real project."
      />
      <GitSandbox />
      <Footer/>
    </main>
  );
}
