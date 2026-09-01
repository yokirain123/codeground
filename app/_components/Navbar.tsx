"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Menu, X } from "lucide-react";

import BasicDropdown, {
  type DropdownItem,
} from "./BasicDropdown";
import { Button } from "@/components/ui/shadcn/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/shadcn/sheet";
import { useI18n } from "@/components/i18n/I18nProvider";

const buttonStyles =
  "group relative h-8 w-auto shrink-0 cursor-pointer justify-center overflow-hidden border bg-accent px-2 text-2xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

function NavButton({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Button className={buttonStyles}>
      <Link href={href}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
        />

        <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
          {label}
        </span>
      </Link>
    </Button>
  );
}

function Navbar() {
  const router = useRouter();
  const { t } = useI18n();
  const homeItems: DropdownItem[] = [
    { id: "/courses", label: t("Courses") },
    { id: "/playground", label: t("Playground") },
  ];
  const navItems = [
    { label: t("Challenges"), href: "/challenges" },
    { label: t("Contact"), href: "/contact" },
  ];

  return (
    <nav className="flex items-center gap-4">
      <BasicDropdown
        label={t("Explore")}
        items={homeItems}
        onChange={(item) => router.push(String(item.id))}
      />

      {navItems.map((item) => (
        <NavButton
          key={item.href}
          label={item.label}
          href={item.href}
        />
      ))}
    </nav>
  );
}

export function MobileNavbar() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const items = [
    { label: t("Courses"), href: "/courses", number: "01" },
    { label: t("Playground"), href: "/playground", number: "02" },
    { label: t("Challenges"), href: "/challenges", number: "03" },
    { label: t("Contact"), href: "/contact", number: "04" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        aria-label={t("Explore")}
        className="flex size-10 cursor-pointer items-center justify-center border border-[#899DFF]/30 bg-[#10152A] text-[#AAB6FF] transition-colors hover:border-[#FFD400] hover:text-[#FFD400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] lg:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[min(22rem,calc(100vw-1rem))] gap-0 border-l-2 border-[#899DFF]/55 bg-[#090B14] p-0 text-white shadow-[-8px_0_0_#020307]"
      >
        <SheetHeader className="relative border-b border-white/10 px-5 py-5 pr-16 text-left">
          <SheetTitle className="font-pixel text-3xl text-[#FFD400]">
            CodeQuest
          </SheetTitle>
          <SheetDescription className="font-sans text-sm text-white/45">
            {t("Choose your first course")}
          </SheetDescription>

          <SheetClose
            aria-label={t("Close modal")}
            className="absolute right-4 top-4 flex size-10 cursor-pointer items-center justify-center border border-[#899DFF]/30 bg-[#10152A] text-[#AAB6FF] transition-colors hover:border-[#FFD400] hover:text-[#FFD400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
          >
            <X className="size-5" />
          </SheetClose>
        </SheetHeader>

        <nav
          aria-label={t("Explore")}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5"
        >
          <p className="px-2 font-pixel text-xs uppercase tracking-[0.24em] text-[#899DFF]">
            {t("Explore")}
          </p>

          <div className="mt-3 flex flex-col gap-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group flex min-h-14 items-center gap-4 border border-[#899DFF]/25 bg-[#10152A] px-4 font-pixel text-xl text-white transition-colors hover:border-[#FFD400]/70 hover:bg-[#FFD400]/5 hover:text-[#FFD400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
              >
                <span className="text-sm text-[#899DFF] transition-colors group-hover:text-[#FFD400]">
                  {item.number}
                </span>
                <span className="min-w-0 flex-1 break-words">{item.label}</span>
                <span aria-hidden="true" className="text-sm">
                  ▶
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default Navbar;
