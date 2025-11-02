import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// ✅ Declare the global cache safely for TypeScript
let cached: Cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = { bufferCommands: false };

    const dbName = process.env.MONGODB_DB;
    if (dbName) (opts as any).dbName = dbName;

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
