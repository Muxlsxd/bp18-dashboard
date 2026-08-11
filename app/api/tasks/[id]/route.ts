import { connectDB } from "@/lib/mongodb";
import { Task } from "@/lib/models/Task";
import { withErrorHandler, isValidObjectId } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandler(async (req, ctx) => {
    if (!isValidObjectId(id)) return Response.json({ error: "invalid id" }, { status: 400 });
    await connectDB();
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: "body required" }, { status: 400 });
    const task = await Task.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!task) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ task });
  })(req, { params: Promise.resolve({ id }) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandler(async (req, ctx) => {
    if (!isValidObjectId(id)) return Response.json({ error: "invalid id" }, { status: 400 });
    await connectDB();
    const res = await Task.findByIdAndDelete(id);
    if (!res) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ ok: true });
  })(_req, { params: Promise.resolve({ id }) });
}
