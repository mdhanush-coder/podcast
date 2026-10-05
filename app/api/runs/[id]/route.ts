// Upstream EngineX run/sign bodies are undocumented beyond prose, so they stay loosely typed.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { enginex } from "@/lib/enginex";
import { unauthorized, userEmail } from "@/lib/auth";
import { db } from "@/lib/db";

const FILE_OUTPUTS = ["video", "premiere", "fcpxml", "edl", "timeline", "edit"];

// Run status plus signed URLs for its file outputs, once they exist. Only the owner can see a run.
export async function GET(_req: Request, ctx: RouteContext<"/api/runs/[id]">) {
  const email = await userEmail();
  if (!email) return unauthorized();
  const { id } = await ctx.params;
  const sql = await db();
  const [owned] = await sql`select 1 from runs where id = ${id} and user_email = ${email}`;
  if (!owned) return Response.json({ error: { message: "This edit doesn't exist or belongs to another account." } }, { status: 404 });

  const { status, data: run } = await enginex(`/v1/runs/${encodeURIComponent(id)}`);
  if (status !== 200) return Response.json(run, { status });

  const outputs = run.outputs ?? run.output ?? run.result ?? {};
  const keys = FILE_OUTPUTS.map((f) => outputs[f]).filter((k): k is string => typeof k === "string");
  let urls: Record<string, string> = {};
  if (keys.length) {
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
