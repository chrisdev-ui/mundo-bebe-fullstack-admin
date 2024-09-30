import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import * as schema from "./schema";

const client = new Client({ connectionString: process.env.XATA_POSTGRES_URL! });
try {
  await client.connect();
  console.log("Connected to database successfully");
} catch (error: any) {
  console.error("Failed to connect to database", error.message);
  process.exit(1);
}

const db = drizzle(client, {
  schema,
  logger: true,
});

process.on("SIGINT", () => {
  client.end().then(() => {
    console.log("Disconnected from database");
    process.exit(0);
  });
});

export default db;
