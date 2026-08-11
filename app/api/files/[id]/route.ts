import { connectDB } from "@/lib/mongodb";
import { File as FileModel } from "@/lib/models/File";
import { readFileFromMongo, deleteFileFromMongo } from "@/lib/file-storage";
import { logActivity } from "@/lib/activity";
import { withErrorHandler, isValidObjectId } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandler(async (req, ctx) => {
    if (!isValidObjectId(id)) return Response.json({ error: "invalid id" }, { status: 400 });
    await connectDB();
    const record = await FileModel.findById(id);
    if (!record) return Response.json({ error: "not found" }, { status: 404 });
    if (!record.mongoFileId) return Response.json({ error: "no binary stored" }, { status: 404 });
    const buf = await readFileFromMongo(record.mongoFileId.toString());
    const bytes = new Uint8Array(buf);
    const safeName = record.name.replace(/["\r\n]/g, "_");
    return new Response(new Blob([bytes]), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeName}"`,
      },
    });
  })(_req, { params: Promise.resolve({ id }) });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandler(async (req, ctx) => {
    if (!isValidObjectId(id)) return Response.json({ error: "invalid id" }, { status: 400 });
    await connectDB();
    const body = await req.json().catch(() => ({}));
    if (!body || Object.keys(body).length === 0) {
      return Response.json({ error: "empty update" }, { status: 400 });
    }
    const update: Record<string, unknown> = {};
    if (body.lock !== undefined) {
      update.isLocked = body.lock;
      update.lockedAt = body.lock ? new Date() : null;
      if (body.lockedBy) update.lockedBy = body.lockedBy;
    }
    if (body.status) update.status = body.status;
    const file = await FileModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!file) return Response.json({ error: "not found" }, { status: 404 });
    if (body.status && body.status !== "draft") {
      await logActivity(`File ${file.name} → ${body.status}`, "approve");
    }
    return Response.json({ file });
  })(req, { params: Promise.resolve({ id }) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandler(async (req, ctx) => {
    if (!isValidObjectId(id)) return Response.json({ error: "invalid id" }, { status: 400 });
    await connectDB();
    const res = await FileModel.findByIdAndDelete(id);
    if (!res) return Response.json({ error: "not found" }, { status: 404 });
    if (res.mongoFileId) {
      await deleteFileFromMongo(res.mongoFileId.toString()).catch(() => {});
    }
    await logActivity(`Deleted file ${res.name}`, "delete");
    return Response.json({ ok: true });
  })(_req, { params: Promise.resolve({ id }) });
}
