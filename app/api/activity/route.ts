import { connectDB } from "@/lib/mongodb";
import { ActivityLog } from "@/lib/models/ActivityLog";
import { logActivity, type ActivityType } from "@/lib/activity";

export const dynamic = "force-dynamic";

// GET latest activity (used by dashboard / TV alerts)
export async function GET() {
  await connectDB();
  const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(10).lean();
  return Response.json({ logs });
}

// POST internal: { message, type }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !body.message) {
    return Response.json({ error: "message required" }, { status: 400 });
  }
  const type = (body.type as ActivityType) || "upload";
  const log = await logActivity(body.message, type);
  // logActivity returns void; refetch the created doc id
  const created = await ActivityLog.findOne().sort({ timestamp: -1 }).lean();
  return Response.json({ log: created }, { status: 201 });
}
