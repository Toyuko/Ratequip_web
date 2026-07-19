/**
 * Seed V12 reference data (taxonomy, questions, capabilities, match policy) into Neon.
 *
 * Usage: npm run db:seed:v12
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import ws from "ws";

config({ path: ".env.local" });
config();

neonConfig.webSocketConstructor = ws;

type TaxonomyNode = {
  id: string;
  stable_key: string;
  scheme_id: string;
  node_type: string;
  preferred_label: string;
  synonyms?: string;
  ai_keywords?: string;
  search_weight?: string | number;
  status?: string;
};

type TaxonomyEdge = {
  from_stable_key: string;
  to_stable_key: string;
  edge_type: string;
  confidence?: string | number;
};

type QuestionPack = {
  id: string;
  version: number;
  name: string;
  status: string;
  scope?: Record<string, unknown>;
};

type QuestionDef = {
  id: string;
  version: number;
  pack_id: string;
  pack_version: number;
  prompt: string;
  help_text?: string;
  answer_type: string;
  answer_schema?: Record<string, unknown>;
  visibility_rule?: Record<string, unknown>;
  required_rule?: Record<string, unknown>;
  dependency_ids?: string[];
  consequence_map?: Record<string, unknown>;
  sensitivity?: string;
  display_order: number;
  options?: unknown;
};

type Capability = {
  id: string;
  stable_key: string;
  action_key: string;
  object_class?: string;
  verification_policy?: string;
};

async function loadJson<T>(rel: string): Promise<T> {
  const raw = await readFile(path.join(process.cwd(), rel), "utf8");
  return JSON.parse(raw) as T;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const url =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL (or UNPOOLED) is required");

  const nodes = await loadJson<TaxonomyNode[]>("src/data/v12/taxonomy_nodes_part1.json");
  const edges = await loadJson<TaxonomyEdge[]>("src/data/v12/taxonomy_edges_part1.json");
  const packs = await loadJson<QuestionPack[]>("src/data/v12/question_packs.json");
  const questions = await loadJson<QuestionDef[]>(
    "src/data/v12/question_definitions_part1.json",
  );
  const capabilities = await loadJson<Capability[]>("src/data/v12/capabilities.json");

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    const schemeCheck = await client.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema='rq' AND table_name='taxonomy_schemes'`,
    );
    if (schemeCheck.rowCount === 0) {
      throw new Error("V12 schema missing — run npm run db:migrate:v12 first");
    }

    console.log("seeding…");
    await client.query("BEGIN");

    const schemeIds = [...new Set(nodes.map((n) => n.scheme_id))];
    for (const schemeId of schemeIds) {
      await client.query(
        `INSERT INTO rq.taxonomy_schemes (id, name, description, current_release, status)
         VALUES ($1, $2, $3, 1, 'active')
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [schemeId, schemeId, `Seeded scheme ${schemeId}`],
      );
      await client.query(
        `INSERT INTO rq.taxonomy_releases (scheme_id, release, status, published_at, checksum)
         VALUES ($1, 1, 'published', now(), 'seed-v12')
         ON CONFLICT (scheme_id, release) DO NOTHING`,
        [schemeId],
      );
    }

    for (const batch of chunk(nodes, 80)) {
      const ids = batch.map((n) => n.id);
      const keys = batch.map((n) => n.stable_key);
      const schemes = batch.map((n) => n.scheme_id);
      const types = batch.map((n) => n.node_type);
      const statuses = batch.map((n) =>
        n.status === "published" ||
        n.status === "draft" ||
        n.status === "deprecated" ||
        n.status === "retired"
          ? n.status
          : "published",
      );
      await client.query(
        `INSERT INTO rq.taxonomy_nodes (id, stable_key, scheme_id, node_type, status, visibility)
         SELECT u.id::uuid, u.stable_key, u.scheme_id, u.node_type, u.status, 'public'
         FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[])
           AS u(id, stable_key, scheme_id, node_type, status)
         ON CONFLICT (id) DO UPDATE SET
           stable_key = EXCLUDED.stable_key,
           scheme_id = EXCLUDED.scheme_id,
           node_type = EXCLUDED.node_type,
           status = EXCLUDED.status`,
        [ids, keys, schemes, types, statuses],
      );

      const labels = batch.map((n) => n.preferred_label);
      const weights = batch.map((n) => Number(n.search_weight ?? 1) || 1);
      const keywordCsv = batch.map((n) =>
        (n.ai_keywords ?? "")
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .join("|"),
      );
      await client.query(
        `INSERT INTO rq.taxonomy_node_versions
           (node_id, version, preferred_label, locale, search_weight, ai_keywords, metadata)
         SELECT
           u.id::uuid, 1, u.label, 'en', u.weight,
           CASE WHEN u.keywords = '' THEN '{}'::text[]
                ELSE string_to_array(u.keywords, '|') END,
           '{}'::jsonb
         FROM unnest($1::text[], $2::text[], $3::float8[], $4::text[])
           AS u(id, label, weight, keywords)
         ON CONFLICT (node_id, version, locale) DO UPDATE SET
           preferred_label = EXCLUDED.preferred_label,
           search_weight = EXCLUDED.search_weight,
           ai_keywords = EXCLUDED.ai_keywords`,
        [ids, labels, weights, keywordCsv],
      );
    }

    const synonymRows: { id: string; syn: string }[] = [];
    for (const n of nodes) {
      for (const syn of (n.synonyms ?? "")
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean)) {
        synonymRows.push({ id: n.id, syn });
      }
    }
    for (const batch of chunk(synonymRows, 100)) {
      await client.query(
        `INSERT INTO rq.taxonomy_labels (node_id, locale, region_code, label, label_type, search_weight)
         SELECT u.id::uuid, 'en', NULL, u.syn, 'synonym', 0.8
         FROM unnest($1::text[], $2::text[]) AS u(id, syn)
         ON CONFLICT DO NOTHING`,
        [batch.map((r) => r.id), batch.map((r) => r.syn)],
      );
    }

    const keyToId = new Map(nodes.map((n) => [n.stable_key, n.id]));
    await client.query(`DELETE FROM rq.taxonomy_edges`);
    const edgeValidFrom = "2026-01-01T00:00:00Z";
    const edgeRows = edges
      .map((e) => {
        const fromId = keyToId.get(e.from_stable_key);
        const toId = keyToId.get(e.to_stable_key);
        if (!fromId || !toId) return null;
        return {
          fromId,
          toId,
          edgeType: e.edge_type,
          confidence: Number(e.confidence ?? 1) || 1,
        };
      })
      .filter(Boolean) as Array<{
      fromId: string;
      toId: string;
      edgeType: string;
      confidence: number;
    }>;

    for (const batch of chunk(edgeRows, 100)) {
      await client.query(
        `INSERT INTO rq.taxonomy_edges
           (from_node_id, to_node_id, edge_type, status, confidence, evidence, valid_from)
         SELECT u.from_id::uuid, u.to_id::uuid, u.edge_type, 'published', u.confidence, '{}'::jsonb, $5::timestamptz
         FROM unnest($1::text[], $2::text[], $3::text[], $4::float8[])
           AS u(from_id, to_id, edge_type, confidence)
         ON CONFLICT (from_node_id, to_node_id, edge_type, valid_from) DO NOTHING`,
        [
          batch.map((e) => e.fromId),
          batch.map((e) => e.toId),
          batch.map((e) => e.edgeType),
          batch.map((e) => e.confidence),
          edgeValidFrom,
        ],
      );
    }

    for (const batch of chunk(packs, 50)) {
      await client.query(
        `INSERT INTO rq.question_packs (id, version, name, scope, status, checksum, published_at)
         SELECT u.id, u.version, u.name, u.scope::jsonb, u.status, 'seed-v12', now()
         FROM unnest($1::text[], $2::int[], $3::text[], $4::text[], $5::text[])
           AS u(id, version, name, scope, status)
         ON CONFLICT (id, version) DO UPDATE SET
           name = EXCLUDED.name,
           scope = EXCLUDED.scope,
           status = EXCLUDED.status`,
        [
          batch.map((p) => p.id),
          batch.map((p) => p.version),
          batch.map((p) => p.name),
          batch.map((p) => JSON.stringify(p.scope ?? {})),
          batch.map((p) =>
            p.status === "draft" || p.status === "published" || p.status === "retired"
              ? p.status
              : "published",
          ),
        ],
      );
    }

    // Ensure every pack referenced by questions exists
    const packKeys = new Set(packs.map((p) => `${p.id}::${p.version}`));
    for (const q of questions) {
      const key = `${q.pack_id}::${q.pack_version}`;
      if (packKeys.has(key)) continue;
      await client.query(
        `INSERT INTO rq.question_packs (id, version, name, scope, status, checksum, published_at)
         VALUES ($1, $2, $3, '{}'::jsonb, 'published', 'seed-v12', now())
         ON CONFLICT (id, version) DO NOTHING`,
        [q.pack_id, q.pack_version, q.pack_id],
      );
      packKeys.add(key);
    }

    for (const batch of chunk(questions, 40)) {
      await client.query(
        `INSERT INTO rq.question_definitions
           (id, version, pack_id, pack_version, prompt, help_text, answer_type, answer_schema,
            visibility_rule, required_rule, dependency_ids, consequence_map, sensitivity, display_order)
         SELECT
           u.id, u.version, u.pack_id, u.pack_version, u.prompt, u.help_text, u.answer_type,
           u.answer_schema::jsonb, u.visibility_rule::jsonb, u.required_rule::jsonb,
           CASE WHEN u.dependency_ids = '' THEN '{}'::text[]
                ELSE string_to_array(u.dependency_ids, '|') END,
           u.consequence_map::jsonb, u.sensitivity, u.display_order
         FROM unnest(
           $1::text[], $2::int[], $3::text[], $4::int[], $5::text[], $6::text[], $7::text[],
           $8::text[], $9::text[], $10::text[], $11::text[], $12::text[], $13::text[], $14::int[]
         ) AS u(
           id, version, pack_id, pack_version, prompt, help_text, answer_type,
           answer_schema, visibility_rule, required_rule, dependency_ids, consequence_map,
           sensitivity, display_order
         )
         ON CONFLICT (id, version) DO UPDATE SET
           prompt = EXCLUDED.prompt,
           answer_type = EXCLUDED.answer_type,
           answer_schema = EXCLUDED.answer_schema,
           visibility_rule = EXCLUDED.visibility_rule,
           required_rule = EXCLUDED.required_rule,
           consequence_map = EXCLUDED.consequence_map,
           display_order = EXCLUDED.display_order`,
        [
          batch.map((q) => q.id),
          batch.map((q) => q.version),
          batch.map((q) => q.pack_id),
          batch.map((q) => q.pack_version),
          batch.map((q) => q.prompt),
          batch.map((q) => q.help_text ?? null),
          batch.map((q) => q.answer_type),
          batch.map((q) =>
            JSON.stringify(
              q.answer_schema ?? { type: q.answer_type, options: q.options ?? [] },
            ),
          ),
          batch.map((q) => JSON.stringify(q.visibility_rule ?? {})),
          batch.map((q) => JSON.stringify(q.required_rule ?? {})),
          batch.map((q) => (q.dependency_ids ?? []).join("|")),
          batch.map((q) => JSON.stringify(q.consequence_map ?? {})),
          batch.map((q) => q.sensitivity ?? "internal"),
          batch.map((q) => q.display_order),
        ],
      );
    }

    const capRows = capabilities
      .map((c) => {
        const actionId = keyToId.get(c.action_key);
        if (!actionId) return null;
        return {
          id: c.id,
          stableKey: c.stable_key,
          actionId,
          constraints: JSON.stringify({
            object_class: c.object_class ?? null,
            verification_policy: c.verification_policy ?? null,
          }),
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      stableKey: string;
      actionId: string;
      constraints: string;
    }>;

    for (const batch of chunk(capRows, 80)) {
      await client.query(
        `INSERT INTO rq.capability_definitions
           (id, stable_key, action_node_id, object_node_id, constraints_schema, status)
         SELECT u.id::uuid, u.stable_key, u.action_id::uuid, NULL, u.constraints::jsonb, 'published'
         FROM unnest($1::text[], $2::text[], $3::text[], $4::text[])
           AS u(id, stable_key, action_id, constraints)
         ON CONFLICT (id) DO UPDATE SET
           stable_key = EXCLUDED.stable_key,
           action_node_id = EXCLUDED.action_node_id,
           constraints_schema = EXCLUDED.constraints_schema,
           status = EXCLUDED.status`,
        [
          batch.map((c) => c.id),
          batch.map((c) => c.stableKey),
          batch.map((c) => c.actionId),
          batch.map((c) => c.constraints),
        ],
      );
    }

    await client.query(
      `INSERT INTO rq.match_policies
         (id, version, name, target_type, eligibility_rules, feature_weights, thresholds, status, published_at)
       VALUES (
         'default-supplier', 1, 'Default supplier match', 'supplier',
         '{"hasRequiredCapability":true,"inJurisdiction":true,"serviceable":true,"deadlineOk":true}'::jsonb,
         '{"capability":0.22,"industry":0.12,"geography":0.12,"trust":0.10,"response":0.04,"commercial":0.03}'::jsonb,
         '{"minScore":0.35}'::jsonb,
         'published', now()
       )
       ON CONFLICT (id, version) DO UPDATE SET
         feature_weights = EXCLUDED.feature_weights,
         status = EXCLUDED.status`,
    );

    const publicCompanies = await client.query<{
      id: string;
      name: string;
      slug: string;
      country: string | null;
      claimed: boolean;
      trust_score: string;
    }>(
      `SELECT id::text, name, slug, country, claimed, trust_score::text
       FROM public.companies
       WHERE deleted_at IS NULL
       ORDER BY created_at
       LIMIT 200`,
    );

    for (const batch of chunk(publicCompanies.rows, 50)) {
      await client.query(
        `INSERT INTO rq.companies
           (id, legal_name, display_name, status, external_key, slug, country, claimed, trust_score)
         SELECT
           u.id::uuid, u.name, u.name, 'verified', u.slug, u.slug, u.country, u.claimed, u.trust_score::numeric
         FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::bool[], $6::text[])
           AS u(id, name, slug, country, claimed, trust_score)
         ON CONFLICT (id) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           legal_name = EXCLUDED.legal_name,
           external_key = EXCLUDED.external_key,
           slug = EXCLUDED.slug,
           country = EXCLUDED.country,
           claimed = EXCLUDED.claimed,
           trust_score = EXCLUDED.trust_score,
           updated_at = now()`,
        [
          batch.map((r) => r.id),
          batch.map((r) => r.name),
          batch.map((r) => r.slug),
          batch.map((r) => r.country),
          batch.map((r) => r.claimed),
          batch.map((r) => r.trust_score ?? "0"),
        ],
      );
    }

    const summary = {
      nodes: nodes.length,
      edges: edgeRows.length,
      packs: packs.length,
      questions: questions.length,
      capabilities: capRows.length,
      capabilitiesSkipped: capabilities.length - capRows.length,
      mirroredCompanies: publicCompanies.rows.length,
      at: new Date().toISOString(),
    };

    await client.query(
      `INSERT INTO rq.platform_sync_state (key, value, updated_at)
       VALUES ('seed-v12', $1::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [JSON.stringify(summary)],
    );

    await client.query("COMMIT");
    console.log("V12 seed complete", summary);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
