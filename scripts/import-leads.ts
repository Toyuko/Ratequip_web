/**
 * Clear demo marketplace data and import RateQuip lead lists into Neon.
 *
 * Usage:
 *   npm run db:import-leads -- \
 *     --invite /path/to/RateQuip_Invite_Ready_Final_*.csv \
 *     --creation /path/to/company_creation.csv
 *
 * Defaults look under scripts/data/ then Downloads.
 * Invitation recipients are queued only — no outreach emails are sent.
 */
import { config } from "dotenv";
import { createHash, createHmac, randomBytes } from "crypto";
import { createReadStream, existsSync } from "fs";
import { createInterface } from "readline";
import path from "path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const HMAC_SECRET =
  process.env.OG_EMAIL_HMAC_SECRET ?? "ratequip-demo-og-hmac-v10.1";

type Sql = NeonQueryFunction<false, false>;

type LeadRow = {
  companyName: string;
  email: string;
  contactName: string;
  jobTitle: string;
  phone: string;
  website: string;
  industrySector: string;
  industryDetail: string;
  companyType: string;
  city: string;
  country: string;
  relationship: string;
  roleMailbox: string;
  source: "invite" | "creation";
};

type CompanyAgg = {
  name: string;
  slug: string;
  website: string;
  country: string;
  city: string;
  industrySector: string;
  industryDetail: string;
  companyType: string;
  relationship: string;
  inviteContacts: LeadRow[];
  creationContacts: LeadRow[];
};

function arg(flag: string) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function resolvePath(flag: string, candidates: string[]) {
  const fromArg = arg(flag);
  if (fromArg) return path.resolve(fromArg);
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  throw new Error(`Missing file for ${flag}. Tried:\n${candidates.join("\n")}`);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function maskEmail(email: string) {
  const normalized = normalizeEmail(email);
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return "***";
  return `${local.slice(0, Math.min(2, local.length))}***@${domain}`;
}

function emailNormalizedHash(email: string) {
  return createHmac("sha256", HMAC_SECRET)
    .update(normalizeEmail(email))
    .digest("hex");
}

function encryptEmailDemo(email: string) {
  return `enc:v1:${Buffer.from(normalizeEmail(email), "utf8").toString("base64")}`;
}

function encryptTextDemo(value: string) {
  return `enc:v1:${Buffer.from(value.trim(), "utf8").toString("base64")}`;
}

function createClaimToken() {
  const raw = randomBytes(24).toString("base64url");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { tokenHash: hash, tokenPrefix: raw.slice(0, 8) };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function companyKey(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeCountry(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  const lower = v.toLowerCase();
  const map: Record<string, string> = {
    au: "Australia",
    australia: "Australia",
    nz: "New Zealand",
    "new zealand": "New Zealand",
    usa: "USA",
    us: "USA",
    "united states": "USA",
    "united states of america": "USA",
    uk: "United Kingdom",
    "united kingdom": "United Kingdom",
    "unknown / international": "International",
  };
  return map[lower] ?? v.replace(/\b\w/g, (c) => c.toUpperCase());
}

function sectorToCategorySlug(sector: string): string | null {
  const s = sector.trim().toLowerCase();
  if (!s || s === "sector unverified") return null;
  if (s.includes("food") || s.includes("beverage") || s.includes("agriculture"))
    return "food-processing";
  if (s.includes("packaging") || s.includes("labell"))
    return "packaging-machinery";
  if (s.includes("pharma") || s.includes("health") || s.includes("cosmetic"))
    return "inspection-qc";
  if (s.includes("logistics") || s.includes("warehous") || s.includes("freight"))
    return "heavy-logistics";
  if (
    s.includes("industrial") ||
    s.includes("chemical") ||
    s.includes("mining") ||
    s.includes("construction") ||
    s.includes("waste") ||
    s.includes("forest")
  )
    return "industrial-equipment";
  if (
    s.includes("professional") ||
    s.includes("retail") ||
    s.includes("education") ||
    s.includes("government") ||
    s.includes("financial")
  )
    return "general-business";
  if (s.includes("machinery") || s.includes("automation"))
    return "factory-automation";
  return "general-business";
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

async function readCsv(filePath: string): Promise<Record<string, string>[]> {
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  let headers: string[] | null = null;
  const rows: Record<string, string>[] = [];
  for await (const raw of rl) {
    const line = raw.replace(/^\uFEFF/, "");
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (!headers) {
      headers = cols.map((h) => h.trim());
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function mapRow(
  r: Record<string, string>,
  source: "invite" | "creation",
): LeadRow | null {
  const companyName = (r["Company Name"] ?? "").trim();
  if (!companyName) return null;
  return {
    companyName,
    email: r["Email Address"] ?? "",
    contactName: r["Contact Name"] ?? "",
    jobTitle: r["Job Title"] ?? "",
    phone: r["Phone"] ?? "",
    website: r["Website"] ?? "",
    industrySector: r["Industry Sector"] ?? "",
    industryDetail: r["Industry Detail / Products"] ?? "",
    companyType: r["RateQuip Company Type"] ?? "",
    city: r["City / Suburb"] ?? "",
    country: normalizeCountry(r["Country"] ?? ""),
    relationship: r["Relationship / Lead Type"] ?? "",
    roleMailbox: r["Role Mailbox Category"] ?? "",
    source,
  };
}

function pickPreferred(rows: LeadRow[], field: keyof LeadRow) {
  for (const r of rows) {
    const v = String(r[field] ?? "").trim();
    if (v) return v;
  }
  return "";
}

function uniqueSlug(name: string, taken: Set<string>) {
  const base = slugify(name) || "company";
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  const slug = `${base}-${n}`;
  taken.add(slug);
  return slug;
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

type Col = { name: string; cast?: string };

async function bulkInsert<T extends Record<string, unknown>>(
  sql: Sql,
  table: string,
  columns: Col[],
  rows: T[],
  returning = "*",
): Promise<Record<string, unknown>[]> {
  if (rows.length === 0) return [];
  const colNames = columns.map((c) => c.name);
  const placeholders = rows
    .map((_, rowIndex) => {
      const start = rowIndex * columns.length + 1;
      const cells = columns.map(
        (col, c) => `$${start + c}${col.cast ? `::${col.cast}` : ""}`,
      );
      return `(${cells.join(", ")})`;
    })
    .join(", ");
  const values = rows.flatMap((row) =>
    columns.map((col) => row[col.name] as unknown),
  );
  const query = `INSERT INTO ${table} (${colNames.join(", ")}) VALUES ${placeholders} RETURNING ${returning}`;
  return (await sql.query(query, values)) as Record<string, unknown>[];
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const invitePath = resolvePath("--invite", [
    path.resolve("scripts/data/invite_ready.csv"),
    "/Users/Microsoft/Downloads/RateQuip_Invite_Ready_Final_2026-07-18.csv",
  ]);
  const creationPath = resolvePath("--creation", [
    path.resolve("scripts/data/company_creation.csv"),
    "/Users/Microsoft/Downloads/RateQuip_Company_Creation_2026-07-18.csv",
  ]);

  console.log("Invite CSV:", invitePath);
  console.log("Creation CSV:", creationPath);

  const [inviteRaw, creationRaw] = await Promise.all([
    readCsv(invitePath),
    readCsv(creationPath),
  ]);

  const inviteRows = inviteRaw
    .map((r) => mapRow(r, "invite"))
    .filter((r): r is LeadRow => Boolean(r));
  const creationRows = creationRaw
    .map((r) => mapRow(r, "creation"))
    .filter((r): r is LeadRow => Boolean(r));

  console.log(
    `Loaded ${inviteRows.length} invite contacts, ${creationRows.length} company-creation contacts`,
  );

  const companies = new Map<string, CompanyAgg>();
  const takenSlugs = new Set<string>();

  const upsert = (row: LeadRow) => {
    const key = companyKey(row.companyName);
    let agg = companies.get(key);
    if (!agg) {
      agg = {
        name: row.companyName.trim(),
        slug: uniqueSlug(row.companyName, takenSlugs),
        website: "",
        country: "",
        city: "",
        industrySector: "",
        industryDetail: "",
        companyType: "",
        relationship: "",
        inviteContacts: [],
        creationContacts: [],
      };
      companies.set(key, agg);
    }
    if (row.source === "invite") agg.inviteContacts.push(row);
    else agg.creationContacts.push(row);

    const all = [...agg.inviteContacts, ...agg.creationContacts];
    agg.website = pickPreferred(all, "website") || agg.website;
    agg.country = pickPreferred(all, "country") || agg.country;
    agg.city = pickPreferred(all, "city") || agg.city;
    agg.industrySector =
      pickPreferred(all, "industrySector") || agg.industrySector;
    agg.industryDetail =
      pickPreferred(all, "industryDetail") || agg.industryDetail;
    agg.companyType = pickPreferred(all, "companyType") || agg.companyType;
    agg.relationship = pickPreferred(all, "relationship") || agg.relationship;
  };

  for (const row of inviteRows) upsert(row);
  for (const row of creationRows) upsert(row);

  const companyList = [...companies.values()];
  console.log(`Unique companies to import: ${companyList.length}`);

  const sql = neon(process.env.DATABASE_URL);

  console.log("Clearing demo marketplace data…");
  await sql`DELETE FROM growth_invitation_recipients`;
  await sql`DELETE FROM growth_invitations`;
  await sql`DELETE FROM company_contact_candidates`;
  await sql`DELETE FROM company_listing_submissions`;
  await sql`DELETE FROM review_documents`;
  await sql`DELETE FROM review_responses`;
  await sql`DELETE FROM reviews`;
  await sql`DELETE FROM quotes`;
  await sql`DELETE FROM project_members`;
  await sql`DELETE FROM projects`;
  await sql`DELETE FROM requests`;
  await sql`DELETE FROM company_claims`;
  await sql`DELETE FROM company_media`;
  await sql`DELETE FROM products`;
  await sql`DELETE FROM company_categories`;
  await sql`DELETE FROM trust_scores`;
  await sql`DELETE FROM saved_suppliers`;
  await sql`DELETE FROM evidence_documents`;
  await sql`DELETE FROM moderation_queue`;
  await sql`DELETE FROM notifications`;
  await sql`DELETE FROM subscriptions`;
  await sql`DELETE FROM organisation_members`;
  await sql`DELETE FROM audit_events`;
  await sql`DELETE FROM companies`;
  // Wallets last: a live app may recreate the demo org wallet during a long
  // companies wipe, so clear ledger/wallets immediately before the org row.
  await sql`DELETE FROM credit_ledger_entries`;
  await sql`DELETE FROM credit_wallets`;
  await sql`DELETE FROM organisations WHERE slug = 'demo-buyer-org'`;

  const catRows = await sql`SELECT id, slug FROM categories`;
  const categoryIdBySlug = new Map(
    catRows.map((r) => [String(r.slug), String(r.id)]),
  );

  console.log("Inserting companies…");
  const companyIdBySlug = new Map<string, string>();
  const companyCols: Col[] = [
    { name: "name" },
    { name: "slug" },
    { name: "headline" },
    { name: "description" },
    { name: "country" },
    { name: "city" },
    { name: "website" },
    { name: "verified" },
    { name: "claimed" },
    { name: "trust_score" },
    { name: "review_count" },
    { name: "employee_range" },
  ];

  for (const [b, batch] of chunk(companyList, 120).entries()) {
    const rows = batch.map((c) => {
      const typeLabel = c.companyType || "Industrial company";
      const sector = c.industrySector || "Sector unverified";
      const headline = `${typeLabel} · ${sector}`.slice(0, 320);
      const detail = [c.industryDetail, c.relationship]
        .filter(Boolean)
        .join(". ");
      const description =
        detail ||
        `${c.name} was imported from the RateQuip lead master. This profile is unclaimed until a company representative verifies authority.`;
      const website = c.website
        ? c.website.startsWith("http")
          ? c.website
          : `https://${c.website}`
        : null;
      return {
        name: c.name.slice(0, 255),
        slug: c.slug,
        headline,
        description: description.slice(0, 8000),
        country: c.country.slice(0, 100) || null,
        city: c.city.slice(0, 100) || null,
        website,
        verified: false,
        claimed: false,
        trust_score: "0",
        review_count: 0,
        employee_range: "Unknown",
      };
    });
    const inserted = await bulkInsert(
      sql,
      "companies",
      companyCols,
      rows,
      "id, slug",
    );
    for (const row of inserted) {
      companyIdBySlug.set(String(row.slug), String(row.id));
    }
    if ((b + 1) % 10 === 0 || b === Math.ceil(companyList.length / 120) - 1) {
      console.log(
        `  companies ${Math.min((b + 1) * 120, companyList.length)} / ${companyList.length}`,
      );
    }
  }

  console.log("Linking categories + trust scores…");
  const categoryLinks: Record<string, unknown>[] = [];
  const trustRows: Record<string, unknown>[] = [];
  for (const c of companyList) {
    const companyId = companyIdBySlug.get(c.slug);
    if (!companyId) continue;
    trustRows.push({
      company_id: companyId,
      score: "0",
      review_component: "0",
      verification_component: "0",
      activity_component: "0",
    });
    const catSlug = sectorToCategorySlug(c.industrySector);
    const categoryId = catSlug ? categoryIdBySlug.get(catSlug) : undefined;
    if (categoryId) {
      categoryLinks.push({ company_id: companyId, category_id: categoryId });
    }
  }

  for (const batch of chunk(trustRows, 200)) {
    await bulkInsert(
      sql,
      "trust_scores",
      [
        { name: "company_id", cast: "uuid" },
        { name: "score" },
        { name: "review_component" },
        { name: "verification_component" },
        { name: "activity_component" },
      ],
      batch,
      "company_id",
    );
  }
  for (const batch of chunk(categoryLinks, 200)) {
    await bulkInsert(
      sql,
      "company_categories",
      [
        { name: "company_id", cast: "uuid" },
        { name: "category_id", cast: "uuid" },
      ],
      batch,
      "id",
    );
  }

  const expiresAt = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 90,
  ).toISOString();
  const inviteCompanies = companyList.filter((c) => c.inviteContacts.length > 0);
  const submissionIdBySlug = new Map<string, string>();
  const invitationIdBySlug = new Map<string, string>();

  console.log(
    `Creating claim invitations for ${inviteCompanies.length} invite-ready companies…`,
  );

  for (const batch of chunk(inviteCompanies, 80)) {
    const submissionRows = batch
      .map((company) => {
        const companyId = companyIdBySlug.get(company.slug);
        if (!companyId) return null;
        const domain = company.website
          ? company.website
              .replace(/^https?:\/\//, "")
              .replace(/^www\./, "")
              .split("/")[0]
          : null;
        return {
          status: "published",
          version: 1,
          company_name: company.name.slice(0, 255),
          normalized_name: companyKey(company.name).slice(0, 255),
          website_url: company.website || null,
          registrable_domain: domain,
          company_types: JSON.stringify([
            company.companyType || "Other / Unclassified",
          ]),
          locality: company.city || null,
          phone_display: pickPreferred(company.inviteContacts, "phone") || null,
          private_notes: `Lead import; sector=${company.industrySector || "unverified"}`,
          relationship: company.relationship || "imported_lead",
          intended_purpose: "company_claim",
          conflict_declared: false,
          disclosure_preference: "anonymous_ratequip_user",
          published_company_id: companyId,
          published_at: new Date().toISOString(),
          idempotency_key: `lead-import-${company.slug}`.slice(0, 128),
          _slug: company.slug,
        };
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    const inserted = await bulkInsert(
      sql,
      "company_listing_submissions",
      [
        { name: "status" },
        { name: "version" },
        { name: "company_name" },
        { name: "normalized_name" },
        { name: "website_url" },
        { name: "registrable_domain" },
        { name: "company_types", cast: "jsonb" },
        { name: "locality" },
        { name: "phone_display" },
        { name: "private_notes" },
        { name: "relationship" },
        { name: "intended_purpose" },
        { name: "conflict_declared" },
        { name: "disclosure_preference" },
        { name: "published_company_id", cast: "uuid" },
        { name: "published_at", cast: "timestamptz" },
        { name: "idempotency_key" },
      ],
      submissionRows.map(({ _slug: _, ...rest }) => rest),
      "id, idempotency_key",
    );
    const byKey = new Map(
      inserted.map((r) => [String(r.idempotency_key), String(r.id)]),
    );
    for (const row of submissionRows) {
      const id = byKey.get(row.idempotency_key);
      if (id) submissionIdBySlug.set(row._slug, id);
    }

    const invitationRows = batch
      .map((company) => {
        const companyId = companyIdBySlug.get(company.slug);
        const submissionId = submissionIdBySlug.get(company.slug);
        if (!companyId || !submissionId) return null;
        return {
          purpose: "company_claim",
          source_submission_id: submissionId,
          company_id: companyId,
          disclosure_preference: "anonymous_ratequip_user",
          template_family: "claim_invite",
          template_version: "v1",
          locale: "en",
          status: "active",
          credit_cost: 0,
          expires_at: expiresAt,
        };
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    const invInserted = await bulkInsert(
      sql,
      "growth_invitations",
      [
        { name: "purpose" },
        { name: "source_submission_id", cast: "uuid" },
        { name: "company_id", cast: "uuid" },
        { name: "disclosure_preference" },
        { name: "template_family" },
        { name: "template_version" },
        { name: "locale" },
        { name: "status" },
        { name: "credit_cost" },
        { name: "expires_at", cast: "timestamptz" },
      ],
      invitationRows,
      "id, company_id",
    );
    const invByCompany = new Map(
      invInserted.map((r) => [String(r.company_id), String(r.id)]),
    );
    for (const company of batch) {
      const companyId = companyIdBySlug.get(company.slug);
      if (!companyId) continue;
      const invId = invByCompany.get(companyId);
      if (invId) invitationIdBySlug.set(company.slug, invId);
    }
    process.stdout.write(".");
  }
  console.log("");

  type ContactPayload = {
    submission_id: string;
    company_id: string;
    email_ciphertext: string;
    email_normalized_hash: string;
    email_domain: string;
    email_masked: string;
    contact_name_ciphertext: string | null;
    role: string;
    source_type: string;
    send_after_publish: boolean;
    domain_match_category: string;
    send_eligibility: string;
    _invitation_id: string;
  };

  const contactPayload: ContactPayload[] = [];
  for (const company of inviteCompanies) {
    const companyId = companyIdBySlug.get(company.slug);
    const submissionId = submissionIdBySlug.get(company.slug);
    const invitationId = invitationIdBySlug.get(company.slug);
    if (!companyId || !submissionId || !invitationId) continue;
    const seen = new Set<string>();
    for (const contact of company.inviteContacts) {
      if (!contact.email?.includes("@")) continue;
      const email = normalizeEmail(contact.email);
      if (seen.has(email)) continue;
      seen.add(email);
      contactPayload.push({
        submission_id: submissionId,
        company_id: companyId,
        email_ciphertext: encryptEmailDemo(email),
        email_normalized_hash: emailNormalizedHash(email),
        email_domain: email.split("@")[1] ?? "",
        email_masked: maskEmail(email),
        contact_name_ciphertext: contact.contactName
          ? encryptTextDemo(contact.contactName)
          : null,
        role: (contact.roleMailbox || contact.jobTitle || "contact").slice(
          0,
          64,
        ),
        source_type: "lead_import",
        send_after_publish: true,
        domain_match_category: "imported",
        send_eligibility: "eligible",
        _invitation_id: invitationId,
      });
    }
  }

  console.log(`Inserting ${contactPayload.length} invite contacts…`);
  let contactCount = 0;
  for (const batch of chunk(contactPayload, 100)) {
    const inserted = await bulkInsert(
      sql,
      "company_contact_candidates",
      [
        { name: "submission_id", cast: "uuid" },
        { name: "company_id", cast: "uuid" },
        { name: "email_ciphertext" },
        { name: "email_normalized_hash" },
        { name: "email_domain" },
        { name: "email_masked" },
        { name: "contact_name_ciphertext" },
        { name: "role" },
        { name: "source_type" },
        { name: "send_after_publish" },
        { name: "domain_match_category" },
        { name: "send_eligibility" },
      ],
      batch.map(({ _invitation_id: _, ...rest }) => rest),
      "id, email_normalized_hash",
    );
    contactCount += inserted.length;
    const idByHash = new Map(
      inserted.map((r) => [
        String(r.email_normalized_hash),
        String(r.id),
      ]),
    );
    const recipients = batch
      .map((c) => {
        const candidateId = idByHash.get(c.email_normalized_hash);
        if (!candidateId) return null;
        const { tokenHash, tokenPrefix } = createClaimToken();
        return {
          invitation_id: c._invitation_id,
          contact_candidate_id: candidateId,
          email_ciphertext: c.email_ciphertext,
          email_normalized_hash: c.email_normalized_hash,
          email_domain: c.email_domain,
          email_masked: c.email_masked,
          token_hash: tokenHash,
          token_prefix: tokenPrefix,
          state: "queued",
          expires_at: expiresAt,
        };
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    await bulkInsert(
      sql,
      "growth_invitation_recipients",
      [
        { name: "invitation_id", cast: "uuid" },
        { name: "contact_candidate_id", cast: "uuid" },
        { name: "email_ciphertext" },
        { name: "email_normalized_hash" },
        { name: "email_domain" },
        { name: "email_masked" },
        { name: "token_hash" },
        { name: "token_prefix" },
        { name: "state" },
        { name: "expires_at", cast: "timestamptz" },
      ],
      recipients,
      "id",
    );
    process.stdout.write(".");
  }
  console.log("");

  const creationOnly = companyList.filter(
    (c) => c.inviteContacts.length === 0 && c.creationContacts.length > 0,
  );
  console.log(
    `Storing ${creationOnly.length} company-creation profiles (no auto-invite)…`,
  );
  const holdSubmissionIdBySlug = new Map<string, string>();

  for (const batch of chunk(creationOnly, 80)) {
    const submissionRows = batch
      .map((company) => {
        const companyId = companyIdBySlug.get(company.slug);
        if (!companyId) return null;
        return {
          status: "published",
          version: 1,
          company_name: company.name.slice(0, 255),
          normalized_name: companyKey(company.name).slice(0, 255),
          website_url: company.website || null,
          company_types: JSON.stringify([
            company.companyType || "Other / Unclassified",
          ]),
          locality: company.city || null,
          private_notes: "Company creation / hold — do not auto-invite",
          relationship: company.relationship || "imported_lead",
          intended_purpose: "company_listing",
          disclosure_preference: "anonymous_ratequip_user",
          published_company_id: companyId,
          published_at: new Date().toISOString(),
          idempotency_key: `lead-creation-${company.slug}`.slice(0, 128),
          _slug: company.slug,
        };
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    const inserted = await bulkInsert(
      sql,
      "company_listing_submissions",
      [
        { name: "status" },
        { name: "version" },
        { name: "company_name" },
        { name: "normalized_name" },
        { name: "website_url" },
        { name: "company_types", cast: "jsonb" },
        { name: "locality" },
        { name: "private_notes" },
        { name: "relationship" },
        { name: "intended_purpose" },
        { name: "disclosure_preference" },
        { name: "published_company_id", cast: "uuid" },
        { name: "published_at", cast: "timestamptz" },
        { name: "idempotency_key" },
      ],
      submissionRows.map(({ _slug: _, ...rest }) => rest),
      "id, idempotency_key",
    );
    const byKey = new Map(
      inserted.map((r) => [String(r.idempotency_key), String(r.id)]),
    );
    for (const row of submissionRows) {
      const id = byKey.get(row.idempotency_key);
      if (id) holdSubmissionIdBySlug.set(row._slug, id);
    }
    process.stdout.write(".");
  }
  console.log("");

  const holdContacts: Record<string, unknown>[] = [];
  for (const company of creationOnly) {
    const companyId = companyIdBySlug.get(company.slug);
    const submissionId = holdSubmissionIdBySlug.get(company.slug);
    if (!companyId || !submissionId) continue;
    const seen = new Set<string>();
    for (const contact of company.creationContacts) {
      if (!contact.email?.includes("@")) continue;
      const email = normalizeEmail(contact.email);
      if (seen.has(email)) continue;
      seen.add(email);
      holdContacts.push({
        submission_id: submissionId,
        company_id: companyId,
        email_ciphertext: encryptEmailDemo(email),
        email_normalized_hash: emailNormalizedHash(email),
        email_domain: email.split("@")[1] ?? "",
        email_masked: maskEmail(email),
        contact_name_ciphertext: contact.contactName
          ? encryptTextDemo(contact.contactName)
          : null,
        role: (contact.roleMailbox || contact.jobTitle || "contact").slice(
          0,
          64,
        ),
        source_type: "lead_import_hold",
        send_after_publish: false,
        domain_match_category: "imported",
        send_eligibility: "held",
      });
    }
  }

  console.log(`Inserting ${holdContacts.length} held contacts…`);
  for (const batch of chunk(holdContacts, 100)) {
    await bulkInsert(
      sql,
      "company_contact_candidates",
      [
        { name: "submission_id", cast: "uuid" },
        { name: "company_id", cast: "uuid" },
        { name: "email_ciphertext" },
        { name: "email_normalized_hash" },
        { name: "email_domain" },
        { name: "email_masked" },
        { name: "contact_name_ciphertext" },
        { name: "role" },
        { name: "source_type" },
        { name: "send_after_publish" },
        { name: "domain_match_category" },
        { name: "send_eligibility" },
      ],
      batch,
      "id",
    );
    contactCount += batch.length;
    process.stdout.write(".");
  }
  console.log("");

  const summary = await sql`
    SELECT
      (SELECT count(*)::int FROM companies) AS companies,
      (SELECT count(*)::int FROM company_listing_submissions) AS submissions,
      (SELECT count(*)::int FROM company_contact_candidates) AS contacts,
      (SELECT count(*)::int FROM growth_invitations) AS invitations,
      (SELECT count(*)::int FROM growth_invitation_recipients) AS recipients,
      (SELECT count(*)::int FROM company_categories) AS category_links
  `;

  console.log("Import complete.");
  console.log(summary[0]);
  console.log({
    inviteContactsLoaded: inviteRows.length,
    creationContactsLoaded: creationRows.length,
    companiesBuilt: companyList.length,
    inviteCompanies: inviteCompanies.length,
    creationOnlyCompanies: creationOnly.length,
    contactsWritten: contactCount,
  });
  console.log(
    "Note: invitation recipients are queued only — no outreach emails were sent.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
