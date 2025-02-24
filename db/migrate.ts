import { migrate } from "drizzle-orm/postgres-js/migrator";

import db from "./drizzle";

export async function runMigrate() {
  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, { migrationsFolder: "drizzle" });

  const end = Date.now();

  console.log(`✅ Migrations finished in ${end - start}ms`);

  process.exit(0);
}

runMigrate().catch((err) => {
  console.error("❌ Migrations failed");
  console.error(err);
  process.exit(1);
});
