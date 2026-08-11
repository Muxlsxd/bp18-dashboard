import { connectDB } from "@/lib/mongodb";
import { BOM } from "@/lib/models/BOM";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const bom = await BOM.find().sort({ createdAt: -1 }).lean();
  return Response.json({ bom });
}

// Bulk import from CSV (minimum viable: expects JSON array in body for now)
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) return Response.json({ error: "array of BOM rows required" }, { status: 400 });
  const created = await BOM.insertMany(body);
  return Response.json({ created: created.length }, { status: 201 });
}
