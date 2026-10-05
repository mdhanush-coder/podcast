import { buildPodcastInput } from "@/lib/podcast-run";
import { enginex } from "@/lib/enginex";
import { unauthorized, userEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { RUNS_PER_DAY } from "@/lib/site";

export async function POST(request: Request) {
  const email = await userEmail();
  if (!email) return unauthorized();

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") return Response.json({ error: { message: "JSON body required" } }, { status: 400 });

  const built = buildPodcastInput(raw);
  if ("error" in built) return Response.json({ error: { message: built.error } }, { status: 400 });

  const template = process.env.EDITOR_TEMPLATE_ID;
  if (!template) return Response.json({ error: { message: "EDITOR_TEMPLATE_ID not set" } }, { status: 500 });

  // ponytail: count-then-insert can let two simultaneous requests both pass; fine for a daily cap.
  const sql = await db();
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from runs where user_email = ${email} and created_at > now() - interval '1 day'`;
  if (n >= RUNS_PER_DAY)
    return Response.json({ error: { message: `You've reached today's limit of ${RUNS_PER_DAY} edits. It resets 24 hours after your earliest edit today.` } }, { status: 429 });

  const { status, data } = await enginex(`/v1/run/${template}`, built.body);
  const runId = data?.runId ?? data?.id;
  if (status < 300 && typeof runId === "string") {
    const title = typeof built.body.title === "string" ? built.body.title : null;
    await sql`insert into runs (id, user_email, title, settings)
      values (${runId}, ${email}, ${title}, ${sql.json(built.body as never)})`;
  }
  return Response.json(data, { status });
}
