import type { Metadata } from "next";

import LabPageHeader from "@/components/labs/LabPageHeader";
import { getServerI18n } from "@/lib/i18n/server";

import ErrorDecoder from "./_components/ErrorDecoder";
import Footer from "@/app/_components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return {
    title: t("Error Decoder | CodeQuest"),
    description: t("Turn confusing error messages into clear solutions."),
  };
}

export default async function ErrorDecoderPage() {
  const { t } = await getServerI18n();
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <LabPageHeader
        eyebrow={t("AI diagnostic terminal")}
        title={t("Error")}
        accent={t("Decoder")}
        description={t(
          "Paste the code and the exact error message. CodeQuest will identify the likely line, explain the cause and prepare the smallest useful fix.",
        )}
      />
      <ErrorDecoder />
      <Footer/>
    </main>
  );
}
