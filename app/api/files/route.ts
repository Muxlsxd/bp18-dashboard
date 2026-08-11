import { connectDB } from "@/lib/mongodb";
import { File as FileModel } from "@/lib/models/File";
import { storeFileInMongo, deleteFileFromMongo } from "@/lib/file-storage";
import { logActivity } from "@/lib/activity";
import { withErrorHandler, isValidObjectId } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["CAD", "DRW", "BOM", "FEA_Report"];

// List files (metadata stored in Mongo)
export async function GET(req: Request) {
  return withErrorHandler(async (req, ctx) => {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    const files = await FileModel.find(filter).sort({ createdAt: -1 }).lean();
    return Response.json({ files });
  })(req, { params: Promise.resolve({}) });
}

// Upload: multipart/form-data -> GridFS (Mongo) -> Mongo metadata
export async function POST(req: Request) {
  return withErrorHandler(async (req, ctx) => {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return Response.json({ error: "use multipart/form-data with a 'file' field" }, { status: 400 });
    }
    await connectDB();
    const form = await req.formData();
    const rawFile = form.get("file");
    if (!(rawFile instanceof File)) {
      return Response.json({ error: "file field required" }, { status: 400 });
    }
    const file = rawFile;
    const projectId = (form.get("projectId") as string) || "";
    if (!projectId || !isValidObjectId(projectId)) {
      return Response.json({ error: "valid projectId required" }, { status: 400 });
    }
    const type = (form.get("type") as string) || "CAD";
    if (!ALLOWED_TYPES.includes(type)) {
      return Response.json({ error: "invalid type (CAD/DRW/BOM/FEA_Report)" }, { status: 400 });
    }
    const name = (form.get("name") as string) || file.name || "untitled";
    if (file.size > MAX_UPLOAD_SIZE) {
      return Response.json({ error: "file too large (max 50MB)" }, { status: 413 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const mongoFileId = await storeFileInMongo(buf, name, file.type || "application/octet-stream");

    try {
      const existing = await FileModel.findOne({ projectId, name, type }).sort({ version: -1 });
      const record = await FileModel.create({
        projectId,
        name,
        type,
        status: "draft",
        storage: "mongo",
        mongoFileId,
        version: existing ? existing.version + 1 : 1,
        previousVersionId: existing ? existing._id : null,
      });
      await logActivity(`Uploaded ${name} (${type}) v${record.version}`, "upload");
      return Response.json({ file: record }, { status: 201 });
    } catch (e) {
      // rollback orphaned GridFS chunk on metadata failure
      await deleteFileFromMongo(mongoFileId).catch(() => {});
      throw e;
    }
  })(req, { params: Promise.resolve({}) });
}
