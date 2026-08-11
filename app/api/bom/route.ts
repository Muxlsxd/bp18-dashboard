import { connectDB } from "@/lib/mongodb";
import { BOM } from "@/lib/models/BOM";
import { withErrorHandler } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  return withErrorHandler(async (req, ctx) => {
    await connectDB();
    const bom = await BOM.find().sort({ createdAt: -1 }).lean();
    return Response.json({ bom });
  })(new Request("http://localhost/api/bom"), { params: Promise.resolve({}) });
}

// Bulk import (expects JSON array in body)
export async function POST(req: Request) {
  return withErrorHandler(async (req, ctx) => {
    await connectDB();
    const body = await req.json().catch(() => null);
    if (!Array.isArray(body)) return Response.json({ error: "array of BOM rows required" }, { status: 400 });
    if (body.length === 0) return Response.json({ error: "empty array" }, { status: 400 });
    if (body.length > 500) return Response.json({ error: "too many rows (max 500)" }, { status: 413 });
    const created = await BOM.insertMany(body);
    return Response.json({ created: created.length }, { status: 201 });
  })(req, { params: Promise.resolve({}) });
}
