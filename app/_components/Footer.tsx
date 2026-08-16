import Link from "next/link";
import { FaGithub, FaSteam, FaTelegram } from "react-icons/fa";

import Logo from "./Logo";

const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "Courses", href: "/courses" },
      { label: "Challenges", href: "/challenges" },
      { label: "Playground", href: "/playground" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "CodeQuest",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/yokirain123",
    icon: FaGithub,
  },
  {
    label: "Telegram",
    href: "https://t.me/yokiqqq",
    icon: FaTelegram,
  },
  {
    label: "Steam",
    href: "https://steamcommunity.com/id/marshalwakeup/",
    icon: FaSteam,
  },
] as const;

const linkStyles =
  "font-pixel text-base text-white/50 transition-colors duration-300 hover:text-[#FFD400]";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07080C] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 pt-12 md:px-10 lg:px-12">
        <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_0.7fr_1.2fr]">
          <div className="max-w-sm">
            <Logo />

            <p className="mt-5 font-sans text-sm leading-6 text-white/60">
              Learn programming through interactive courses, practical
              challenges, and quests designed to make coding more enjoyable.
            </p>

            <div className="mt-5 inline-flex border border-[#FFD400]/30 bg-[#FFD400]/5 px-3 py-2 font-pixel text-sm text-[#FFD400]">
              Learn • Practice • Level up
            </div>
          </div>

          {footerLinks.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="mb-4 font-pixel text-lg text-white">
                {section.title}
              </h2>

              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkStyles}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Resources">
            <h2 className="mb-4 font-pixel text-lg text-white">Resources</h2>

            <ul className="space-y-3">
              <li>
                <Link href="/cheat-sheets" className={linkStyles}>
                  Cheat Sheets
                </Link>
              </li>
              <li>
                <Link href="/code-glossary" className={linkStyles}>
                  Code Glossary
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/yokirain123/codeground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkStyles}
                >
                  GitHub project ↗
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 py-6 sm:flex-row">
          <p className="order-2 font-pixel text-sm text-white/40 sm:order-1">
            © 2026 CodeQuest. All rights reserved.
          </p>

          <div className="order-1 flex items-center gap-3 sm:order-2">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex size-10 items-center justify-center border border-[#899DFF]/25 bg-[#10152A] text-white/60 transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD400]/70 hover:bg-[#FFD400]/10 hover:text-[#FFD400]"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
