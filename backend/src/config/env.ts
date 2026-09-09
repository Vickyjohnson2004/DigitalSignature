import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z
    .string()
    .default("mongodb://127.0.0.1:27017/digital_signature_suite"),
  JWT_SECRET: z.string().min(16).default("digital-signature-suite-dev-secret"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
});

export const env = schema.parse(process.env);
