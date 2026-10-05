"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { Footer, Header, Label, wrap } from "@/components/kit";

// Client-only so the form can restore this tab's uploads and settings from sessionStorage on first render.
const StudioForm = dynamic(() => import("./studio-form"), {
  ssr: false,
  loading: () => (
    <main className={`${wrap} flex-1 py-12`}>
      <Label>Loading studio…</Label>
    </main>
  ),
});

export default function Studio({ searchParams }: PageProps<"/studio">) {
  const q = use(searchParams);
  return (
    <>
      <Header />
      <StudioForm q={q} />
      <Footer />
    </>
  );
}
