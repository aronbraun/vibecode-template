import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Link } from "@/components/link";
import { ThemePicker } from "@/components/theme-picker";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/site";

import { Providers } from "./providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html>
    // before React loads, which React would otherwise report as a mismatch.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <header className="flex items-center justify-between border-b px-6 py-3">
            <Link href="/" className="font-semibold">
              {siteConfig.name}
            </Link>
            <ThemePicker />
          </header>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
