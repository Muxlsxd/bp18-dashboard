import { connectDB } from "@/lib/mongodb";
import { Task } from "@/lib/models/Task";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "body required" }, { status: 400 });
  const task = await Task.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!task) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ task });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const res = await Task.findByIdAndDelete(id);
  if (!res) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
}
