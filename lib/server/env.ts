import { z } from 'zod';

const schema = z.object({
  MONGODB_URI: z.string().default(''),
  JWT_SECRET: z.string().min(1).default('change-this-to-a-long-random-production-secret'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  NEXT_PUBLIC_API_URL: z.string().default('/api'),
});

export const env = schema.parse({
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-to-a-long-random-production-secret',
  MAX_FILE_SIZE_MB: process.env.MAX_FILE_SIZE_MB || 10,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
});
