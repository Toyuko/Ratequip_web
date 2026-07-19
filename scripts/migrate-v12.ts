/**
 * Apply drizzle/v12/*.sql to Neon and record versions in rq.schema_migrations.
 *
 * Usage: npm run db:migrate:v12
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import ws from "ws";

config({ path: ".env.local" });
config();

neonConfig.webSocketConstructor = ws;

const DIR = path.join(process.cwd(), "drizzle", "v12");

async function main() {
  const url =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL (or UNPOOLED) is required");
  }

  const files = (await readdir(DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    // Bootstrap migration bookkeeping (0001 also creates this; safe if re-run)
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE EXTENSION IF NOT EXISTS citext;
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE SCHEMA IF NOT EXISTS rq;
      CREATE TABLE IF NOT EXISTS rq.schema_migrations (
        version text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now(),
        execution_ms integer,
        applied_by text NOT NULL DEFAULT current_user
      );
    `);

    const applied = await client.query<{ version: string }>(
      `SELECT version FROM rq.schema_migrations ORDER BY version`,
    );
    const done = new Set(applied.rows.map((r) => r.version));

    for (const file of files) {
      const version = file.replace(/\.sql$/, "");
      if (done.has(version)) {
        console.log(`skip ${version}`);
        continue;
      }

      const sqlText = await readFile(path.join(DIR, file), "utf8");
      const checksum = createHash("sha256").update(sqlText).digest("hex");
      const started = Date.now();
      console.log(`apply ${version}…`);
      try {
        await client.query(sqlText);
      } catch (err) {
        console.error(`FAILED ${version}`);
        throw err;
      }
      const executionMs = Date.now() - started;
      await client.query(
        `INSERT INTO rq.schema_migrations (version, checksum, execution_ms)
         VALUES ($1, $2, $3)
         ON CONFLICT (version) DO NOTHING`,
        [version, checksum, executionMs],
      );
      console.log(`ok ${version} (${executionMs}ms)`);
    }

    const tables = await client.query<{
      table_schema: string;
      table_name: string;
    }>(
      `SELECT table_schema, table_name
       FROM information_schema.tables
       WHERE table_schema IN (
         'rq','rq_audit','rq_outbox','workflow','documents',
         'rq_intelligence','rq_ecosystem','rq_marketplace_ext'
       )
       ORDER BY 1,2`,
    );
    console.log(
      `V12 migrate complete. schemas tables=${tables.rows.length}`,
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
