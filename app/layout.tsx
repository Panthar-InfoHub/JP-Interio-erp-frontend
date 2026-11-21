import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/components/providers/AppProviders";

import "./globals.css";

// Inter is a variable font: one file covers Regular (body) and SemiBold
// (headings, buttons), self-hosted by next/font, no layout shift (DEC-228).
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JP Interio Admin",
    template: "%s · JP Interio Admin",
  },
  description: "JP Interio channel and rewards platform: admin console.",
  // The console sits behind a login; keep it out of search engines.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#284239",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
