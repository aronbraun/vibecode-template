import "server-only";
import mongoose from "mongoose";

// The connection promise is cached on globalThis so Next.js hot reloads and
// serverless warm starts reuse one connection instead of opening new ones.
const globalForDb = globalThis as unknown as {
  mongooseConnection?: Promise<typeof mongoose>;
};

async function connect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    console.info("Connecting to MongoDB from MONGODB_URI");
    return mongoose.connect(uri);
  }

  // No MONGODB_URI: start a throwaway in-memory MongoDB. Development only —
  // all data is lost on restart, and on serverless every instance gets its own.
  console.warn(
    "MONGODB_URI is not set — starting an in-memory MongoDB. " +
      "All data is lost on restart. Set MONGODB_URI for a real database. " +
      "(The very first start downloads a MongoDB binary, which can take a minute.)",
  );
  const { MongoMemoryServer } = await import("mongodb-memory-server-core");
  const memoryServer = await MongoMemoryServer.create();
  console.info(`In-memory MongoDB ready at ${memoryServer.getUri()}`);
  return mongoose.connect(memoryServer.getUri("app"));
}

// Safe to call on every request: it connects once and then resolves instantly.
export function connectToDatabase(): Promise<typeof mongoose> {
  globalForDb.mongooseConnection ??= connect().catch((error) => {
    // Drop the failed promise so the next request retries instead of
    // being stuck with a permanently broken cached connection.
    globalForDb.mongooseConnection = undefined;
    console.error("MongoDB connection failed", error);
    throw error;
  });
  return globalForDb.mongooseConnection;
}
