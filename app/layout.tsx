import { ClerkProvider } from "@/components/clerk-provider";
import { Header } from "@/app/_components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { HTML_LOCALES } from "@/lib/i18n/config";
import { getServerI18n } from "@/lib/i18n/server";

import Provider from "./provider";

import type { Metadata } from "next";
import {
  VT323,
  Geist_Mono,
  Nabla,
} from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/shadcn/sonner";

const codeText = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const accentFont = Nabla({
  variable: "--font-nabla",
  subsets: ["latin"],
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("CodeQuest — Learn programming through quests"),
    description: t(
      "Beginner-friendly coding courses, practical challenges, and developer labs.",
    ),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getServerI18n();

  return (
    <html
      lang={HTML_LOCALES[locale]}
      suppressHydrationWarning
      className={cn(
        "h-full",
        codeText.variable,
        geistMono.variable,
        accentFont.variable,
      )}
    >
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider locale={locale}>
            <Provider initialLocale={locale}>
              <Header />
              {children}
              <Toaster />
            </Provider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
