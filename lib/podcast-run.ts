// Inputs of the podcast_edit template (EDITOR_TEMPLATE_ID). Input nodes can't validate enums/ranges, so we do it here.
export const ENUMS = {
  footage: ["auto", "edited", "angles"],
  layout: ["auto", "single", "split", "wide"],
  reactions: ["off", "few", "normal", "many"],
  motion: ["off", "subtle", "expressive"],
  framing: ["tight", "medium", "loose"],
  pace: ["calm", "normal", "lively"],
  codec: ["h264", "hevc"],
} as const;

export const ASPECTS = ["9:16", "1:1", "4:5", "16:9"] as const;

export const DEFAULTS = {
  footage: "auto",
  aspect: "9:16",
  layout: "auto",
  reactions: "normal",
  motion: "subtle",
  framing: "medium",
  pace: "normal",
  sync: true,
  codec: "h264",
  quality: 19,
};

const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;

// Returns the request body for the template, or an error message. Unset optional fields are left out, never null/0.
export function buildPodcastInput(raw: Record<string, unknown>): { body: Record<string, unknown> } | { error: string } {
  const b: Record<string, unknown> = { ...DEFAULTS };
  for (const [k, v] of Object.entries(raw)) if (v != null && v !== "") b[k] = v;

  if (!isStr(b.input)) return { error: "input is required" };
  if (b.audio != null && !isStr(b.audio)) return { error: "audio must be a string" };
  if (Array.isArray(b.cameras) && b.cameras.length === 0) delete b.cameras;
  if (b.cameras != null && !(Array.isArray(b.cameras) && b.cameras.every(isStr)))
    return { error: "cameras must be an array of strings" };
  for (const [k, allowed] of Object.entries(ENUMS))
    if (!(allowed as readonly unknown[]).includes(b[k])) return { error: `${k} must be one of ${allowed.join("|")}` };
  if (typeof b.aspect !== "string" || !/^\d+:\d+$/.test(b.aspect)) return { error: "aspect must be W:H" };
  if (b.height != null && !(Number.isInteger(b.height) && (b.height as number) >= 64 && (b.height as number) <= 4096))
    return { error: "height must be an integer 64-4096" };
  if (typeof b.sync !== "boolean") return { error: "sync must be boolean" };
  if (b.title != null && !(typeof b.title === "string" && b.title.length <= 200)) return { error: "title must be 1-200 chars" };
  const q = b.quality as number;
  if (typeof q !== "number" || q < 10 || q > 40) return { error: "quality must be 10-40" };

  const keys = ["input", "cameras", "audio", "height", "title", ...Object.keys(DEFAULTS)];
  return { body: Object.fromEntries(keys.filter((k) => b[k] != null).map((k) => [k, b[k]])) };
}
