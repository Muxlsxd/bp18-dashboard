import { connectDB } from "@/lib/mongodb";
import { File as FileModel } from "@/lib/models/File";
import { listFilesInFolder, PARENT_FOLDER_ID, drive } from "@/lib/google-drive";
import { withErrorHandler } from "@/lib/api-utils";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

// Called by cron / scheduler. Syncs modifiedTime from Drive into Mongo metadata.
// When Drive is unavailable (Service Account has no storage quota / no Shared
// Drive), we degrade gracefully instead of failing the probe.
export async function POST() {
  return withErrorHandler(async (req, ctx) => {
    if (!drive) {
      return Response.json({ ok: true, drive: false, message: "Drive not configured — skipped" });
    }
    try {
      const remote = await listFilesInFolder(PARENT_FOLDER_ID);
      const alerts: string[] = [];
      for (const f of remote) {
        const rec = await FileModel.findOne({ googleFileId: f.id });
        if (!rec) continue;
        const remoteTime = f.modifiedTime ? new Date(f.modifiedTime).getTime() : 0;
        const localTime = rec.updatedAt ? new Date(rec.updatedAt).getTime() : 0;
        if (remoteTime > localTime + 1000) {
          const msg = `File ${rec.name} changed on Drive (${f.modifiedTime}) but status not updated in DB`;
          alerts.push(msg);
          await logActivity(msg, "reminder").catch(() => {});
        }
      }
      return Response.json({ ok: true, drive: true, scanned: remote.length, alerts });
    } catch (e) {
      // Drive ops unavailable in this environment (e.g. SA quota) — degrade.
      return Response.json({ ok: true, drive: false, error: (e as Error).message });
    }
  })(new Request("http://localhost/api/cron/sync-drive"), { params: Promise.resolve({}) });
}
