import type { Metadata } from "next";

import PlayerProfile from "./_components/PlayerProfile";
import Footer from "@/app/_components/Footer";
import { getServerI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("Player profile | CodeQuest"),
    description: t(
      "View a CodeQuest player's learning progress and friendship status.",
    ),
  };
}

export default function PlayerProfilePage() {
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <PlayerProfile />

      <Footer />
    </main>
  );
}
