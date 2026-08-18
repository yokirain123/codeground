"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import BasicDropdown, {
  type DropdownItem,
} from "./BasicDropdown";
import { Button } from "@/components/ui/shadcn/button";
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

export default Navbar;
