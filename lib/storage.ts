import { createHash } from "node:crypto";
import { AwsClient } from "aws4fetch";

// Supabase Storage through its S3 API. The podcast_edit pipeline writes finished files here
// (connection "podcast-storage", bucket below); the app only signs links and deletes.
export const BUCKET = "podcast-outputs";

// Output field -> file name under the run's prefix. Must match the pipeline's util/template nodes.
export const FILES: Record<string, string> = {
  video: "video.mp4",
  premiere: "premiere.xml",
  fcpxml: "timeline.fcpxml",
  edl: "cut.edl",
  timeline: "timeline.json",
  edit: "edit.json",
};

const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

// Off until the env is set; the pipeline only accepts saveTo once its storage version is published.
export const storageOn = !!(S3_ENDPOINT && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY);

const s3 = storageOn
  ? new AwsClient({ accessKeyId: S3_ACCESS_KEY_ID!, secretAccessKey: S3_SECRET_ACCESS_KEY!, service: "s3", region: S3_REGION ?? "us-east-1" })
  : null;

const objectUrl = (key: string) => new URL(`${S3_ENDPOINT!.replace(/\/$/, "")}/${BUCKET}/${key.split("/").map(encodeURIComponent).join("/")}`);

// A folder per user that doesn't expose their email, and one per run under it.
export const userPrefix = (email: string) => `users/${createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 16)}`;

export async function signedUrl(key: string, expiresSec = 3600) {
  const url = objectUrl(key);
  url.searchParams.set("X-Amz-Expires", String(expiresSec));
  url.searchParams.set("response-content-disposition", `attachment; filename="${key.split("/").pop()}"`);
  const signed = await s3!.sign(url, { method: "GET", aws: { signQuery: true } });
  return signed.url;
}

export async function deleteRunFiles(prefix: string) {
  if (!s3) return;
  await Promise.all(Object.values(FILES).map((f) => s3.fetch(objectUrl(`${prefix}/${f}`), { method: "DELETE" })));
}
