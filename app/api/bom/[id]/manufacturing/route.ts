import { connectDB } from "@/lib/mongodb";
import { BOM } from "@/lib/models/BOM";
import { withErrorHandler, isValidObjectId } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const STATUSES = ["waiting", "cutting", "welding", "QC", "done"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandler(async (req, ctx) => {
    if (!isValidObjectId(id)) return Response.json({ error: "invalid id" }, { status: 400 });
    await connectDB();
    const body = await req.json().catch(() => null);
    if (!body || !body.manufacturingStatus) {
      return Response.json({ error: "manufacturingStatus required" }, { status: 400 });
    }
    if (!STATUSES.includes(body.manufacturingStatus)) {
      return Response.json({ error: "invalid manufacturingStatus" }, { status: 400 });
    }
    const bom = await BOM.findByIdAndUpdate(
      id,
      { manufacturingStatus: body.manufacturingStatus },
      { new: true }
    ).lean();
    if (!bom) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ bom });
  })(req, { params: Promise.resolve({ id }) });
}
