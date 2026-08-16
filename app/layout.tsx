import { ClerkProvider } from "@/components/clerk-provider";
import { Header } from "@/app/_components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

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
          <ClerkProvider>
            <Provider>
              <Header />
              {children}
              <Toaster/>
            </Provider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}