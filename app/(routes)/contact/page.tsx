import Link from "next/link";
import {
  Bug,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import ContactForm from "./contact-form";
import Footer from "@/app/_components/Footer";

interface ContactChannel {
  code: string;
  label: string;
  title: string;
  description: string;
  href: string;
  action: string;
  icon: LucideIcon;
  external: boolean;
}

const channels: ContactChannel[] = [
  {
    code: "01",
    label: "Telegram bot",
    title: "Send a message",
    description:
      "Write directly from CodeQuest and let the bot deliver it privately.",
    href: "#contact-form",
    action: "Open form",
    icon: MessageCircle,
    external: false,
  },
  {
    code: "02",
    label: "GitHub Issues",
    title: "Report a bug",
    description:
      "Found a broken quest or playground issue? Create a trackable report.",
    href: "https://github.com/yokirain123/codeground/issues",
    action: "View issues",
    icon: Bug,
    external: true,
  },
  {
    code: "03",
    label: "FAQ",
    title: "Find an answer",
    description:
      "Check common questions about courses, progress, accounts, and XP.",
    href: "/faq",
    action: "Read FAQ",
    icon: CircleHelp,
    external: false,
  },
];

function PixelCorner({ position }: { position: "top" | "bottom" }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute size-7 border-[#FFD400] ${
        position === "top"
          ? "-top-2 -left-2 border-t-2 border-l-2"
          : "-right-2 -bottom-2 border-r-2 border-b-2"
      }`}
    />
  );
}

function ContactCard({ channel }: { channel: ContactChannel }) {
  const Icon = channel.icon;

  const content = (
    <>
      <div className="flex items-start justify-between">
        <span className="flex size-14 items-center justify-center border-2 border-black bg-[#FFD400] text-black shadow-[3px_3px_0_#FF8C00]">
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <span className="font-pixel text-3xl text-[#899DFF]/45">
          {channel.code}
        </span>
      </div>

      <p className="mt-7 font-pixel text-sm uppercase tracking-[0.2em] text-[#899DFF]">
        {channel.label}
      </p>
      <h2 className="mt-2 font-pixel text-3xl text-white">{channel.title}</h2>
      <p className="mt-3 font-sans leading-7 text-white/50">
        {channel.description}
      </p>

      <span className="mt-auto flex items-center justify-between border-t border-white/10 pt-5 font-pixel text-sm uppercase tracking-[0.14em] text-[#FFD400]">
        {channel.action}
        {channel.external ? (
          <ExternalLink
            aria-hidden="true"
            className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        ) : (
          <ChevronRight
            aria-hidden="true"
            className="size-5 transition-transform group-hover:translate-x-1"
          />
        )}
      </span>
    </>
  );

  const className =
    "group relative flex min-h-72 flex-col border-2 border-[#899DFF]/35 bg-[#10152A] p-6 shadow-[6px_6px_0_#020307] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:border-[#FFD400]/70 hover:shadow-[3px_3px_0_#020307] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] focus-visible:ring-offset-4 focus-visible:ring-offset-[#07080C] sm:p-7";

  if (channel.external) {
    return (
      <a
        href={channel.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={channel.href} className={className}>
      {content}
    </Link>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100svh-64px)] overflow-hidden bg-[#07080C] text-white">
      <section className="relative isolate border-b border-white/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 opacity-[0.055] [background-image:linear-gradient(to_right,#899DFF_1px,transparent_1px),linear-gradient(to_bottom,#899DFF_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_28%,rgba(137,157,255,0.16),transparent_30%),radial-gradient(circle_at_18%_65%,rgba(255,212,0,0.06),transparent_24%)]"
        />

        <div className="mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.78fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3 font-pixel text-sm uppercase tracking-[0.24em] text-[#899DFF]">
              <span className="h-px w-10 bg-[#FFD400]" />
              Support hub // online
            </div>

            <h1 className="mt-7 max-w-3xl font-pixel text-[clamp(5rem,11vw,9.5rem)] leading-[0.66] tracking-[-0.035em]">
              NEED A
              <span className="mt-3 block text-[#FFD400] [text-shadow:5px_5px_0_#FF8C00]">
                GUIDE?
              </span>
            </h1>

            <p className="mt-8 max-w-2xl font-sans text-lg leading-8 text-white/60 sm:text-xl">
              Stuck on a quest, found a bug, or have an idea for CodeQuest?
              Choose the right channel and send your message.
            </p>

            <div className="mt-9 flex flex-wrap gap-3 font-pixel text-sm uppercase tracking-[0.14em]">
              <span className="border border-[#899DFF]/35 bg-[#899DFF]/10 px-3 py-2 text-[#C3CCFF]">
                3 contact routes
              </span>
              <span className="border border-[#FFD400]/30 bg-[#FFD400]/5 px-3 py-2 text-[#FFD400]">
                Telegram delivery
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:justify-self-end">
            <PixelCorner position="top" />
            <PixelCorner position="bottom" />

            <div className="border-2 border-[#899DFF]/50 bg-[#10152A]/95 p-1 shadow-[10px_10px_0_#020307]">
              <div className="border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2" aria-hidden="true">
                    <span className="size-2 bg-[#FFD400]" />
                    <span className="size-2 bg-[#899DFF]" />
                    <span className="size-2 bg-white/25" />
                  </div>
                  <span className="font-pixel text-xs uppercase tracking-[0.2em] text-white/35">
                    contact_terminal.exe
                  </span>
                </div>

                <div className="space-y-5 p-5 font-mono text-sm leading-6 sm:p-7">
                  <p className="text-white/35">
                    <span className="text-[#899DFF]">$</span> open support-menu
                  </p>
                  <p className="text-white/70">
                    <span className="mr-3 text-[#FFD400]">›</span>
                    Player entered the help zone.
                  </p>
                  <p className="text-white/70">
                    <span className="mr-3 text-[#FFD400]">›</span>
                    Quest Master is ready to listen.
                  </p>
                  <div className="border-l-2 border-[#899DFF] bg-black/25 px-4 py-3 text-[#C3CCFF]">
                    Select a channel below to continue your request.
                  </div>
                  <p className="flex items-center gap-2 text-[#FFD400]">
                    <span
                      aria-hidden="true"
                      className="inline-block h-4 w-2 animate-pulse bg-[#FFD400] motion-reduce:animate-none"
                    />
                    Awaiting command
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-pixel text-sm uppercase tracking-[0.28em] text-[#899DFF]">
              Choose your route
            </p>
            <h2 className="mt-3 font-pixel text-5xl tracking-tight sm:text-7xl">
              How can we <span className="text-[#FFD400]">help?</span>
            </h2>
            <p className="mt-5 max-w-xl font-sans text-base leading-7 text-white/55 sm:text-lg">
              Pick the channel that fits your request. Each route leads to a
              real CodeQuest contact point.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {channels.map((channel) => (
              <ContactCard key={channel.code} channel={channel} />
            ))}
          </div>
        </div>
      </section>

      <ContactForm />

      <section className="border-y border-white/10 bg-[#0C0E15] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 font-pixel text-sm uppercase tracking-[0.14em] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="mr-2 text-[#FFD400]">■</span>
            Contact routes operational
          </p>
          <p>Messages delivered by Telegram bot</p>
          <p>Use GitHub for reproducible bugs</p>
        </div>
      </section>
      <Footer/>
    </main>
  );
}
