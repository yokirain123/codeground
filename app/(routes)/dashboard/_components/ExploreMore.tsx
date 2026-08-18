"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";

interface ExploreOption {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string;
  href: string;
}

export default function ExploreMore() {
  const { t } = useI18n();
  const exploreMoreOptions: ExploreOption[] = [
    {
      id: 1,
      title: "Git Sandbox",
      description: t("Practice Git without breaking a real project."),
      category: t("Version control"),
      icon: "/labs/git-sandbox.svg",
      href: "/git-sandbox",
    },
    {
      id: 2,
      title: "Refactor Lab",
      description: t("Turn working code into clean and readable code."),
      category: t("Improve"),
      icon: "/labs/refactor-lab.svg",
      href: "/refactor-lab",
    },
    {
      id: 3,
      title: "Bug Hunt",
      description: t("Find and fix bugs hidden inside broken code."),
      category: t("Debug"),
      icon: "/labs/bug-hunt.svg",
      href: "/bug-hunt",
    },
    {
      id: 4,
      title: "Error Decoder",
      description: t("Turn confusing error messages into clear solutions."),
      category: t("Diagnose"),
      icon: "/labs/error-decoder.svg",
      href: "/error-decoder",
    },
  ];

  return (
    <section>
      <div className="mb-5 border-b border-white/10 pb-4">
        <p className="font-pixel text-xs uppercase tracking-[0.22em] text-[#899DFF]">
          {t("Optional side quests")}
        </p>
        <h2 className="mt-1 font-pixel text-3xl font-bold text-white sm:text-4xl">
          {t("Explore")} <span className="text-[#FFD400]">{t("more")}</span>
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {exploreMoreOptions.map((option) => (
          <Link
            key={option.id}
            href={option.href}
            className="group flex min-w-0 items-center gap-4 border-2 border-[#899DFF]/30 bg-[#10152A] p-4 shadow-[4px_4px_0_#020307] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD400]/70 hover:shadow-[4px_6px_0_#020307] focus-visible:border-[#FFD400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]/35"
          >
            <div className="flex size-16 shrink-0 items-center justify-center border border-[#899DFF]/25 bg-black/20 transition-colors group-hover:border-[#FFD400]/40 group-hover:bg-[#FFD400]/5">
              <Image
                src={option.icon}
                alt=""
                width={52}
                height={52}
                className="object-contain [image-rendering:pixelated]"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-pixel text-[10px] uppercase tracking-[0.18em] text-[#899DFF]">
                {option.category}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <h3 className="truncate font-pixel text-xl text-white sm:text-2xl">
                  {option.title}
                </h3>
                <span
                  aria-hidden="true"
                  className="ml-auto font-pixel text-sm text-[#FFD400] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                >
                  ▶
                </span>
              </div>
              <p className="mt-1 line-clamp-2 font-sans text-sm leading-5 text-white/50">
                {option.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
