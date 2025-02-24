import { defineConfig } from "drizzle-kit";

import { getXataClient } from "@/db/xata";
import { env } from "@/env";

const xata = getXataClient();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: xata.sql.connectionString || env.XATA_DATABASE_URL,
  },
});
