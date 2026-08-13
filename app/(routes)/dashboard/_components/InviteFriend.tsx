"use client";

import { type FormEvent, useState } from "react";

import Image from "next/image";

import Mail from "@/components/images/mail.png";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteFriend() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const inviteFriend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");

    const subject = encodeURIComponent("Join me on CodeQuest");
    const body = encodeURIComponent(
      "I have been learning programming on CodeQuest. Join me and start your first coding quest!",
    );

    window.location.href = `mailto:${normalizedEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="relative overflow-hidden border-2 border-[#899DFF]/45 bg-[#10152A] px-6 py-7 shadow-[6px_6px_0_#020307] sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-[#899DFF]/10 blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-6 md:flex-row">
        <div className="flex size-24 shrink-0 items-center justify-center border border-[#899DFF]/25 bg-black/20">
          <Image
            src={Mail}
            alt=""
            width={72}
            height={72}
            className="[image-rendering:pixelated]"
          />
        </div>

        <div className="min-w-0 flex-1 text-center md:text-left">
          <p className="font-pixel text-xs uppercase tracking-[0.22em] text-[#899DFF]">
            Party invitation
          </p>
          <h2 className="mt-1 font-pixel text-3xl text-white sm:text-4xl">
            Invite a <span className="text-[#FFD400]">friend</span>
          </h2>
          <p className="mt-2 font-sans text-sm leading-6 text-white/55 sm:text-base">
            Learning is better with a party. Open a ready-to-send invitation in
            your email app.
          </p>

          <form
            onSubmit={inviteFriend}
            className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row"
            noValidate
          >
            <div className="min-w-0 flex-1">
              <label htmlFor="friend-email" className="sr-only">
                Friend&apos;s email
              </label>
              <Input
                id="friend-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError("");
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "friend-email-error" : undefined}
                placeholder="friend@example.com"
                className="h-12 rounded-none border-[#899DFF]/35 bg-black/25 font-sans text-white placeholder:text-white/25 focus-visible:border-[#FFD400] focus-visible:ring-[#FFD400]/25"
              />
              {error && (
                <p
                  id="friend-email-error"
                  role="alert"
                  className="mt-2 text-sm text-red-400"
                >
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="group relative h-12 cursor-pointer overflow-hidden rounded-none border-2 border-black bg-[#FFD400] px-6 font-pixel text-xl text-black shadow-[4px_4px_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#FFD400] hover:shadow-[2px_2px_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <span
                aria-hidden="true"
                className="absolute top-full left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#FF8C00] transition-transform duration-700 group-hover:scale-[18]"
              />
              <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                Invite
              </span>
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}