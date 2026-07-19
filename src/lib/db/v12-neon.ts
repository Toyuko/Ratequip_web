import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { hasDatabase } from "@/lib/config";

function sql() {
  if (!hasDatabase()) return null;
  return neon(process.env.DATABASE_URL!);
}

/** Deterministic UUID for non-uuid platform keys (demo slugs, etc.). */
export function uuidFromExternalKey(key: string): string {
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      key,
    )
  ) {
    return key.toLowerCase();
  }
  const hash = createHash("sha1").update(`ratequip:v12:${key}`).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variant
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function ensureRqCompany(input: {
  companyId: string;
  companyName: string;
  slug?: string;
  country?: string;
}) {
  const db = sql();
  if (!db) return null;
  const id = uuidFromExternalKey(input.companyId);
  const slug = input.slug ?? input.companyId;
  await db`
    INSERT INTO rq.companies (
      id, legal_name, display_name, status, external_key, slug, country
    ) VALUES (
      ${id}::uuid, ${input.companyName}, ${input.companyName}, 'verified',
      ${input.companyId}, ${slug}, ${input.country ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      legal_name = EXCLUDED.legal_name,
      external_key = COALESCE(rq.companies.external_key, EXCLUDED.external_key),
      slug = COALESCE(rq.companies.slug, EXCLUDED.slug),
      updated_at = now()
  `;
  return id;
}

export async function persistOpportunityProfile(input: {
  companyId: string;
  companyName: string;
  status: string;
  targetIndustries: string[];
  targetRegions: string[];
  projectValueMin?: number;
  projectValueMax?: number;
  preferredRequirementTypes: string[];
  notes: string;
}) {
  const companyUuid = await ensureRqCompany({
    companyId: input.companyId,
    companyName: input.companyName,
  });
  const db = sql();
  if (!db || !companyUuid) return null;
  await db`
    INSERT INTO rq.opportunity_profiles (
      company_id, status, target_industries, target_company_types, target_regions,
      project_value_min, project_value_max, currency, preferred_requirement_types,
      private_preferences, published_at, updated_at
    ) VALUES (
      ${companyUuid}::uuid,
      ${input.status},
      '{}'::uuid[],
      '{}'::text[],
      ${JSON.stringify(input.targetRegions.map((r) => ({ region: r })))}::jsonb,
      ${input.projectValueMin ?? null},
      ${input.projectValueMax ?? null},
      'USD',
      ${input.preferredRequirementTypes},
      ${JSON.stringify({
        notes: input.notes,
        targetIndustryKeys: input.targetIndustries,
      })}::jsonb,
      ${input.status === "published" ? new Date().toISOString() : null},
      now()
    )
    ON CONFLICT (company_id) DO UPDATE SET
      status = EXCLUDED.status,
      target_regions = EXCLUDED.target_regions,
      project_value_min = EXCLUDED.project_value_min,
      project_value_max = EXCLUDED.project_value_max,
      preferred_requirement_types = EXCLUDED.preferred_requirement_types,
      private_preferences = EXCLUDED.private_preferences,
      published_at = EXCLUDED.published_at,
      updated_at = now(),
      version = rq.opportunity_profiles.version + 1
  `;
  return companyUuid;
}

export async function persistContractorProfile(input: {
  companyId: string;
  companyName: string;
  status: string;
  trades: string[];
  licences: string[];
  serviceRadiusKm: number;
  emergencyAvailable: boolean;
  rateSummary: string;
  notes: string;
}) {
  const companyUuid = await ensureRqCompany({
    companyId: input.companyId,
    companyName: input.companyName,
  });
  const db = sql();
  if (!db || !companyUuid) return null;
  await db`
    INSERT INTO rq.contractor_profiles (
      company_id, status, service_radius, work_preferences, rate_summary,
      emergency_available, updated_at
    ) VALUES (
      ${companyUuid}::uuid,
      ${input.status},
      ${JSON.stringify({ km: input.serviceRadiusKm })}::jsonb,
      ${JSON.stringify({ trades: input.trades, licences: input.licences, notes: input.notes })}::jsonb,
      ${JSON.stringify({ summary: input.rateSummary })}::jsonb,
      ${input.emergencyAvailable},
      now()
    )
    ON CONFLICT (company_id) DO UPDATE SET
      status = EXCLUDED.status,
      service_radius = EXCLUDED.service_radius,
      work_preferences = EXCLUDED.work_preferences,
      rate_summary = EXCLUDED.rate_summary,
      emergency_available = EXCLUDED.emergency_available,
      updated_at = now()
  `;
  return companyUuid;
}

export async function persistMatchRun(input: {
  requirementLabel: string;
  results: Array<{
    supplierId: string;
    eligible: boolean;
    organicScore: number;
    reasonCodes: string[];
    policyVersion: string;
  }>;
}) {
  const db = sql();
  if (!db) return null;

  const [policy] = await db`
    SELECT id, version FROM rq.match_policies
    WHERE status = 'published'
    ORDER BY published_at DESC NULLS LAST
    LIMIT 1
  `;
  if (!policy) return null;

  const [req] = await db`
    INSERT INTO rq.match_requests (
      request_type, target_ref_type, target_ref_id, policy_id, policy_version,
      context_snapshot, status, completed_at
    ) VALUES (
      'supplier_search',
      'requirement_label',
      gen_random_uuid(),
      ${policy.id},
      ${policy.version},
      ${JSON.stringify({ requirementLabel: input.requirementLabel })}::jsonb,
      'completed',
      now()
    )
    RETURNING id
  `;

  let rank = 1;
  for (const r of input.results) {
    const candidateId = uuidFromExternalKey(r.supplierId);
    await db`
      INSERT INTO rq.match_results (
        match_request_id, candidate_type, candidate_id, eligible, score,
        confidence, reason_codes, rank
      ) VALUES (
        ${req.id}::uuid, 'company', ${candidateId}::uuid, ${r.eligible},
        ${r.organicScore}, ${Math.min(1, r.organicScore)}, ${r.reasonCodes},
        ${rank}
      )
      ON CONFLICT (match_request_id, candidate_type, candidate_id) DO NOTHING
    `;
    rank += 1;
  }
  return req.id as string;
}

export async function persistRequisition(input: {
  id: string;
  companyId: string;
  title: string;
  status: string;
  lines: unknown[];
  data?: Record<string, unknown>;
}) {
  const companyUuid = await ensureRqCompany({
    companyId: input.companyId,
    companyName: input.companyId,
  });
  const db = sql();
  if (!db || !companyUuid) return null;
  const recordKey = input.id;
  await db`
    INSERT INTO rq.procurement_requests (
      company_id, record_key, display_name, status, data
    ) VALUES (
      ${companyUuid}::uuid,
      ${recordKey},
      ${input.title},
      ${input.status},
      ${JSON.stringify({ lines: input.lines, ...(input.data ?? {}) })}::jsonb
    )
    ON CONFLICT (company_id, record_key) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      status = EXCLUDED.status,
      data = EXCLUDED.data,
      updated_at = now(),
      version_no = rq.procurement_requests.version_no + 1
  `;
  return recordKey;
}

export async function persistAward(input: {
  id: string;
  companyId: string;
  rfqId: string;
  supplierId: string;
  reasonCodes: string[];
  amount?: number;
}) {
  const companyUuid = await ensureRqCompany({
    companyId: input.companyId,
    companyName: input.companyId,
  });
  const db = sql();
  if (!db || !companyUuid) return null;

  // Prefer dedicated awards table if present; else commercial_revisions
  try {
    await db`
      INSERT INTO rq.domain_state_transitions (
        company_id, aggregate_type, aggregate_id, from_state, to_state,
        reason_code, policy_version, correlation_id
      ) VALUES (
        ${companyUuid}::uuid,
        'rfq_award',
        ${uuidFromExternalKey(input.rfqId)}::uuid,
        'open',
        'awarded',
        ${input.reasonCodes[0] ?? "awarded"},
        'v12.0.0-part2',
        gen_random_uuid()
      )
    `;
  } catch {
    // table may not exist if migrate incomplete
  }

  await db`
    INSERT INTO rq.commercial_revisions (
      company_id, aggregate_type, aggregate_id, revision_no, content_hash, payload
    ) VALUES (
      ${companyUuid}::uuid,
      'award',
      ${uuidFromExternalKey(input.id)}::uuid,
      1,
      ${createHash("sha256").update(JSON.stringify(input)).digest("hex")},
      ${JSON.stringify(input)}::jsonb
    )
    ON CONFLICT (aggregate_type, aggregate_id, revision_no) DO NOTHING
  `;
  return input.id;
}

export async function loadTaxonomyFromNeon(limit = 500) {
  const db = sql();
  if (!db) return null;
  const rows = await db`
    SELECT n.id::text, n.stable_key, n.scheme_id, n.node_type, n.status,
           v.preferred_label
    FROM rq.taxonomy_nodes n
    JOIN rq.taxonomy_node_versions v ON v.node_id = n.id AND v.version = 1 AND v.locale = 'en'
    ORDER BY v.preferred_label
    LIMIT ${limit}
  `;
  return rows as Array<{
    id: string;
    stable_key: string;
    scheme_id: string;
    node_type: string;
    status: string;
    preferred_label: string;
  }>;
}
