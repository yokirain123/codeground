import { ClerkProvider } from "@/components/clerk-provider";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Jersey_20,
  Nabla
} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gameFont = Jersey_20({
  variable: "--font-jersey-20",
  subsets: ["latin"],
  weight: "400",
});
const accentFont = Nabla({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Code Quest",
  description: "Beginner-friendly coding courses and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        geistSans.variable,
        geistMono.variable,
        gameFont.variable,
        accentFont.variable,
      )}
    >
      <body className="flex min-h-full flex-col antialiased">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />

            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}