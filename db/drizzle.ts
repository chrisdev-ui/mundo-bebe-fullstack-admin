import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

declare global {
  var _pgPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === "development" && globalThis._pgPool) {
  pool = globalThis._pgPool;
} else {
  pool = new Pool({ connectionString: process.env.XATA_POSTGRES_URL! });
  globalThis._pgPool = pool;
  try {
    await pool.connect();
    console.log("Connected to database successfully");
  } catch (error: any) {
    console.error("Failed to connect to database", error.message);
    process.exit(1);
  }
}

const db = drizzle(pool, {
  schema,
  logger: true,
});

process.on("SIGINT", () => {
  pool.end().then(() => {
    console.log("Disconnected from database");
    process.exit(0);
  });
});

export default db;
