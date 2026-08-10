import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCollectionMeta } from "@/lib/collections";

// GET /api/[collection] -> list
// POST /api/[collection] -> create
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection: slug } = await params;
  const meta = getCollectionMeta(slug);
  if (!meta) return NextResponse.json({ error: "unknown collection" }, { status: 404 });
  try {
    await connectDB();
    const db = (await connectDB()).connection.db!;
    const rows = await db.collection(meta.collection).find({}).toArray();
    return NextResponse.json({ rows: rows.map((r) => ({ ...r, id: String(r._id) })) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection: slug } = await params;
  const meta = getCollectionMeta(slug);
  if (!meta) return NextResponse.json({ error: "unknown collection" }, { status: 404 });
  try {
    const body = await req.json();
    const cleaned: Record<string, any> = {};
    for (const f of meta.fields) {
      if (body[f.key] !== undefined && body[f.key] !== "") cleaned[f.key] = body[f.key];
    }
    await connectDB();
    const db = (await connectDB()).connection.db!;
    const res = await db.collection(meta.collection).insertOne({ ...cleaned, createdAt: new Date() });
    return NextResponse.json({ success: true, id: String(res.insertedId) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
