import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = { mongo: false, drive: false };
  let dbState = "unknown";

  try {
    await connectDB();
    // ping the primary
    await mongoose.connection.db?.admin().ping();
    checks.mongo = true;
    dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch (e) {
    checks.mongo = false;
    dbState = (e as Error).message;
  }

  // Drive check is wired in Phase 1 (google-drive lib). Stub for now.
  checks.drive = false;

  const ok = checks.mongo;
  return NextResponse.json(
    { ok, db: dbState, checks, time: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}
