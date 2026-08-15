import type { Metadata } from "next";

import PlayerProfile from "./_components/PlayerProfile";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: "Player profile | CodeQuest",
  description:
    "View a CodeQuest player's learning progress and friendship status.",
};

export default function PlayerProfilePage() {
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <PlayerProfile />

      <Footer />
    </main>
  );
}
