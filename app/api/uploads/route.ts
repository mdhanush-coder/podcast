import { enginex } from "@/lib/enginex";

// Presigned PUT for one input file. The browser uploads the bytes straight to storage.
export async function POST(request: Request) {
  const { filename } = await request.json().catch(() => ({}));
  if (typeof filename !== "string" || !filename || filename.length > 300)
    return Response.json({ error: { message: "filename required" } }, { status: 400 });
  const { status, data } = await enginex("/v1/uploads", { filename });
  return Response.json(data, { status });
}
