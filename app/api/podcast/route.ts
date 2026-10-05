import { buildPodcastInput } from "@/lib/podcast-run";
import { enginex } from "@/lib/enginex";

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") return Response.json({ error: { message: "JSON body required" } }, { status: 400 });

  const built = buildPodcastInput(raw);
  if ("error" in built) return Response.json({ error: { message: built.error } }, { status: 400 });

  const template = process.env.EDITOR_TEMPLATE_ID;
  if (!template) return Response.json({ error: { message: "EDITOR_TEMPLATE_ID not set" } }, { status: 500 });
  const { status, data } = await enginex(`/v1/run/${template}`, built.body);
  return Response.json(data, { status });
}
