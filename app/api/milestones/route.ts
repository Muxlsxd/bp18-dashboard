import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";

export async function GET() {
  try {
    await connectDB();
    const project = await Project.findOne({ isArchived: false }).lean();
    const milestones = (project?.milestones || []).map((m: any) => ({
      name: m.name,
      dueDate: m.dueDate,
      status: m.status,
    }));
    return NextResponse.json({ milestones });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
