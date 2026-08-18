import type { Metadata } from "next";

import LabPageHeader from "@/components/labs/LabPageHeader";
import { getServerI18n } from "@/lib/i18n/server";

import GitSandbox from "./_components/GitSandbox";
import Footer from "@/app/_components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return {
    title: t("Git Sandbox | CodeQuest"),
    description: t("Practice Git without breaking a real project."),
  };
}

export default async function GitSandboxPage() {
  const { t } = await getServerI18n();
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <LabPageHeader
        eyebrow={t("Version control simulator")}
        title="Git"
        accent={t("Sandbox")}
        description={t(
          "Practice commits, branches, merges and conflict resolution inside a disposable repository. Nothing here can damage a real project.",
        )}
      />
      <GitSandbox />
      <Footer/>
    </main>
  );
}
