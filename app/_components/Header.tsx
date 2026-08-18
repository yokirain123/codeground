"use client";

import Link from "next/link";

import { Show } from "@clerk/nextjs";

import Logo from "@/app/_components/Logo";
import Navbar from "@/app/_components/Navbar";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/components/i18n/I18nProvider";

import { UserMenu } from "./user-menu";
import NotificationBell from "./NotificationBell";

export function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-[#899DFF]/25 bg-[#07080C]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 md:gap-5 md:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={t("CodeQuest home")}
          className="flex shrink-0 items-center"
        >
          <Logo />
        </Link>

        <div className="min-w-0 flex-1">
          <Navbar />
        </div>

        <div className="flex shrink-0 items-center gap-3 border-l border-[#899DFF]/20 pl-3 sm:gap-4 sm:pl-4">
          <LanguageSwitcher />

          <Show when="signed-out">
            <Button
              variant="default"
              className="group relative h-9 w-24 cursor-pointer overflow-hidden rounded-none border-2 border-[#FFD400] bg-[#FFD400] px-0 font-pixel text-xl text-[#07080C] shadow-[4px_4px_0_0_#899DFF] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#FFD400] hover:shadow-[2px_2px_0_0_#899DFF] focus-visible:ring-2 focus-visible:ring-[#899DFF] active:translate-x-1 active:translate-y-1 active:shadow-none sm:w-28 sm:text-2xl"
            >
              <Link href="/sign-in">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-full left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#899DFF] transition-transform duration-700 ease-out group-hover:scale-[18]"
                />

                <span className="relative z-10 transition-colors duration-500 group-hover:text-[#07080C]">
                  {t("Sign in")}
                </span>
              </Link>
            </Button>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-3 sm:gap-4">
              <NotificationBell />
              <UserMenu />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
