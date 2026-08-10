import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bp18";

// Reuse the connection across hot reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: Promise<typeof mongoose> | undefined;
}

export async function connectDB() {
  if (!global._mongoose) {
    global._mongoose = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  return global._mongoose;
}
