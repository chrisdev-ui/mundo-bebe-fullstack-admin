import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/env";
import * as schema from "./schema";
import { getXataClient } from "./xata";

const xata = getXataClient();

const pool = new Pool({ connectionString: xata.sql.connectionString });

const db = drizzle(pool, {
  schema,
  logger: env.NODE_ENV === "development",
});

export default db;
