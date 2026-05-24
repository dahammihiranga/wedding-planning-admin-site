import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chathu Wedding Planners - Management Dashboard",
  description: "Internal operations and inquiry tracking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Injecting a globally available country flag font styling block */}
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: "Twemoji Country Flags";
            unicode-range: U+1F1E6-1F1FF, U+1F3F4, U+E0062-E0063, U+E0065, U+E0067, U+E006C, U+E006E, U+E0073-E0074, U+E0077, U+E007F;
            src: url("https://cdn.jsdelivr.net/npm/country-flag-emoji-polyfill@0.1/dist/TwemojiCountryFlags.woff2") format("woff2");
            font-display: swap;
          }
          body, select, option, span {
            font-family: "Twemoji Country Flags", var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif !important;
          }
        `}} />
      </head>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}