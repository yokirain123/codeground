"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Search, UsersRound } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function InviteFriend() {
  const router = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const findPlayers = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    router.push(
      normalizedQuery
        ? `/friends?q=${encodeURIComponent(normalizedQuery)}`
        : "/friends",
    );
  };

  return (
    <section className="relative overflow-hidden border-2 border-[#899DFF]/45 bg-[#10152A] px-6 py-7 shadow-[6px_6px_0_#020307] sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-[#899DFF]/10 blur-3xl"
      />

      <div className="relative grid gap-7 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <div className="flex size-20 items-center justify-center border border-[#899DFF]/25 bg-[#899DFF]/5 text-[#899DFF] sm:size-24">
          <UsersRound className="size-10 sm:size-12" />
        </div>

        <div className="min-w-0">
          <p className="font-pixel text-xs uppercase tracking-[0.22em] text-[#899DFF]">
            {t("Social quest")}
          </p>

          <h2 className="mt-1 font-pixel text-3xl text-white sm:text-4xl">
            {t("Build your")} <span className="text-[#FFD400]">{t("party")}</span>
          </h2>
          <p className="mt-2 font-sans text-sm leading-6 text-white/55 sm:text-base">
            {t(
              "Find CodeQuest players, send requests and compare your learning progress.",
            )}
          </p>

          <form onSubmit={findPlayers} className="mt-5 flex gap-2">
            <label htmlFor="dashboard-player-search" className="sr-only">
              {t("Search CodeQuest players")}
            </label>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#899DFF]" />
              <input
                id="dashboard-player-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Player name or email")}
                className="h-12 w-full border border-[#899DFF]/35 bg-black/25 pl-10 pr-3 font-sans text-white outline-none placeholder:text-white/25 focus:border-[#FFD400]"
              />
            </div>
            <button
              type="submit"
              className="flex h-12 cursor-pointer items-center justify-center border-2 border-black bg-[#FFD400] px-4 font-pixel text-lg text-black shadow-[4px_4px_0_#FF8C00] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#FF8C00]"
            >
              {t("Find")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
