import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Footer, Header, Label, PageHead, btn, wrap } from "@/components/kit";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Get help with an edit, ask about plans, or report a problem." };

const SUBJECTS: Record<string, string> = { pro: "Pro plan", team: "Team plan" };

// ponytail: mailto instead of a form + email service; add a form when inbound volume needs triage.
export default async function Contact({ searchParams }: PageProps<"/contact">) {
  const { topic } = await searchParams;
  const planSubject = typeof topic === "string" ? SUBJECTS[topic] : undefined;
  const mail = (subject: string) => `mailto:${SITE.supportEmail}?subject=${encodeURIComponent(subject)}`;

  const TOPICS = [
    ["An edit didn't finish", "Include the link to the edit page. We can see what went wrong from the run.", "Help with an edit"],
    ["Plans and billing", "Pro and Team plans, invoices, or higher limits.", planSubject ?? "Plans and billing"],
    ["Your data", "Ask for your footage to be deleted early, or for a copy of what we store.", "Data request"],
    ["Anything else", "Feedback, ideas or partnerships.", "Hello"],
  ];

  return (
    <>
      <Header>
        <Link href="/studio" className={btn.primary}>Start editing</Link>
      </Header>
      <main className={`${wrap} flex-1 pt-12 pb-24`}>
        <PageHead labels={["(Contact)", "A person reads every email"]} title="Talk to a person.">
          Email <a href={mail(planSubject ?? "Hello")} className="text-foreground underline">{SITE.supportEmail}</a>, or pick a topic below so it reaches the right place.
        </PageHead>

        <ul className="mt-16 border-t border-foreground">
          {TOPICS.map(([title, body, subject], i) => (
            <li key={title}>
              <a href={mail(subject)} className="group flex flex-wrap items-baseline gap-x-10 gap-y-2 border-b border-border py-8 hover:bg-card">
                <span className="label w-16 text-muted-foreground">({String(i + 1).padStart(2, "0")})</span>
                <span className="min-w-[220px] flex-1 text-[clamp(24px,3vw,40px)] font-medium tracking-[-0.04em] text-foreground">{title}</span>
                <span className="min-w-[240px] max-w-md flex-1 leading-relaxed">{body}</span>
                <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-foreground" />
              </a>
            </li>
          ))}
        </ul>

        <section className="mt-16 flex flex-wrap gap-12">
          <div className="min-w-[240px] flex-1">
            <Label>Company</Label>
            <p className="mt-3">{SITE.legalName}</p>
            <p className="text-muted-foreground">{SITE.address}</p>
          </div>
          <div className="min-w-[240px] flex-1">
            <Label>Before you write</Label>
            <p className="mt-3 max-w-sm">
              Most questions about files, sync and exports are answered in the <Link href="/#faq" className="underline hover:text-foreground">FAQ</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
