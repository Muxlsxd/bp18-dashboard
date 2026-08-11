import { connectDB } from "@/lib/mongodb";
import { File as FileModel } from "@/lib/models/File";
import { readFileFromMongo, deleteFileFromMongo } from "@/lib/file-storage";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const record = await FileModel.findById(id);
  if (!record) return Response.json({ error: "not found" }, { status: 404 });
  if (record.storage === "drive" && record.googleFileId) {
    // Drive-backed file would stream from Drive here. Falls back below.
  }
  if (!record.mongoFileId) return Response.json({ error: "no binary stored" }, { status: 404 });
  try {
    const buf = await readFileFromMongo(record.mongoFileId.toString());
    const bytes = new Uint8Array(buf);
    return new Response(new Blob([bytes]), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${record.name}"`,
      },
    });
  } catch (e) {
    return Response.json({ error: "download failed: " + (e as Error).message }, { status: 502 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  if (body.lock !== undefined) {
    update.isLocked = body.lock;
    update.lockedAt = body.lock ? new Date() : null;
    if (body.lockedBy) update.lockedBy = body.lockedBy;
  }
  if (body.status) update.status = body.status;
  const file = await FileModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!file) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ file });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const res = await FileModel.findByIdAndDelete(id);
  if (!res) return Response.json({ error: "not found" }, { status: 404 });
  if (res.mongoFileId) {
    try {
      await deleteFileFromMongo(res.mongoFileId.toString());
    } catch {
      // ignore gridfs delete failure
    }
  }
  return Response.json({ ok: true });
}
