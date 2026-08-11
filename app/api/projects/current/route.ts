import { connectDB } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";
import { Task } from "@/lib/models/Task";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const project = await Project.findOne().sort({ createdAt: -1 }).lean();
  if (!project) return Response.json({ project: null, kpi: null });

  const tasks = await Task.find({ projectId: project._id }).lean();
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  return Response.json({
    project,
    kpi: { totalTasks: total, done, inProgress, progress },
  });
}

export async function PATCH(req: Request) {
  await connectDB();
  const body = await req.json().catch(() => ({}));
  if (typeof body.currentWeight !== "number") {
    return Response.json({ error: "currentWeight (number) required" }, { status: 400 });
  }
  const project = await Project.findOne().sort({ createdAt: -1 });
  if (!project) return Response.json({ error: "no project" }, { status: 404 });

  project.currentWeight = body.currentWeight;
  project.weightHistory.push({ timestamp: new Date(), weight: body.currentWeight, note: body.note || "" });
  await project.save();
  return Response.json({ project });
}
