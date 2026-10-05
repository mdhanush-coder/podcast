import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer, Header, Label, PageHead, btn, wrap } from "@/components/kit";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { RUNS_PER_DAY, SITE } from "@/lib/site";
import { deleteRunFiles } from "@/lib/storage";

export const metadata: Metadata = { title: "Account" };

export default async function Account() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login?callbackUrl=/account");
  const sql = await db();
  const [{ total, today }] = await sql<{ total: number; today: number }[]>`
    select count(*)::int as total,
           count(*) filter (where created_at > now() - interval '1 day')::int as today
    from runs where user_email = ${email}`;

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  // Removes everything we store about this person, then signs them out. Their Google account is untouched.
  async function deleteData() {
    "use server";
    const s = await auth();
    if (!s?.user?.email) return;
    const sql = await db();
    const rows = await sql<{ storage_prefix: string | null }[]>`select storage_prefix from runs where user_email = ${s.user.email}`;
    await Promise.all(rows.flatMap((r) => (r.storage_prefix ? [deleteRunFiles(r.storage_prefix)] : [])));
    await sql`delete from runs where user_email = ${s.user.email}`;
    await signOut({ redirectTo: "/" });
  }

  const rows = [
    ["Name", session.user?.name ?? "—"],
    ["Email", email],
    ["Plan", "Free"],
    ["Edits today", `${today} of ${RUNS_PER_DAY}`],
    ["Edits in total", String(total)],
  ];

  return (
    <>
      <Header>
        <Link href="/edits" className={btn.ghost}>My edits</Link>
      </Header>
      <main className={`${wrap} flex-1 pt-12 pb-24`}>
        <PageHead labels={["(Account)", "Signed in with Google"]} title="Account." />

        <section className="mt-14">
          <Label n={1}>Details</Label>
          <dl className="mt-4 border-t border-foreground">
            {rows.map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-4 border-b border-border py-4">
                <dt className="label text-muted-foreground">{k}</dt>
                <dd className="text-lg text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pricing" className={btn.ghost}>See plans</Link>
            <form action={logout}><button type="submit" className={btn.ghost}>Sign out</button></form>
          </div>
        </section>

        <section className="mt-20 border border-border bg-destructive-soft/40 p-6 sm:p-8">
          <Label n={2}>Delete your data</Label>
          <p className="mt-4 max-w-2xl leading-relaxed">
            This removes your edit history and every saved video and timeline, then signs you out. Raw uploads are deleted
            automatically after {SITE.retentionDays} days. To have them removed sooner, email{" "}
            <a href={`mailto:${SITE.supportEmail}`} className="underline">{SITE.supportEmail}</a>.
          </p>
          <details className="mt-6">
            <summary className={`${btn.ghost} cursor-pointer list-none border-destructive text-destructive hover:bg-destructive hover:text-background`}>
              Delete my edits
            </summary>
            <form action={deleteData} className="mt-4 flex flex-wrap items-center gap-4">
              <p className="text-destructive">This can&apos;t be undone. {total} edits and their files will be removed.</p>
              <button type="submit" className={`${btn.primary} bg-destructive hover:bg-destructive/85`}>Yes, delete everything</button>
            </form>
          </details>
        </section>
      </main>
      <Footer />
    </>
  );
}
