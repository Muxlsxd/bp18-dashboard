import { connectDB } from "@/lib/mongodb";
import { Task } from "@/lib/models/Task";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter: Record<string, unknown> = {};
  const status = searchParams.get("status");
  const assignee = searchParams.get("assignee");
  if (status) filter.status = status;
  if (assignee) filter.assignee = assignee;

  const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
  return Response.json({ tasks });
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json().catch(() => null);
  if (!body || !body.projectId || !body.title) {
    return Response.json({ error: "projectId and title required" }, { status: 400 });
  }
  const task = await Task.create(body);
  return Response.json({ task }, { status: 201 });
}
