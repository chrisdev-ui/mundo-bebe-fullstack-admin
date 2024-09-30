import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { getXataClient } from "./db/xata";

const xata = getXataClient();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: xata.sql.connectionString,
  },
});
