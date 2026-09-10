import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import type { AddressInfo } from "node:net";
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

test("root and health routes do not connect to MongoDB", async () => {
  const originalConnect = mongoose.connect;
  let connectCalls = 0;

  Object.defineProperty(mongoose, "connect", {
    value: async (..._args: unknown[]) => {
      connectCalls += 1;
      return mongoose.connection;
    },
    configurable: true,
  });

  process.env.VERCEL = "1";
  const { app } = await import("../server");
  const server = app.listen(0);
  const port = (server.address() as AddressInfo).port;

  try {
    const rootResponse = await fetch(`http://127.0.0.1:${port}/`);
    const healthResponse = await fetch(`http://127.0.0.1:${port}/health`);

    assert.equal(rootResponse.status, 200);
    assert.equal(healthResponse.status, 200);
    assert.equal(connectCalls, 0);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    Object.defineProperty(mongoose, "connect", {
      value: originalConnect,
      configurable: true,
    });
  }
});
