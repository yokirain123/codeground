import type { Metadata } from "next";

import LabPageHeader from "@/components/labs/LabPageHeader";
import { getServerI18n } from "@/lib/i18n/server";

import BugHunt from "./_components/BugHunt";
import Footer from "@/app/_components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return {
    title: t("Bug Hunt | CodeQuest"),
    description: t("Find and fix bugs hidden inside broken code."),
  };
}

export default async function BugHuntPage() {
  const { t } = await getServerI18n();
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <LabPageHeader
        eyebrow={t("Debugging arena")}
        title={t("Bug")}
        accent={t("Hunt")}
        description={t(
          "Repair broken programs before your three attempts run out. Use a hint when you are stuck, but part of the XP reward will be lost.",
        )}
      />
      <BugHunt />
      <Footer/>
    </main>
  );
}
