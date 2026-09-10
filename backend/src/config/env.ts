import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(4000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),

  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
});

export const env = schema.parse(process.env);
