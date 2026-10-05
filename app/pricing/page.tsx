import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Footer, Header, Label, PageHead, btn, wrap } from "@/components/kit";
import { cn } from "@/lib/utils";
import { RUNS_PER_DAY, SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Pricing", description: "Plans for editing podcasts into vertical cuts with timelines for your editor." };

// TODO: set real prices and limits before launch. Paid plans have no checkout yet; their buttons go to contact.
const PLANS = [
  {
    name: "Free",
    price: "$0",
    per: "forever",
    blurb: "Try it on a real episode.",
    features: [`${RUNS_PER_DAY} edits a day`, "Every aspect ratio", "All 6 export formats", "Up to 5 GB per file"],
    cta: { label: "Start editing", href: "/studio" },
  },
  {
    name: "Pro",
    price: "$—",
    per: "per month",
    blurb: "For a weekly show.",
    features: ["More edits a day", "Multi-camera with sync", "Priority GPU queue", "Longer file retention"],
    cta: { label: "Talk to us", href: "/contact?topic=pro" },
    featured: true,
  },
  {
    name: "Team",
    price: "$—",
    per: "per month",
    blurb: "For studios and networks.",
    features: ["Everything in Pro", "Shared workspace", "Higher limits", "Invoice billing"],
    cta: { label: "Talk to us", href: "/contact?topic=team" },
  },
];

const FAQ = [
  ["Is there a free plan?", `Yes. The free plan includes ${RUNS_PER_DAY} edits a day with every export format. No card needed.`],
  ["What counts as an edit?", "Each time you press start in the studio. Re-downloading files from a finished edit is free."],
  ["What happens when I hit the daily limit?", "New edits are paused until 24 hours after your earliest edit that day. Finished edits stay available."],
  ["Can I cancel anytime?", "Paid plans are monthly. Cancel and you keep the plan until the end of the period."],
];

export default function Pricing() {
  return (
    <>
      <Header>
        <Link href="/studio" className={btn.primary}>Start editing</Link>
      </Header>
      <main className={`${wrap} flex-1 pt-12 pb-24`}>
        <PageHead labels={["(Pricing)", "Billed monthly"]} title="Pay for the edits you make.">
          Start free. Move up when your show does.
        </PageHead>

        <ul className="mt-16 grid border-t border-l border-border md:grid-cols-3">
          {PLANS.map((p) => (
            <li key={p.name} className={cn("flex flex-col border-r border-b border-border p-6 sm:p-8", p.featured ? "bg-foreground text-[#C9D3CC]" : "bg-card")}>
              <div className="flex justify-between">
                <Label className={p.featured ? "text-[#9FB8A6]" : undefined}>{p.name}</Label>
                {p.featured && <Label className="text-highlight">Most picked</Label>}
              </div>
              <p className={cn("mt-8 text-[clamp(48px,5vw,72px)] leading-none font-medium tracking-[-0.05em]", p.featured ? "text-background" : "text-foreground")}>
                {p.price}
              </p>
              <p className={cn("label mt-2", p.featured ? "text-[#9FB8A6]" : "text-muted-foreground")}>{p.per}</p>
              <p className={cn("mt-6 text-lg", p.featured && "text-background")}>{p.blurb}</p>
              <ul className={cn("mt-6 flex-1 border-t", p.featured ? "border-[#2B4238]" : "border-border")}>
                {p.features.map((f) => (
                  <li key={f} className={cn("flex items-center gap-3 border-b py-3", p.featured ? "border-[#2B4238]" : "border-border")}>
                    <Check size={14} className={p.featured ? "text-highlight" : "text-success"} /> {f}
                  </li>
                ))}
              </ul>
              <Link href={p.cta.href} className={cn(p.featured ? btn.onDark : btn.ghost, "mt-8")}>
                {p.cta.label} <ArrowUpRight size={14} />
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-24 flex flex-wrap gap-12">
          <div className="min-w-[260px] flex-1">
            <Label>Billing questions</Label>
            <p className="mt-4 max-w-sm">
              Anything else? Email <a href={`mailto:${SITE.supportEmail}`} className="underline hover:text-foreground">{SITE.supportEmail}</a>.
            </p>
          </div>
          <div className="min-w-[300px] flex-[1.4] border-t border-foreground">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-border">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium tracking-[-0.02em] text-foreground">
                  {q}
                  <span aria-hidden className="text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pb-6 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
