import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    SECRET_KEY: z.string().min(32),
    OPENAI_API_KEY: z.string(),
    RESEND_API_KEY: z.string(),
    KV_URL: z.string().url(),
    KV_REST_API_URL: z.string().url(),
    KV_REST_API_TOKEN: z.string(),
    KV_REST_API_READ_ONLY_TOKEN: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    KV_URL: process.env.KV_URL,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
