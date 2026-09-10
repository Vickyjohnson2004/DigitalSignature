import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { connectDb } from "./db";

test("connectDb does not reconnect when MongoDB is already connected", async () => {
  const originalConnect = mongoose.connect;
  const originalReadyState = mongoose.connection.readyState;
  let connectCalls = 0;

  Object.defineProperty(mongoose, "connect", {
    value: async (..._args: unknown[]) => {
      connectCalls += 1;
      throw new Error("connect() should not be called when already connected");
    },
    configurable: true,
  });

  Object.defineProperty(mongoose.connection, "readyState", {
    value: 1,
    configurable: true,
    writable: true,
  });

  try {
    await connectDb();
    assert.equal(connectCalls, 0);
  } finally {
    Object.defineProperty(mongoose.connection, "readyState", {
      value: originalReadyState,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(mongoose, "connect", {
      value: originalConnect,
      configurable: true,
    });
  }
});
