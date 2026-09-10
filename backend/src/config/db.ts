import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("MongoDB connected");
  return mongoose.connection;
}
