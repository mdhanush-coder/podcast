// Upstream EngineX run/sign bodies are undocumented beyond prose, so they stay loosely typed.
/* eslint-disable @typescript-eslint/no-explicit-any */
// Server-side EngineX call. Returns the upstream JSON and status so routes can pass both through.
export async function enginex(path: string, body?: unknown): Promise<{ status: number; data: any }> {
  const key = process.env.EDITOR_API_KEY;
  if (!key) return { status: 500, data: { error: { code: "no_key", message: "EDITOR_API_KEY not set" } } };
  const res = await fetch(`https://enginex.run${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({ error: { code: "bad_response", message: `EngineX returned ${res.status}` } }));
  return { status: res.status, data };
}
