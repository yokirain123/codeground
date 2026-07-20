import Image from "next/image";
import { SignIn, SignUp } from "@clerk/nextjs";

import bgImage from "@/components/images/bg.gif";

interface AuthPageProps {
  mode: "sign-in" | "sign-up";
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#FFD400",
    colorBackground: "#111111",
    colorForeground: "#ffffff",
    colorMutedForeground: "#a1a1aa",
    colorInputBackground: "#090909",
    colorInputForeground: "#ffffff",
    colorBorder: "#FFD400",
    borderRadius: "0px",
    fontFamily: "var(--font-jersey-10)",
  },

  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full rounded-none border-2 border-black bg-black/90 shadow-[6px_6px_0_#FF8C00]",

    headerTitle: "font-accent text-4xl text-accent",
    headerSubtitle: "font-pixel text-lg text-white/70",

    socialButtonsBlockButton:
      "rounded-none border-2 border-white/20 bg-zinc-950 font-pixel text-lg text-white transition-colors hover:border-accent hover:bg-zinc-900",
    socialButtonsBlockButtonText: "font-pixel text-lg",

    dividerLine: "bg-white/20",
    dividerText: "font-pixel text-lg text-white/50",

    formFieldLabel: "font-pixel text-lg text-white",
    formFieldInput:
      "rounded-none border-2 border-white/20 bg-zinc-950 font-pixel text-lg text-white outline-none transition-colors focus:border-accent focus:ring-0",

    formButtonPrimary:
      "rounded-none border-2 border-black bg-accent py-3 font-pixel text-xl text-black shadow-[4px_4px_0_#FF8C00] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-accent-hover hover:text-white hover:shadow-[2px_2px_0_#FF8C00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",

    footerActionText: "font-pixel text-lg text-white/60",
    footerActionLink: "font-pixel text-lg text-accent hover:text-accent-hover",

    identityPreviewText: "font-pixel text-lg text-white",
    identityPreviewEditButton: "font-pixel text-accent hover:text-accent-hover",

    formFieldAction: "font-pixel text-accent hover:text-accent-hover",
    formResendCodeLink: "font-pixel text-accent hover:text-accent-hover",
  },
};

export default function AuthPage({ mode }: AuthPageProps) {
  const isSignIn = mode === "sign-in";

  return (
    <main className="relative flex min-h-[calc(100svh-72px)] items-center justify-center overflow-hidden px-4 py-12">
      <Image
        src={bgImage}
        alt=""
        fill
        priority
        unoptimized
        className="object-cover opacity-30"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.25),rgba(0,0,0,0.9)_75%)]" />

        {isSignIn ? (
          <SignIn appearance={clerkAppearance} />
        ) : (
          <SignUp appearance={clerkAppearance} />
        )}
    </main>
  );
}
