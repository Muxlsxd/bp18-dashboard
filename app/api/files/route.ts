import { connectDB } from "@/lib/mongodb";
import { File as FileModel } from "@/lib/models/File";
import { storeFileInMongo } from "@/lib/file-storage";

export const dynamic = "force-dynamic";

// List files (metadata stored in Mongo)
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  const files = await FileModel.find(filter).sort({ createdAt: -1 }).lean();
  return Response.json({ files });
}

// Upload: multipart/form-data -> GridFS (Mongo) -> Mongo metadata
export async function POST(req: Request) {
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
  const projectId = (form.get("projectId") as string) || null;
  const type = (form.get("type") as string) || "CAD";
  const name = (form.get("name") as string) || "untitled";

  const buf = Buffer.from(await file.arrayBuffer());

  // Store binary in GridFS (Mongo). Drive path is a drop-in alternative when quota allows.
  let mongoFileId: string;
  try {
    mongoFileId = await storeFileInMongo(buf, name, file.type || "application/octet-stream");
  } catch (e) {
    return Response.json({ error: "storage failed: " + (e as Error).message }, { status: 502 });
  }

  const existing = projectId
    ? await FileModel.findOne({ projectId, name, type }).sort({ version: -1 })
    : null;

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

  return Response.json({ file: record }, { status: 201 });
}
