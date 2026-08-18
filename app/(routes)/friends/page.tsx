import { Suspense } from "react";
import type { Metadata } from "next";

import FriendsHub from "./_components/FriendsHub";
import Footer from "@/app/_components/Footer";
import { getServerI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("Friends | CodeQuest"),
    description: t(
      "Find CodeQuest players, manage friend requests and build your party.",
    ),
  };
}

export default async function FriendsPage() {
  const { t } = await getServerI18n();

  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <Suspense
        fallback={
          <div className="flex min-h-[60svh] items-center justify-center font-pixel text-[#899DFF]">
            {t("Loading friends...")}
          </div>
        }
      >
        <FriendsHub />
      </Suspense>
      <Footer />
    </main>
  );
}
