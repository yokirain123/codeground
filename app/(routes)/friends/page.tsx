import { Suspense } from "react";
import type { Metadata } from "next";

import FriendsHub from "./_components/FriendsHub";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: "Friends | CodeQuest",
  description:
    "Find CodeQuest players, manage friend requests and build your party.",
};

export default function FriendsPage() {
  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <Suspense
        fallback={
          <div className="flex min-h-[60svh] items-center justify-center font-pixel text-[#899DFF]">
            Loading friends...
          </div>
        }
      >
        <FriendsHub />
      </Suspense>
      <Footer/>
    </main>
  );
}
