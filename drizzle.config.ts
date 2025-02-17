import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

import { getXataClient } from "./db/xata";

dotenv.config({ path: ".env.development.local", override: true });

const xata = getXataClient();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: xata.sql.connectionString || process.env.XATA_DATABASE_URL!,
  },
});
