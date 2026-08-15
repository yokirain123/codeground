import type { Metadata } from "next";

import LabPageHeader from "@/components/labs/LabPageHeader";

import ErrorDecoder from "./_components/ErrorDecoder";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: "Error Decoder | CodeQuest",
  description: "Turn confusing error messages into clear solutions.",
};

export default function ErrorDecoderPage() {
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <LabPageHeader
        eyebrow="AI diagnostic terminal"
        title="Error"
        accent="Decoder"
        description="Paste the code and the exact error message. CodeQuest will identify the likely line, explain the cause and prepare the smallest useful fix."
      />
      <ErrorDecoder />
      <Footer/>
    </main>
  );
}
