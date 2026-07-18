/**
 * Upsert RateQuip global LEI expansion (100k) from enrichment spreadsheets.
 *
 * - Keeps existing AU/master companies
 * - Adds new global companies (unclaimed)
 * - Stores only published/verified emails as held contacts (no auto-invite)
 * - Speculative estimated emails are not stored
 *
 *   npm run db:import-global -- \
 *     --companies scripts/data/global_companies_100k.csv \
 *     --contacts scripts/data/global_verified_contacts.csv
 */
import { config } from "dotenv";
import { createHmac } from "crypto";
import { createReadStream, existsSync } from "fs";
import { createInterface } from "readline";
import path from "path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const HMAC_SECRET =
  process.env.OG_EMAIL_HMAC_SECRET ?? "ratequip-demo-og-hmac-v10.1";

type Sql = NeonQueryFunction<false, false>;
type Col = { name: string; cast?: string };

type GlobalRow = {
  recordId: string;
  name: string;
  lei: string;
  country: string;
  sector: string;
  claimRec: string;
  sourceUrl: string;
  relevance: string;
  primaryEmail: string;
  website: string;
  contactPage: string;
  inviteRec: string;
  bestEmail: string;
  emailStatus: string;
  emailConfidence: string;
  candidateDomain: string;
};

function arg(flag: string) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function resolvePath(flag: string, candidates: string[]) {
  const fromArg = arg(flag);
  if (fromArg) return path.resolve(fromArg);
  for (const c of candidates) if (existsSync(c)) return c;
  throw new Error(`Missing ${flag}. Tried:\n${candidates.join("\n")}`);
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
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

async function readCsv(filePath: string) {
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

async function bulkInsert(
  sql: Sql,
  table: string,
  columns: Col[],
  rows: Record<string, unknown>[],
  returning = "*",
) {
  if (!rows.length) return [] as Record<string, unknown>[];
  const placeholders = rows
    .map((_, rowIndex) => {
      const start = rowIndex * columns.length + 1;
      return `(${columns
        .map((col, c) => `$${start + c}${col.cast ? `::${col.cast}` : ""}`)
        .join(", ")})`;
    })
    .join(", ");
  const values = rows.flatMap((row) =>
    columns.map((col) => row[col.name] as unknown),
  );
  const query = `INSERT INTO ${table} (${columns.map((c) => c.name).join(", ")}) VALUES ${placeholders} RETURNING ${returning}`;
  return (await sql.query(query, values)) as Record<string, unknown>[];
}

function uniqueSlug(
  name: string,
  country: string,
  lei: string,
  taken: Set<string>,
) {
  const base = slugify(name) || "company";
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  const withCountry = slugify(`${base}-${country}`).slice(0, 90);
  if (withCountry && !taken.has(withCountry)) {
    taken.add(withCountry);
    return withCountry;
  }
  const withLei = `${base}-${lei.slice(-8).toLowerCase()}`.slice(0, 100);
  if (!taken.has(withLei)) {
    taken.add(withLei);
    return withLei;
  }
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  const slug = `${base}-${n}`;
  taken.add(slug);
  return slug;
}

function sectorToCategorySlug(sector: string): string | null {
  const s = sector.trim().toLowerCase();
  if (!s || s === "sector unverified") return null;
  if (s.includes("food") || s.includes("beverage") || s.includes("agriculture") || s.includes("agribusiness"))
    return "food-processing";
  if (s.includes("packaging") || s.includes("labell"))
    return "packaging-machinery";
  if (
    s.includes("machiner") ||
    s.includes("automation") ||
    s.includes("industrial equipment") ||
    s.includes("technology") ||
    s.includes("software")
  )
    return s.includes("technology") || s.includes("software")
      ? "factory-automation"
      : "industrial-equipment";
  if (s.includes("pharma") || s.includes("health") || s.includes("medical") || s.includes("cosmetic"))
    return "inspection-qc";
  if (s.includes("logistic") || s.includes("warehous") || s.includes("transport") || s.includes("marine") || s.includes("ship"))
    return "heavy-logistics";
  if (
    s.includes("energy") ||
    s.includes("oil") ||
    s.includes("gas") ||
    s.includes("mining") ||
    s.includes("metal") ||
    s.includes("chemical") ||
    s.includes("automotive") ||
    s.includes("utilit")
  )
    return "industrial-equipment";
  if (
    s.includes("professional") ||
    s.includes("financial") ||
    s.includes("insurance") ||
    s.includes("real estate") ||
    s.includes("retail") ||
    s.includes("wholesale") ||
    s.includes("government")
  )
    return "general-business";
  return "general-business";
}

function isPublishableEmail(status: string) {
  const s = status.toLowerCase();
  return (
    s.includes("published") ||
    s.includes("search-index")
  );
}

function buildDescription(row: GlobalRow) {
  const sector =
    row.sector && row.sector !== "Sector Unverified"
      ? row.sector
      : "";
  const parts: string[] = [];
  if (sector) {
    parts.push(
      `${row.name} is a verified legal entity listed on RateQuip in the ${sector} sector.`,
    );
  } else {
    parts.push(
      `${row.name} is a verified legal entity listed on RateQuip from the GLEIF LEI registry.`,
    );
  }
  if (row.country) parts.push(`Registered in ${row.country}.`);
  if (row.relevance && row.relevance !== "Unverified") {
    parts.push(`RateQuip relevance: ${row.relevance}.`);
  }
  if (row.lei) parts.push(`LEI: ${row.lei}.`);
  parts.push(
    "This profile is currently unclaimed until a company representative verifies authority.",
  );
  if (row.website) parts.push(`Website: ${row.website}.`);
  if (row.sourceUrl) parts.push(`Source: ${row.sourceUrl}`);
  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 8000);
}

function mapCompany(r: Record<string, string>): GlobalRow | null {
  const name = (r["Company Name"] ?? "").trim();
  const recordId = (r["RateQuip Record ID"] ?? "").trim();
  if (!name || !recordId) return null;
  return {
    recordId,
    name,
    lei: (r["LEI"] ?? "").trim(),
    country: (r["Country"] ?? "").trim(),
    sector: (r["Industry Sector"] ?? "").trim() || "Sector Unverified",
    claimRec: (r["Claim Invitation Recommendation"] ?? "").trim(),
    sourceUrl: (r["Public Source URL"] ?? "").trim(),
    relevance: (r["RateQuip Relevance"] ?? "").trim() || "Unverified",
    primaryEmail: (r["Primary Public Email"] ?? "").trim(),
    website: (r["Website"] ?? "").trim(),
    contactPage: (r["Contact Page URL"] ?? "").trim(),
    inviteRec: (r["Invitation Recommendation"] ?? "").trim(),
    bestEmail: (r["Best Available Email"] ?? "").trim(),
    emailStatus: (r["Email Status"] ?? "").trim(),
    emailConfidence: (r["Email Confidence"] ?? "").trim(),
    candidateDomain: (r["Candidate Domain"] ?? "").trim(),
  };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");

  const companiesPath = resolvePath("--companies", [
    path.resolve("scripts/data/global_companies_100k.csv"),
  ]);
  const contactsPath = resolvePath("--contacts", [
    path.resolve("scripts/data/global_verified_contacts.csv"),
  ]);

  console.log("Companies CSV:", companiesPath);
  console.log("Contacts CSV:", contactsPath);

  const [rawCompanies, rawContacts] = await Promise.all([
    readCsv(companiesPath),
    readCsv(contactsPath),
  ]);
  const rows = rawCompanies
    .map(mapCompany)
    .filter((r): r is GlobalRow => Boolean(r));
  console.log(`Loaded ${rows.length} global companies, ${rawContacts.length} verified contacts`);

  const sql = neon(process.env.DATABASE_URL) as Sql;

  const existing = await sql`SELECT id::text AS id, name, slug, website, country FROM companies`;
  const takenSlugs = new Set(existing.map((r) => String(r.slug)));
  const byName = new Map<string, { id: string; website: string; country: string }>();
  for (const r of existing) {
    byName.set(companyKey(String(r.name)), {
      id: String(r.id),
      website: String(r.website ?? ""),
      country: String(r.country ?? ""),
    });
  }
  console.log(`Existing companies in DB: ${existing.length}`);

  const catRows = await sql`SELECT id::text AS id, slug FROM categories`;
  const categoryIdBySlug = new Map(
    catRows.map((r) => [String(r.slug), String(r.id)]),
  );

  const toInsert: {
    row: GlobalRow;
    slug: string;
    headline: string;
    description: string;
    website: string | null;
  }[] = [];
  const toUpdateWebsite: { id: string; website: string }[] = [];
  let skippedExisting = 0;

  for (const row of rows) {
    const key = companyKey(row.name);
    const existingCo = byName.get(key);
    if (existingCo) {
      skippedExisting++;
      if (!existingCo.website && row.website) {
        toUpdateWebsite.push({ id: existingCo.id, website: row.website });
      }
      continue;
    }
    const website = row.website
      ? row.website.startsWith("http")
        ? row.website
        : `https://${row.website}`
      : null;
    const headline =
      `Legal entity · ${row.sector || "Sector Unverified"}`.slice(0, 320);
    toInsert.push({
      row,
      slug: uniqueSlug(row.name, row.country, row.lei, takenSlugs),
      headline,
      description: buildDescription(row),
      website,
    });
  }

  console.log(
    `Inserting ${toInsert.length} new companies; enriching website on ${toUpdateWebsite.length} existing; name overlaps skipped ${skippedExisting}`,
  );

  for (const batch of chunk(toUpdateWebsite, 100)) {
    if (!batch.length) continue;
    const values: unknown[] = [];
    const tuples = batch
      .map((r, i) => {
        const b = i * 2;
        values.push(r.id, r.website);
        return `($${b + 1}::uuid, $${b + 2})`;
      })
      .join(", ");
    await sql.query(
      `UPDATE companies AS c SET website = v.website, updated_at = NOW()
       FROM (VALUES ${tuples}) AS v(id, website)
       WHERE c.id = v.id AND (c.website IS NULL OR c.website = '')`,
      values,
    );
  }

  const companyIdByRecord = new Map<string, string>();
  const companyIdBySlug = new Map<string, string>();
  let inserted = 0;

  for (const batch of chunk(toInsert, 100)) {
    const payload = batch.map((item) => ({
      name: item.row.name.slice(0, 255),
      slug: item.slug,
      headline: item.headline,
      description: item.description,
      country: item.row.country.slice(0, 100) || null,
      city: null as string | null,
      website: item.website,
      verified: false,
      claimed: false,
      trust_score: "0",
      review_count: 0,
      employee_range: "Unknown",
    }));

    const result = await bulkInsert(
      sql,
      "companies",
      [
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
      ],
      payload,
      "id, slug",
    );

    for (let i = 0; i < result.length; i++) {
      const id = String(result[i].id);
      const slug = String(result[i].slug);
      companyIdBySlug.set(slug, id);
      companyIdByRecord.set(batch[i].row.recordId, id);
      byName.set(companyKey(batch[i].row.name), {
        id,
        website: batch[i].website ?? "",
        country: batch[i].row.country,
      });
    }
    inserted += result.length;
    if (inserted % 5000 === 0 || inserted === toInsert.length) {
      console.log(`  companies ${inserted} / ${toInsert.length}`);
    }
  }

  // Trust scores + categories for newly inserted
  console.log("Linking trust scores + categories…");
  const trustRows: Record<string, unknown>[] = [];
  const categoryLinks: Record<string, unknown>[] = [];
  for (const item of toInsert) {
    const companyId = companyIdBySlug.get(item.slug);
    if (!companyId) continue;
    trustRows.push({
      company_id: companyId,
      score: "0",
      review_component: "0",
      verification_component: "0",
      activity_component: "0",
    });
    const catSlug = sectorToCategorySlug(item.row.sector);
    const categoryId = catSlug ? categoryIdBySlug.get(catSlug) : undefined;
    if (categoryId) {
      categoryLinks.push({ company_id: companyId, category_id: categoryId });
    } else {
      const fallback = categoryIdBySlug.get("general-business");
      if (fallback) {
        categoryLinks.push({ company_id: companyId, category_id: fallback });
      }
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

  // Resolve company IDs for contact attachment (new + existing by name)
  async function resolveCompanyId(recordId: string, name: string) {
    if (companyIdByRecord.has(recordId)) return companyIdByRecord.get(recordId)!;
    const existingCo = byName.get(companyKey(name));
    return existingCo?.id ?? null;
  }

  // Build publishable email list from company sheet + verified contacts
  type HeldContact = {
    companyId: string;
    recordId: string;
    name: string;
    email: string;
    contactName: string;
    role: string;
    source: string;
  };
  const held: HeldContact[] = [];
  const seenPair = new Set<string>();

  for (const row of rows) {
    if (!isPublishableEmail(row.emailStatus)) continue;
    const email = row.primaryEmail || row.bestEmail;
    if (!email?.includes("@")) continue;
    const companyId = await resolveCompanyId(row.recordId, row.name);
    if (!companyId) continue;
    const key = `${companyId}:${normalizeEmail(email)}`;
    if (seenPair.has(key)) continue;
    seenPair.add(key);
    held.push({
      companyId,
      recordId: row.recordId,
      name: row.name,
      email,
      contactName: "",
      role: "public_contact",
      source: `global_${row.emailStatus.toLowerCase().replace(/\s+/g, "_")}`,
    });
  }

  for (const c of rawContacts) {
    const recordId = (c["RateQuip Record ID"] ?? "").trim();
    const name = (c["Company Name"] ?? "").trim();
    const email = (c["Email Address"] ?? "").trim();
    const invite = (c["Invitation Recommendation"] ?? "").toLowerCase();
    if (!recordId || !name || !email.includes("@")) continue;
    // Skip clearly unsuitable role mailboxes for storage as claim contacts
    if (invite.includes("do not invite")) continue;
    const companyId = await resolveCompanyId(recordId, name);
    if (!companyId) continue;
    const key = `${companyId}:${normalizeEmail(email)}`;
    if (seenPair.has(key)) continue;
    seenPair.add(key);
    held.push({
      companyId,
      recordId,
      name,
      email,
      contactName: (c["Contact Name"] ?? "").trim(),
      role: (c["Contact Role"] ?? "verified_contact").slice(0, 64),
      source: "global_verified_contact",
    });
  }

  console.log(`Creating held contacts for ${held.length} published/verified emails…`);

  // One submission per company that has held contacts
  const byCompany = new Map<string, HeldContact[]>();
  for (const h of held) {
    const list = byCompany.get(h.companyId) ?? [];
    list.push(h);
    byCompany.set(h.companyId, list);
  }

  let submissions = 0;
  let contactsWritten = 0;
  for (const batch of chunk([...byCompany.entries()], 40)) {
    for (const [companyId, contacts] of batch) {
      const first = contacts[0];
      const idempotencyKey = `global-enrich-${first.recordId}`.slice(0, 128);
      const existingSub = await sql`
        SELECT id::text AS id FROM company_listing_submissions
        WHERE idempotency_key = ${idempotencyKey}
        LIMIT 1
      `;
      let submissionId = existingSub[0] ? String(existingSub[0].id) : null;
      if (!submissionId) {
        const [submission] = await sql`
          INSERT INTO company_listing_submissions (
            status, version, company_name, normalized_name, website_url,
            company_types, private_notes, relationship, intended_purpose,
            disclosure_preference, published_company_id, published_at,
            public_source_url, idempotency_key
          ) VALUES (
            'published', 1, ${first.name.slice(0, 255)}, ${companyKey(first.name)},
            ${null},
            ${JSON.stringify(["Legal Entity"])}::jsonb,
            ${`Global LEI enrichment ${first.recordId}; held contacts only — do not auto-invite`},
            ${"global_lei_enrichment"},
            ${"company_listing"},
            ${"anonymous_ratequip_user"},
            ${companyId},
            NOW(),
            ${rows.find((r) => r.recordId === first.recordId)?.sourceUrl || null},
            ${idempotencyKey}
          )
          RETURNING id
        `;
        submissionId = submission ? String(submission.id) : null;
      }
      if (!submissionId) continue;
      submissions++;

      const contactRows = contacts.map((c) => ({
        submission_id: submissionId!,
        company_id: companyId,
        email_ciphertext: encryptEmailDemo(c.email),
        email_normalized_hash: emailNormalizedHash(c.email),
        email_domain: normalizeEmail(c.email).split("@")[1] ?? "",
        email_masked: maskEmail(c.email),
        contact_name_ciphertext: c.contactName
          ? `enc:v1:${Buffer.from(c.contactName, "utf8").toString("base64")}`
          : null,
        role: c.role.slice(0, 64),
        source_type: c.source.slice(0, 64),
        send_after_publish: false,
        domain_match_category: "imported",
        send_eligibility: "held",
      }));

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
        contactRows,
        "id",
      );
      contactsWritten += contactRows.length;
    }
    process.stdout.write(".");
  }
  console.log("");

  const summary = await sql`
    SELECT
      (SELECT count(*)::int FROM companies) AS companies,
      (SELECT count(*)::int FROM company_categories) AS category_links,
      (SELECT count(*)::int FROM company_contact_candidates WHERE source_type LIKE 'global%') AS global_contacts,
      (SELECT count(*)::int FROM company_listing_submissions WHERE relationship = 'global_lei_enrichment') AS global_submissions
  `;

  console.log("Import complete.");
  console.log(summary[0]);
  console.log({
    loaded: rows.length,
    inserted,
    websiteUpdates: toUpdateWebsite.length,
    nameOverlapsSkipped: skippedExisting,
    heldContactSubmissions: submissions,
    heldContactsWritten: contactsWritten,
  });
  console.log(
    "Note: speculative estimated emails were not stored; no claim invitations were queued.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
