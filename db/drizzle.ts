import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";
import { getXataClient } from "./xata";

dotenv.config({ path: ".env.development.local", override: true });

const xata = getXataClient();

const pool = new Pool({ connectionString: xata.sql.connectionString });

const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export default db;
