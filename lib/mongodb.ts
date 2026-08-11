import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fsae_db";

// Reuse the connection across hot reloads in dev (singleton pattern).
// If a connection attempt rejects, clear the cached promise so the next
// call retries instead of permanently returning the rejected promise.
const globalWithMongoose = globalThis as unknown as {
  _mongoose?: Promise<typeof mongoose> | null;
};

async function connectDB(): Promise<typeof mongoose> {
  if (globalWithMongoose._mongoose) return globalWithMongoose._mongoose;

  globalWithMongoose._mongoose = mongoose
    .connect(MONGODB_URI, { bufferCommands: false })
    .then(() => mongoose)
    .catch((e) => {
      globalWithMongoose._mongoose = null; // allow retry on next call
      throw e;
    });

  return globalWithMongoose._mongoose;
}

export { connectDB, mongoose };
