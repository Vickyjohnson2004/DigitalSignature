import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import auth from "./routes/auth";
import algorithms from "./routes/algorithms";
import documents from "./routes/documents";
import signatures from "./routes/signatures";
import benchmarks from "./routes/benchmarks";
import dashboard from "./routes/dashboard";
import admin from "./routes/admin";
import { errorHandler } from "./middleware/error";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (_req, res) =>
  res.json({ status: "ok", service: "digital-signature-suite-api" }),
);
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "digital-signature-suite-api" }),
);
app.use("/api/auth", auth);
app.use("/api/algorithms", algorithms);
app.use("/api/documents", documents);
app.use("/api/signatures", signatures);
app.use("/api/benchmarks", benchmarks);
app.use("/api/dashboard", dashboard);
app.use("/api/admin", admin);
app.use(errorHandler);

export async function startServer() {
  await connectDb();
  const port = env.PORT;
  return app.listen(port, () => console.log(`API listening on ${port}`));
}

if (!process.env.VERCEL) {
  startServer().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export default app;
