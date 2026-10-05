import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = "Upload a podcast episode and get a vertical cut that follows the speaker, plus timelines for Premiere, Final Cut and Resolve.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "deepsoch podcast: your conversation, re-cut for every screen", template: "%s · deepsoch podcast" },
  description,
  openGraph: { type: "website", siteName: SITE.name, description },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full antialiased", geistSans.variable, geistMono.variable)}>
      <body className="min-h-full flex flex-col text-text-body">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
