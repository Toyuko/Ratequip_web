/**
 * Rewrite public company descriptions from lead fields + category links.
 *
 *   npx tsx scripts/enrich-descriptions.ts
 */
import { config } from "dotenv";
import { createReadStream, existsSync } from "fs";
import { createInterface } from "readline";
import path from "path";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
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

function companyKey(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function article(word: string) {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}

function cleanSector(sector: string) {
  const s = sector.trim();
  if (
    !s ||
    /^sector unverified$/i.test(s) ||
    /^industrial markets$/i.test(s)
  ) {
    return "";
  }
  return s;
}

function cleanType(type: string) {
  const t = type.trim();
  if (
    !t ||
    /^other\s*\/\s*unclassified$/i.test(t) ||
    /^industrial company$/i.test(t)
  ) {
    return "";
  }
  return t;
}

function locationClause(city?: string | null, country?: string | null) {
  const cityLabel = (city ?? "").trim();
  const countryLabel = (country ?? "").trim();
  if (cityLabel && countryLabel) return ` Based in ${cityLabel}, ${countryLabel}.`;
  if (countryLabel) return ` Based in ${countryLabel}.`;
  if (cityLabel) return ` Based in ${cityLabel}.`;
  return "";
}

function categoryClause(categoryNames: string[]) {
  const parents = categoryNames.filter((n) =>
    [
      "Packaging Equipment",
      "Processing Equipment",
      "Industrial Equipment",
      "Automation and Controls",
      "Service Categories",
      "General Business",
      "Inspection & QC",
      "Heavy Logistics",
    ].includes(n),
  );
  const leaves = categoryNames.filter((n) => !parents.includes(n));
  const focus = [...leaves.slice(0, 3), ...parents.slice(0, 2)];
  const unique = [...new Set(focus)];
  if (!unique.length) return "";
  if (unique.length === 1) return ` Active in ${unique[0]}.`;
  if (unique.length === 2) return ` Active in ${unique[0]} and ${unique[1]}.`;
  return ` Active in ${unique.slice(0, -1).join(", ")}, and ${unique.at(-1)}.`;
}

function buildDescription(input: {
  name: string;
  type: string;
  sector: string;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  detail?: string;
  categoryNames: string[];
}) {
  const type = cleanType(input.type);
  const sector = cleanSector(input.sector);
  const detail = (input.detail ?? "").trim().replace(/\s+/g, " ");
  const loc = locationClause(input.city, input.country);
  const cats = categoryClause(input.categoryNames);

  const parts: string[] = [];

  if (type && sector) {
    parts.push(
      `${input.name} is listed on RateQuip as ${article(type)} ${type} in the ${sector} sector.`,
    );
  } else if (type) {
    parts.push(
      `${input.name} is listed on RateQuip as ${article(type)} ${type}.`,
    );
  } else if (sector) {
    parts.push(
      `${input.name} is listed on RateQuip in the ${sector} sector.`,
    );
  } else {
    parts.push(`${input.name} is listed on RateQuip as an industrial company profile.`);
  }

  if (loc) parts.push(loc.trim());
  if (cats) parts.push(cats.trim());

  if (detail) {
    const detailSentence = /[.!?]$/.test(detail) ? detail : `${detail}.`;
    parts.push(`Products and focus: ${detailSentence}`);
  }

  parts.push(
    "This profile is currently unclaimed until a company representative verifies authority.",
  );

  if (input.website) {
    parts.push(`Website: ${input.website}.`);
  }

  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 8000);
}

async function loadIndustryDetails() {
  const candidates = [
    path.resolve("scripts/data/invite_ready.csv"),
    path.resolve("scripts/data/company_creation.csv"),
    "/Users/Microsoft/Downloads/RateQuip_Invite_Ready_Final_2026-07-18.csv",
  ];
  const detailByCompany = new Map<string, string>();

  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const rows = await readCsv(file);
    for (const row of rows) {
      const name = (row["Company Name"] ?? "").trim();
      const detail = (row["Industry Detail / Products"] ?? "").trim();
      if (!name || !detail) continue;
      const key = companyKey(name);
      // Prefer longer/more specific detail
      const existing = detailByCompany.get(key) ?? "";
      if (detail.length > existing.length) detailByCompany.set(key, detail);
    }
    console.log(`Loaded details from ${file} (map size ${detailByCompany.size})`);
  }
  return detailByCompany;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
  const sql = neon(process.env.DATABASE_URL);
  const details = await loadIndustryDetails();

  const companies = await sql`
    SELECT
      c.id::text AS id,
      c.name,
      coalesce(c.headline, '') AS headline,
      coalesce(c.city, '') AS city,
      coalesce(c.country, '') AS country,
      coalesce(c.website, '') AS website,
      coalesce(
        array_agg(cat.name ORDER BY cat.name)
          FILTER (WHERE cat.name IS NOT NULL),
        '{}'
      ) AS categories
    FROM companies c
    LEFT JOIN company_categories cc ON cc.company_id = c.id
    LEFT JOIN categories cat ON cat.id = cc.category_id
    GROUP BY c.id
  `;

  console.log(`Enriching ${companies.length} companies…`);

  let withDetail = 0;
  const updates: { id: string; description: string }[] = [];

  for (const co of companies) {
    const [typePart = "", sectorPart = ""] = String(co.headline)
      .split("·")
      .map((s) => s.trim());
    const detail = details.get(companyKey(String(co.name)));
    if (detail) withDetail++;

    const description = buildDescription({
      name: String(co.name),
      type: typePart,
      sector: sectorPart,
      city: String(co.city) || null,
      country: String(co.country) || null,
      website: String(co.website) || null,
      detail,
      categoryNames: (co.categories as string[]) ?? [],
    });

    updates.push({
      id: String(co.id),
      description,
    });
  }

  console.log(`Companies with industry-detail text: ${withDetail}`);

  let updated = 0;
  for (const batch of chunk(updates, 80)) {
    const values: unknown[] = [];
    const tuples = batch
      .map((row, i) => {
        const base = i * 2;
        values.push(row.id, row.description);
        return `($${base + 1}::uuid, $${base + 2})`;
      })
      .join(", ");

    await sql.query(
      `UPDATE companies AS c SET
         description = v.description,
         updated_at = NOW()
       FROM (VALUES ${tuples}) AS v(id, description)
       WHERE c.id = v.id`,
      values,
    );
    updated += batch.length;
    if (updated % 800 === 0 || updated === updates.length) {
      console.log(`  updated ${updated} / ${updates.length}`);
    }
  }

  // Restore lead-style headlines for unverified companies overwritten earlier.
  await sql`
    UPDATE companies
    SET headline = 'Other / Unclassified · Sector Unverified',
        updated_at = NOW()
    WHERE headline = 'Industrial company · Industrial markets'
  `;

  const samples = await sql`
    SELECT name, headline, left(description, 220) AS description
    FROM companies
    WHERE name IN (
      '021 Design', '2g Foods', 'Fogg Filler Co', 'AUSPACK',
      'Ace Packwell', '1 Tec', 'AB Mauri'
    )
    ORDER BY name
  `;
  const lengths = await sql`
    SELECT
      round(avg(length(description)))::int AS avg_len,
      min(length(description))::int AS min_len,
      max(length(description))::int AS max_len,
      count(*) FILTER (WHERE description ILIKE 'Legacy CRM%')::int AS still_legacy,
      count(*) FILTER (WHERE description ILIKE '%Products and focus:%')::int AS with_product_focus
    FROM companies
  `;
  console.log("Done.", lengths[0]);
  console.log(samples);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
