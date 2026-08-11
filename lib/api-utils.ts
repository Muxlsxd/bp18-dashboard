import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ErrorLog } from "@/lib/models/ErrorLog";

type Ctx = { params: Promise<Record<string, string>> };
type Handler = (req: Request, ctx: Ctx) => Promise<Response>;

// Wrap an API handler so any thrown error is caught, logged to the ErrorLog
// collection, and returned as a safe 500 (never leaking stack traces).
// Client mistakes (validation/cast/duplicate) become 400.
export function withErrorHandler(fn: Handler) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      const err = e as Error & { code?: number | string };
      const isClientError =
        err.name === "ValidationError" || err.name === "CastError" || err.code === 11000;
      const status = isClientError ? 400 : 500;
      const message = isClientError ? err.message : "Internal server error";

      try {
        await connectDB();
        await ErrorLog.create({
          route: req.url,
          method: req.method,
          error: err.message,
          stack: err.stack?.slice(0, 2000),
        });
      } catch {
        // logging failure must not crash the error response
      }

      return NextResponse.json({ error: message }, { status });
    }
  };
}

export function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}
