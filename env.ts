import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUTH_INSTAGRAM_ID: z.string().min(1),
    AUTH_INSTAGRAM_SECRET: z.string().min(1),
    AUTH_SECRET: z.string().min(1),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    DB_CONNECTION_TIMEOUT: z.string().min(1),
    DB_IDLE_TIMEOUT: z.string().min(1),
    DB_MAX_CONNECTIONS: z.string().min(1),
    DB_MAX_USES: z.string().min(1),
    DB_MIN_CONNECTIONS: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    SENDGRID_API_KEY: z.string().min(1),
    SUPER_ADMIN_EMAIL: z.string().email(),
    XATA_API_KEY: z.string().min(1),
    XATA_BRANCH: z.string().min(1),
    XATA_DATABASE_URL: z.string().url(),
    XATA_POSTGRES_URL: z.string().url(),
    UPSTASH_REDIS_URL: z.string().url(),
    UPSTASH_REDIS_TOKEN: z.string().min(1),
    LOG_LEVEL: z
      .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
      .default("info"),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },

  runtimeEnv: {
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_INSTAGRAM_ID: process.env.AUTH_INSTAGRAM_ID,
    AUTH_INSTAGRAM_SECRET: process.env.AUTH_INSTAGRAM_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    DB_CONNECTION_TIMEOUT: process.env.DB_CONNECTION_TIMEOUT,
    DB_IDLE_TIMEOUT: process.env.DB_IDLE_TIMEOUT,
    DB_MAX_CONNECTIONS: process.env.DB_MAX_CONNECTIONS,
    DB_MAX_USES: process.env.DB_MAX_USES,
    DB_MIN_CONNECTIONS: process.env.DB_MIN_CONNECTIONS,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    XATA_API_KEY: process.env.XATA_API_KEY,
    XATA_BRANCH: process.env.XATA_BRANCH,
    XATA_DATABASE_URL: process.env.XATA_DATABASE_URL,
    XATA_POSTGRES_URL: process.env.XATA_POSTGRES_URL,
    NODE_ENV: process.env.NODE_ENV,
    UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
    UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
    LOG_LEVEL: process.env.LOG_LEVEL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
