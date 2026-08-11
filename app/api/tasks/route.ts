import { connectDB } from "@/lib/mongodb";
import { Task } from "@/lib/models/Task";
import { withErrorHandler, isValidObjectId } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withErrorHandler(async (req, ctx) => {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter: Record<string, unknown> = {};
    const status = searchParams.get("status");
    const assignee = searchParams.get("assignee");
    if (status) filter.status = status;
    if (assignee) {
      if (!isValidObjectId(assignee)) return Response.json({ error: "invalid assignee id" }, { status: 400 });
      filter.assignee = assignee;
    }
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    return Response.json({ tasks });
  })(req, { params: Promise.resolve({}) });
}

export async function POST(req: Request) {
  return withErrorHandler(async (req, ctx) => {
    await connectDB();
    const body = await req.json().catch(() => null);
    if (!body || !body.projectId || !body.title) {
      return Response.json({ error: "projectId and title required" }, { status: 400 });
    }
    if (!isValidObjectId(body.projectId)) {
      return Response.json({ error: "invalid projectId" }, { status: 400 });
    }
    const task = await Task.create(body);
    return Response.json({ task }, { status: 201 });
  })(req, { params: Promise.resolve({}) });
}
