import type { Metadata } from "next";

import LabPageHeader from "@/components/labs/LabPageHeader";
import { getServerI18n } from "@/lib/i18n/server";

import RefactorLab from "./_components/RefactorLab";
import Footer from "@/app/_components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return {
    title: t("Refactor Lab | CodeQuest"),
    description: t("Turn working code into clean and readable code."),
  };
}

export default async function RefactorLabPage() {
  const { t } = await getServerI18n();
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <LabPageHeader
        eyebrow={t("AI maintainability workshop")}
        title={t("Refactor")}
        accent={t("Lab")}
        description={t(
          "Improve working code without changing what it does. Compare the full result or inspect and apply each suggested change separately.",
        )}
      />
      <RefactorLab />
      <Footer/>
    </main>
  );
}
