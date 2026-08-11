import { connectDB } from "@/lib/mongodb";
import { BOM } from "@/lib/models/BOM";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || !body.manufacturingStatus) {
    return Response.json({ error: "manufacturingStatus required" }, { status: 400 });
  }
  const bom = await BOM.findByIdAndUpdate(id, { manufacturingStatus: body.manufacturingStatus }, { new: true }).lean();
  if (!bom) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ bom });
}
