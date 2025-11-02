import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

// Use global cache to prevent multiple connections during hot reloads
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || undefined,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
