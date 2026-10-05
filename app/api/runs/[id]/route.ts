// Upstream EngineX run/sign bodies are undocumented beyond prose, so they stay loosely typed.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { enginex } from "@/lib/enginex";
import { unauthorized, userEmail } from "@/lib/auth";
import { db, dbOn } from "@/lib/db";
import { FILES, signedUrl, storageOn } from "@/lib/storage";

// Run status plus signed URLs for its file outputs, once they exist. Only the owner can see a run.
export async function GET(_req: Request, ctx: RouteContext<"/api/runs/[id]">) {
  const email = await userEmail();
  if (!email) return unauthorized();
  const { id } = await ctx.params;
  const sql = dbOn ? await db() : null;
  const [owned] = sql
    ? await sql<{ storage_prefix: string | null }[]>`select storage_prefix from runs where id = ${id} and user_email = ${email}`
    : [{ storage_prefix: null }];
  if (!owned) return Response.json({ error: { message: "This edit doesn't exist or belongs to another account." } }, { status: 404 });

  const { status, data: run } = await enginex(`/v1/runs/${encodeURIComponent(id)}`);
  if (status !== 200) return Response.json(run, { status });

  const outputs = run.outputs ?? run.output ?? run.result ?? {};
  const keys = Object.keys(FILES).map((f) => outputs[f]).filter((k): k is string => typeof k === "string");
  let urls: Record<string, string> = {};
  const prefix = owned.storage_prefix;
  if (prefix && storageOn && outputs.saved) {
    // Saved copies in our bucket outlive EngineX retention. Keyed by the EngineX key, which is what the page looks up.
    const entries = await Promise.all(
      Object.entries(FILES).filter(([f]) => typeof outputs[f] === "string").map(async ([f, name]) => [outputs[f], await signedUrl(`${prefix}/${name}`)]),
    );
    urls = Object.fromEntries(entries);
  } else if (keys.length) {
    const signed = await enginex("/v1/outputs/sign", { keys, download: true });
    urls = toUrlMap(signed.data);
  }
  // While running, the step's job carries the worker and a progress fraction.
  let job = null;
  const live = (run.steps ?? []).find((s: any) => s.job && s.status === "running");
  if (live) {
    const j = await enginex(`/v1/jobs/${live.job}`);
    if (j.status === 200) job = { progress: j.data.progress ?? 0, pod: j.data.pod ?? null, startedAt: j.data.timings?.startedAt ?? null };
  }
  return Response.json({ run, outputs, urls, job });
}

// The sign response is "a signed URL per key"; accept a map or a list.
function toUrlMap(d: any): Record<string, string> {
  const v = d?.urls ?? d?.signed ?? d;
  if (Array.isArray(v)) return Object.fromEntries(v.map((x) => [x.key, x.downloadUrl ?? x.url]));
  if (v && typeof v === "object")
    return Object.fromEntries(Object.entries(v).map(([k, x]: [string, any]) => [k, typeof x === "string" ? x : x?.downloadUrl ?? x?.url]));
  return {};
}
