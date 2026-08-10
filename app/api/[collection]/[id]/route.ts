import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCollectionMeta } from "@/lib/collections";

// PATCH /api/[collection]/[id] -> update
// DELETE /api/[collection]/[id] -> delete
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection: slug, id } = await params;
  const meta = getCollectionMeta(slug);
  if (!meta) return NextResponse.json({ error: "unknown collection" }, { status: 404 });
  try {
    const body = await req.json();
    const cleaned: Record<string, any> = {};
    for (const f of meta.fields) {
      if (body[f.key] !== undefined) cleaned[f.key] = body[f.key];
    }
    await connectDB();
    const db = (await connectDB()).connection.db!;
    const res = await db
      .collection(meta.collection)
      .updateOne({ _id: new (await import("mongodb")).ObjectId(id) }, { $set: cleaned });
    return NextResponse.json({ success: true, modified: res.modifiedCount });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection: slug, id } = await params;
  const meta = getCollectionMeta(slug);
  if (!meta) return NextResponse.json({ error: "unknown collection" }, { status: 404 });
  try {
    await connectDB();
    const db = (await connectDB()).connection.db!;
    const res = await db
      .collection(meta.collection)
      .deleteOne({ _id: new (await import("mongodb")).ObjectId(id) });
    return NextResponse.json({ success: true, deleted: res.deletedCount });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
