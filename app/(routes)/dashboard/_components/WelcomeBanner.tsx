"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";

import pixWelcome from "@/components/images/pc.gif";

export default function WelcomeBanner() {
  const { isLoaded, user } = useUser();

  const displayName =
    user?.firstName || user?.fullName || user?.username || "Adventurer";

  return (
    <section className="relative overflow-hidden border-2 border-[#899DFF]/45 bg-[#10152A] px-5 py-5 shadow-[7px_7px_0_#020307] sm:px-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_50%,rgba(137,157,255,0.16),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(255,212,0,0.07),transparent_28%)]"
      />

      <div className="relative flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative h-28 w-32 shrink-0 overflow-hidden sm:h-32 sm:w-36">
          <Image
            src={pixWelcome}
            fill
            priority
            unoptimized
            sizes="144px"
            alt="CodeQuest guide welcoming you back"
            className="-scale-x-100 object-contain [image-rendering:pixelated]"
          />
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <p className="font-pixel text-xs uppercase tracking-[0.24em] text-[#899DFF]">
            Player session restored
          </p>

          <h1 className="mt-2 font-pixel text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            Welcome back,{" "}
            <span className="text-[#FFD400] [text-shadow:3px_3px_0_#FF8C00]">
              {isLoaded ? displayName : "..."}
            </span>
          </h1>

          <p className="mt-3 font-sans text-sm leading-6 text-white/55 sm:text-base">
            Your next coding quest is waiting. Continue a course or explore a
            new path below.
          </p>
        </div>
      </div>
    </section>
  );
}