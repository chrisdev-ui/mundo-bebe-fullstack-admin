import { del, list } from "@vercel/blob";
import { sql } from "drizzle-orm";

import redis from "@/lib/upstash";
import db from "../drizzle";

async function cleanupRedis() {
  try {
    console.log("⏳ Cleaning up Redis...");

    // Get all keys
    const keys = await redis.keys("*");
    console.log(`📊 Found ${keys.length} Redis keys to delete`);

    if (keys.length > 0) {
      // Delete all keys
      await redis.del(...keys);
      console.log("🗑️ Deleted all Redis keys");
    }

    console.log("✅ Redis cleaned");
  } catch (error) {
    console.error("❌ Redis cleanup failed:", error);
    throw error;
  }
}

async function cleanupVercelBlobs() {
  try {
    console.log("⏳ Cleaning up Vercel Blobs...");

    // List all blobs
    const { blobs } = await list();
    console.log(`📊 Found ${blobs.length} blobs to delete`);

    // Delete blobs in parallel with a limit
    const BATCH_SIZE = 10;
    for (let i = 0; i < blobs.length; i += BATCH_SIZE) {
      const batch = blobs.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (blob) => {
          console.log(`🗑️ Deleting blob: ${blob.pathname}`);
          try {
            await del(blob.url, {
              token: process.env.BLOB_READ_WRITE_TOKEN,
            });
          } catch (error) {
            console.error(`Failed to delete blob ${blob.pathname}:`, error);
          }
        }),
      );
    }

    console.log("✅ Vercel Blobs cleaned");
  } catch (error) {
    console.error("❌ Vercel Blobs cleanup failed:", error);
    throw error;
  }
}

export async function cleanup() {
  try {
    console.log("⏳ Cleaning up database...");

    // Disable foreign key checks temporarily
    await db.execute(sql`SET CONSTRAINTS ALL DEFERRED`);

    // Get all tables in the public schema
    const tablesResult = await db.execute<{ tablename: string }>(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    const tables = Array.isArray(tablesResult)
      ? tablesResult
      : tablesResult.rows;
    console.log("📊 Tables to drop:", tables);

    // Drop each table
    for (const table of tables) {
      console.log(`🗑️ Dropping table: ${table.tablename}`);
      await db.execute(sql`
        DROP TABLE IF EXISTS ${sql.identifier(table.tablename)} CASCADE
      `);
    }

    // Drop the drizzle schema if it exists
    await db.execute(sql`DROP SCHEMA IF EXISTS "drizzle" CASCADE`);

    // Drop enums
    const enumsResult = await db.execute<{ enum_name: string }>(sql`
      SELECT t.typname as enum_name
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      GROUP BY t.typname
    `);

    const enums = Array.isArray(enumsResult) ? enumsResult : enumsResult.rows;
    console.log("📊 Enums to drop:", enums);

    // Drop each enum
    for (const enum_ of enums) {
      console.log(`🗑️ Dropping enum: ${enum_.enum_name}`);
      await db.execute(sql`
        DROP TYPE IF EXISTS ${sql.identifier(enum_.enum_name)} CASCADE
      `);
    }

    // Re-enable foreign key checks
    await db.execute(sql`SET CONSTRAINTS ALL IMMEDIATE`);

    console.log("✅ Database cleaned");
  } catch (error) {
    console.error("❌ Database cleanup failed:", error);
    throw error;
  }
}

if (require.main === module) {
  cleanup()
    .then(() => cleanupVercelBlobs())
    .then(() => cleanupRedis())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
