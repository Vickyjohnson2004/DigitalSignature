import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env";

let memoryServer: MongoMemoryServer | null = null;

export async function connectDb() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("MongoDB connected");
    return;
  } catch (error) {
    console.warn(
      "Primary MongoDB connection failed, retrying with in-memory MongoDB:",
      error,
    );
  }

  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  console.log("MongoDB connected via in-memory server");
}
