import { connectDB } from "@/lib/mongodb";
import { ActivityLog } from "@/lib/models/ActivityLog";

export type ActivityType = "upload" | "approve" | "reminder" | "meeting" | "delete" | "weight" | "task";

export async function logActivity(message: string, type: ActivityType = "upload") {
  try {
    await connectDB();
    await ActivityLog.create({ message, type, isRead: false });
  } catch {
    // activity logging is best-effort
  }
}
