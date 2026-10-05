import { enginex } from "@/lib/enginex";
import { unauthorized, userEmail } from "@/lib/auth";

// Same formats the studio dropzones accept.
const ALLOWED = /\.(mp4|mov|wav|mp3|m4a)$/i;

// Presigned PUT for one input file. The browser uploads the bytes straight to storage.
// ponytail: size isn't enforced here (presign doesn't take one); enforce in the bucket policy if abuse shows up.
export async function POST(request: Request) {
  if (!(await userEmail())) return unauthorized();
  const { filename } = await request.json().catch(() => ({}));
  if (typeof filename !== "string" || !filename || filename.length > 300)
    return Response.json({ error: { message: "filename required" } }, { status: 400 });
  if (!ALLOWED.test(filename))
    return Response.json({ error: { message: "Use MP4 or MOV for video, and WAV, MP3 or M4A for audio." } }, { status: 400 });
  const { status, data } = await enginex("/v1/uploads", { filename });
  return Response.json(data, { status });
}
