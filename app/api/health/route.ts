import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { drive } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

// Health probe. `db` is the hard requirement; `drive` is reported as a
// degraded/optional capability (Service Accounts often lack storage quota,
// so Drive ops may be unavailable even when auth works).
export async function GET() {
  const checks = { mongo: false, drive: false };
  let dbState = "unknown";

  try {
    await connectDB();
    await mongoose.connection.db?.admin().ping();
    checks.mongo = true;
    dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch (e) {
    checks.mongo = false;
    dbState = (e as Error).message;
  }

  if (drive) {
    try {
      await drive.about.get({ fields: "storageQuota" });
      checks.drive = true;
    } catch {
      checks.drive = false; // optional capability unavailable
    }
  }

  // Only DB is required for the app to be "ok" (files live in MongoDB GridFS).
  const ok = checks.mongo;
  return NextResponse.json(
    { ok, db: dbState, checks, time: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}
