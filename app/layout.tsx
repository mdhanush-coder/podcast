import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SmoothScroll } from "@/components/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "deepsoch podcast",
  description: "Your conversation, re-cut for every screen.",
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
