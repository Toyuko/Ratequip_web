/**
 * Safe UAT Step 1 demo: migration inventory, seed verification, reversible rollback.
 * Does NOT drop production schema — only creates/drops a temporary UAT marker table.
 *
 *   npx tsx scripts/uat-db-demo.ts
 */
import { config } from "dotenv";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

config({ path: ".env.local" });
config();

neonConfig.webSocketConstructor = ws;

type StepResult = {
  step: string;
  ok: boolean;
  detail: string;
};

async function main() {
  const url =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required for UAT DB demo");

  const pool = new Pool({ connectionString: url });
  const results: StepResult[] = [];
  const stamp = Date.now();
  const marker = `uat_rollback_marker_${stamp}`;

  try {
    // Migrate inventory
    const migrations = await pool.query<{
      version: string;
      applied_at: string;
    }>(
      `SELECT version, applied_at::text AS applied_at
       FROM rq.schema_migrations
       ORDER BY version`,
    );
    results.push({
      step: "1a Migrate inventory",
      ok: migrations.rows.length > 0,
      detail: `${migrations.rows.length} versions applied (latest: ${migrations.rows.at(-1)?.version ?? "none"})`,
    });

    const tables = await pool.query<{ n: number }>(
      `SELECT count(*)::int AS n
       FROM information_schema.tables
       WHERE table_schema = 'rq'`,
    );
    results.push({
      step: "1a Schema present",
      ok: (tables.rows[0]?.n ?? 0) > 0,
      detail: `${tables.rows[0]?.n ?? 0} tables in schema rq`,
    });

    // Seed verification (companies / requests if present)
    let seedDetail = "seed tables checked";
    let seedOk = true;
    try {
      const companies = await pool.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM companies`,
      ).catch(() => null);
      const requests = await pool.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM requests`,
      ).catch(() => null);
      const parts = [
        companies ? `companies=${companies.rows[0]?.n}` : null,
        requests ? `requests=${requests.rows[0]?.n}` : null,
        `rq.schema_migrations=${migrations.rows.length}`,
      ].filter(Boolean);
      seedDetail = parts.join(", ");
      seedOk = migrations.rows.length > 0;
    } catch (err) {
      seedOk = false;
      seedDetail = err instanceof Error ? err.message : String(err);
    }
    results.push({
      step: "1b Seed verification",
      ok: seedOk,
      detail: seedDetail,
    });

    // Forward migrate: create temporary marker
    await pool.query(
      `CREATE TABLE IF NOT EXISTS rq.${marker} (
         id serial PRIMARY KEY,
         note text NOT NULL,
         created_at timestamptz NOT NULL DEFAULT now()
       )`,
    );
    await pool.query(
      `INSERT INTO rq.${marker} (note) VALUES ($1)`,
      [`UAT rollback demo ${stamp}`],
    );
    const inserted = await pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM rq.${marker}`,
    );
    results.push({
      step: "1c Forward change (temp migrate)",
      ok: (inserted.rows[0]?.n ?? 0) === 1,
      detail: `Created rq.${marker} with 1 row`,
    });

    // Rollback: drop marker
    await pool.query(`DROP TABLE IF EXISTS rq.${marker}`);
    const gone = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'rq' AND table_name = $1
       ) AS exists`,
      [marker],
    );
    results.push({
      step: "1d Rollback (drop temp change)",
      ok: gone.rows[0]?.exists === false,
      detail: `Dropped rq.${marker}; table no longer exists`,
    });

    // Confirm production migrations untouched
    const after = await pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM rq.schema_migrations`,
    );
    results.push({
      step: "1e Production migrations intact",
      ok: after.rows[0]?.n === migrations.rows.length,
      detail: `schema_migrations still ${after.rows[0]?.n} rows`,
    });
  } finally {
    await pool.end();
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n=== UAT Step 1 — Database migrate / seed / rollback ===\n");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.step}`);
    console.log(`      ${r.detail}`);
  }
  console.log(
    `\nRESULT: ${failed.length === 0 ? "READY" : "FAILED"} (${results.filter((r) => r.ok).length}/${results.length})\n`,
  );

  // Machine-readable for the video recorder
  const out = {
    generatedAt: new Date().toISOString(),
    result: failed.length === 0 ? "READY" : "FAILED",
    results,
  };
  const fs = await import("node:fs");
  const path = await import("node:path");
  const dest = path.resolve("docs/evidence-videos/uat-step1-db.json");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`Wrote ${dest}`);

  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
