import { ClerkProvider } from "@/components/clerk-provider";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";


import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Nabla,
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
const accentFont = Nabla({
  variable: "--font-nabla",
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
  lang="uk"
  suppressHydrationWarning
  className={cn(
    "h-full",
    geistSans.variable,
    geistMono.variable,
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