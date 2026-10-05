import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Footer, Header, PageHead, btn, wrap } from "@/components/kit";
import { userEmail } from "@/lib/auth";
import { db, type RunRow } from "@/lib/db";
import { RUNS_PER_DAY } from "@/lib/site";

export const metadata: Metadata = { title: "My edits" };

const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

// ponytail: shows the newest 200 and no live status (that needs one EngineX call per row); paginate when people pass that.
export default async function Edits() {
  const email = await userEmail();
  if (!email) redirect("/login?callbackUrl=/edits");
  const sql = await db();
  const [runs, [{ today }]] = await Promise.all([
    sql<RunRow[]>`select id, title, settings, created_at from runs where user_email = ${email} order by created_at desc limit 200`,
    sql<{ today: number }[]>`select count(*)::int as today from runs where user_email = ${email} and created_at > now() - interval '1 day'`,
  ]);

  return (
    <>
      <Header>
        <nav className="flex items-center gap-1">
          <Link href="/account" className="hidden min-h-11 items-center px-3 text-[15px] text-muted-foreground hover:text-foreground sm:flex">account</Link>
          <Link href="/studio" className={btn.primary}>New edit</Link>
        </nav>
      </Header>
      <main className={`${wrap} flex-1 pt-12 pb-24`}>
        <PageHead labels={["(My edits)", `${runs.length} total`, `Today: ${today} of ${RUNS_PER_DAY}`]} title="Your edits." />

        {runs.length === 0 ? (
          <section className="mt-14 border border-border bg-card p-8">
            <p className="text-[clamp(22px,2.6vw,32px)] font-medium tracking-[-0.04em] text-foreground">No edits yet.</p>
            <p className="mt-3 max-w-lg">Upload an episode and your first edit shows up here, with its video and timelines.</p>
            <Link href="/studio" className={`${btn.primary} mt-6`}>Start your first edit <ArrowUpRight size={14} /></Link>
          </section>
        ) : (
          <ul className="mt-14 border-t border-foreground">
            {runs.map((r, i) => {
              const s = r.settings as Record<string, string | undefined>;
              const tags = [s.aspect, s.footage === "angles" ? "multi-camera" : null, s.layout && `${s.layout} layout`].filter(Boolean);
              return (
                <li key={r.id}>
                  <Link href={`/runs/${r.id}`} className="group flex flex-wrap items-center gap-x-10 gap-y-2 border-b border-border py-6 hover:bg-card">
                    <span className="label w-16 text-muted-foreground">({String(i + 1).padStart(2, "0")})</span>
                    <span className="min-w-[220px] flex-1 text-[clamp(22px,2.6vw,32px)] font-medium tracking-[-0.04em] text-foreground">
                      {r.title || "Untitled edit"}
                    </span>
                    <span className="flex min-w-[180px] flex-wrap gap-1.5">
                      {tags.map((t) => <span key={t} className="rounded-full border border-border px-3 py-1 text-sm capitalize">{t}</span>)}
                    </span>
                    <span className="label w-44 text-right text-muted-foreground group-hover:text-foreground">{date.format(r.created_at)} →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
