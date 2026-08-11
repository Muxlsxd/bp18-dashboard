import { connectDB } from "@/lib/mongodb";
import { File } from "@/lib/models/File";
import { listFilesInFolder, PARENT_FOLDER_ID } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

// Called by cron / scheduler. Syncs modifiedTime from Drive into Mongo metadata.
export async function POST() {
  await connectDB();
  try {
    const remote = await listFilesInFolder(PARENT_FOLDER_ID);
    const alerts: string[] = [];
    for (const f of remote) {
      const rec = await File.findOne({ googleFileId: f.id });
      if (!rec) continue;
      const remoteTime = f.modifiedTime ? new Date(f.modifiedTime).getTime() : 0;
      const localTime = rec.updatedAt ? new Date(rec.updatedAt).getTime() : 0;
      if (remoteTime > localTime + 1000) {
        alerts.push(`File ${rec.name} changed on Drive (${f.modifiedTime}) but status not updated in DB`);
      }
    }
    return Response.json({ ok: true, scanned: remote.length, alerts });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
