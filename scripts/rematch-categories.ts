/**
 * Rebuild company ↔ category links from imported lead fields.
 *
 * Uses headline "Company Type · Industry Sector", description, and company name
 * to assign parent + leaf taxonomy categories.
 *
 *   npx tsx scripts/rematch-categories.ts
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

type Col = { name: string; cast?: string };

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function bulkInsert(
  sql: ReturnType<typeof neon>,
  table: string,
  columns: Col[],
  rows: Record<string, unknown>[],
) {
  if (!rows.length) return;
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
  const query = `INSERT INTO ${table} (${columns.map((c) => c.name).join(", ")}) VALUES ${placeholders}`;
  await sql.query(query, values);
}

/** Keyword rules → category slugs (parents and/or leaves). */
const KEYWORD_RULES: { re: RegExp; slugs: string[] }[] = [
  // Packaging equipment
  {
    re: /\b(bottle\s*fill|filling\s*line|filler|fogg\s*filler)\b/i,
    slugs: ["packaging-machinery", "bottle-fillers"],
  },
  {
    re: /\b(pouch\s*fill|sachet)\b/i,
    slugs: ["packaging-machinery", "pouch-fillers"],
  },
  {
    re: /\b(capper|capping|closure)\b/i,
    slugs: ["packaging-machinery", "cappers"],
  },
  {
    re: /\b(labell?er|labelling|labeling|label\s*print)\b/i,
    slugs: ["packaging-machinery", "labellers"],
  },
  {
    re: /\b(carton(ing)?|case\s*pack|end[- ]of[- ]line)\b/i,
    slugs: ["packaging-machinery", "cartoning-machines", "case-packers"],
  },
  {
    re: /\b(palletis|palletiz|palletiser|palletizer)\b/i,
    slugs: ["packaging-machinery", "palletisers"],
  },
  {
    re: /\b(shrink\s*wrap|flow\s*wrap|flowwrap)\b/i,
    slugs: ["packaging-machinery", "shrink-wrappers", "flow-wrappers"],
  },
  {
    re: /\b(form[- ]?fill|vffs|hffs|bagging)\b/i,
    slugs: ["packaging-machinery", "vertical-form-fill-seal", "bagging-machines"],
  },
  {
    re: /\b(checkweigh|metal\s*detect|tray\s*seal|vacuum\s*pack)\b/i,
    slugs: ["packaging-machinery", "checkweighers", "metal-detectors"],
  },
  {
    re: /\b(inkjet|cij|coding|marking|date\s*code)\b/i,
    slugs: ["packaging-machinery", "coding-and-marking", "inkjet-printers"],
  },
  {
    re: /\b(conveyor|conveying)\b/i,
    slugs: ["packaging-machinery", "conveyors"],
  },
  {
    re: /\b(packag(e|ing)|co[- ]?pack|packwell|auspack|autopack)\b/i,
    slugs: ["packaging-machinery"],
  },

  // Processing
  {
    re: /\b(mixer|mixing|high[- ]shear)\b/i,
    slugs: ["food-processing", "mixers", "high-shear-mixers"],
  },
  {
    re: /\b(blender|blending|emulsif|homogen)\b/i,
    slugs: ["food-processing", "blenders", "emulsifiers", "homogenisers"],
  },
  {
    re: /\b(mill|grind|grinding)\b/i,
    slugs: ["food-processing", "mills", "grinders"],
  },
  {
    re: /\b(cip\b|clean[- ]in[- ]place)\b/i,
    slugs: ["food-processing", "cip-systems"],
  },
  {
    re: /\b(pasteuris|heat\s*exchang|kettle|reactor|tank)\b/i,
    slugs: ["food-processing", "pasteurisers", "heat-exchangers", "tanks"],
  },
  {
    re: /\b(pump|hygienic\s*pump)\b/i,
    slugs: ["food-processing", "pumps"],
  },
  {
    re: /\b(dryer|evaporat|ferment|cooking\s*system|process(ing)?\s*line)\b/i,
    slugs: ["food-processing", "dryers", "evaporators", "food-processing-lines"],
  },
  {
    re: /\b(food|beverage|dairy|brew|bakery|meat|seafood|pet\s*food|superfood|wholefood)\b/i,
    slugs: ["food-processing"],
  },
  {
    re: /\b(agricultur|farming|primary\s*produc|horticult)\b/i,
    slugs: ["food-processing"],
  },

  // Industrial
  {
    re: /\b(compressor|boiler|chiller|generator|forklift|crane)\b/i,
    slugs: ["industrial-equipment", "compressors", "boilers", "chillers"],
  },
  {
    re: /\b(dust\s*collect|air\s*handling|hvac|water\s*treat|waste\s*treat|recycl)\b/i,
    slugs: ["industrial-equipment", "dust-collectors", "air-handling", "waste-treatment"],
  },
  {
    re: /\b(chemical|mining|metal|steel|construct|timber|forest|industrial)\b/i,
    slugs: ["industrial-equipment"],
  },

  // Automation
  {
    re: /\b(robot|robotic|cobot)\b/i,
    slugs: ["factory-automation", "robotics"],
  },
  {
    re: /\b(\bplc\b|hmi|scada|servo|vsd|control\s*panel|machine\s*safety|vision\s*system|sensor)\b/i,
    slugs: ["factory-automation", "plc", "control-panels"],
  },
  {
    re: /\b(automat(ion|ed)|factory\s*automat)\b/i,
    slugs: ["factory-automation"],
  },

  // Services
  {
    re: /\b(commission|installat|maintenance|fabricat|weld|electrical|mechanical|refrigerat|plumb)\b/i,
    slugs: ["service-categories", "commissioning", "installation", "maintenance"],
  },
  {
    re: /\b(consult|engineer(ing)?\s*service|service\s*provider)\b/i,
    slugs: ["service-categories", "professional-services"],
  },

  // Inspection / QC / regulated
  {
    re: /\b(inspect|quality\s*assur|\bqc\b|fat\b|pharma|pharmaceutical|cosmetic|healthcare|clinic)\b/i,
    slugs: ["inspection-qc"],
  },

  // Logistics
  {
    re: /\b(freight|logistic|warehous|cargo|shipping|transport|haulage)\b/i,
    slugs: ["heavy-logistics"],
  },

  // General business leaves
  {
    re: /\b(hotel|restaurant|commercial\s*kitchen|builder|trade|security|cleaning)\b/i,
    slugs: ["general-business"],
  },
  {
    re: /\b(professional\s*service|retail|wholesale|distribut|education|government|financ)\b/i,
    slugs: ["general-business", "professional-services"],
  },
];

function sectorToSlugs(sector: string): string[] {
  const s = sector.trim().toLowerCase();
  if (!s || s === "sector unverified") return [];
  if (s.includes("food processing machinery") || s.includes("food processing & packaging"))
    return ["food-processing", "packaging-machinery"];
  if (s.includes("packaging machinery") || s.includes("packaging & labell"))
    return ["packaging-machinery", "factory-automation"];
  if (s.includes("food") || s.includes("beverage") || s.includes("agriculture"))
    return ["food-processing"];
  if (s.includes("pharma") || s.includes("health") || s.includes("cosmetic"))
    return ["inspection-qc", "food-processing"];
  if (s.includes("logistics") || s.includes("warehous"))
    return ["heavy-logistics"];
  if (s.includes("chemical") || s.includes("cleaning"))
    return ["industrial-equipment", "cleaning"];
  if (
    s.includes("industrial") ||
    s.includes("mining") ||
    s.includes("construction") ||
    s.includes("waste") ||
    s.includes("forest")
  )
    return ["industrial-equipment"];
  if (s.includes("professional") || s.includes("education") || s.includes("government") || s.includes("financial"))
    return ["general-business", "professional-services"];
  if (s.includes("retail") || s.includes("wholesale") || s.includes("distribution"))
    return ["general-business"];
  if (s.includes("packaging")) return ["packaging-machinery"];
  return ["general-business"];
}

function typeToSlugs(companyType: string, hasSector: boolean): string[] {
  const t = companyType.trim().toLowerCase();
  if (t.includes("freight") || t.includes("logistics")) return ["heavy-logistics"];
  if (t.includes("consultant") || t.includes("service provider"))
    return ["service-categories", "professional-services"];
  if (t.includes("distributor") || t.includes("wholesaler"))
    return ["general-business"];
  if (t.includes("institution") || t.includes("government") || t.includes("finance"))
    return ["general-business"];
  if (t.includes("manufacturer / industrial")) return ["industrial-equipment"];
  // Buyer/supplier defaults only when sector is unverified — sector wins otherwise.
  if (!hasSector && t.includes("supplier / manufacturer"))
    return ["packaging-machinery", "industrial-equipment"];
  if (!hasSector && t.includes("buyer / manufacturer"))
    return ["food-processing"];
  return [];
}

function keywordSlugs(text: string): string[] {
  const found = new Set<string>();
  for (const rule of KEYWORD_RULES) {
    if (rule.re.test(text)) {
      for (const slug of rule.slugs) found.add(slug);
    }
  }
  return [...found];
}

function resolveCategories(input: {
  name: string;
  headline: string;
  description: string;
}): string[] {
  const [typePart = "", sectorPart = ""] = input.headline
    .split("·")
    .map((s) => s.trim());
  const text = [input.name, input.headline, input.description].join(" ");
  const sectorSlugs = sectorToSlugs(sectorPart);
  const hasSector = sectorSlugs.length > 0;

  const slugs = new Set<string>();
  for (const s of sectorSlugs) slugs.add(s);
  for (const s of typeToSlugs(typePart, hasSector)) slugs.add(s);
  for (const s of keywordSlugs(text)) slugs.add(s);

  // Drop vague general-business when a stronger equipment/service parent exists.
  const strong = [
    "food-processing",
    "packaging-machinery",
    "industrial-equipment",
    "factory-automation",
    "heavy-logistics",
    "inspection-qc",
    "service-categories",
  ];
  if (strong.some((s) => slugs.has(s))) {
    slugs.delete("general-business");
  }

  if (slugs.size === 0) slugs.add("general-business");

  // Cap to avoid over-tagging: keep all parents + up to 4 leaf matches
  const parents = new Set([
    "packaging-machinery",
    "food-processing",
    "industrial-equipment",
    "factory-automation",
    "service-categories",
    "general-business",
    "inspection-qc",
    "heavy-logistics",
    "industrial-hvac",
  ]);
  const parentSlugs = [...slugs].filter((s) => parents.has(s));
  const leafSlugs = [...slugs].filter((s) => !parents.has(s)).slice(0, 4);
  const result = [...new Set([...parentSlugs, ...leafSlugs])];
  return result.length ? result : ["general-business"];
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
  const sql = neon(process.env.DATABASE_URL);

  const catRows = await sql`SELECT id::text AS id, slug FROM categories`;
  const categoryIdBySlug = new Map(
    catRows.map((r) => [String(r.slug), String(r.id)]),
  );
  console.log(`Loaded ${categoryIdBySlug.size} categories`);

  const companies = await sql`
    SELECT id::text AS id, name, coalesce(headline, '') AS headline,
           coalesce(description, '') AS description
    FROM companies
  `;
  console.log(`Matching ${companies.length} companies…`);

  const links: { company_id: string; category_id: string }[] = [];
  const unmatchedSlugs = new Map<string, number>();
  let withLeaf = 0;

  for (const co of companies) {
    const slugs = resolveCategories({
      name: String(co.name),
      headline: String(co.headline),
      description: String(co.description),
    });
    let addedLeaf = false;
    for (const slug of slugs) {
      const categoryId = categoryIdBySlug.get(slug);
      if (!categoryId) {
        unmatchedSlugs.set(slug, (unmatchedSlugs.get(slug) ?? 0) + 1);
        continue;
      }
      links.push({ company_id: String(co.id), category_id: categoryId });
      if (
        ![
          "packaging-machinery",
          "food-processing",
          "industrial-equipment",
          "factory-automation",
          "service-categories",
          "general-business",
          "inspection-qc",
          "heavy-logistics",
          "industrial-hvac",
        ].includes(slug)
      ) {
        addedLeaf = true;
      }
    }
    if (addedLeaf) withLeaf++;
  }

  console.log(`Prepared ${links.length} links (${withLeaf} companies with leaf tags)`);
  if (unmatchedSlugs.size) {
    console.log("Unknown slugs skipped:", [...unmatchedSlugs.entries()]);
  }

  console.log("Replacing company_categories…");
  await sql`DELETE FROM company_categories`;

  for (const [i, batch] of chunk(links, 250).entries()) {
    await bulkInsert(
      sql,
      "company_categories",
      [
        { name: "company_id", cast: "uuid" },
        { name: "category_id", cast: "uuid" },
      ],
      batch,
    );
    if ((i + 1) % 10 === 0 || i === Math.ceil(links.length / 250) - 1) {
      console.log(`  inserted ${Math.min((i + 1) * 250, links.length)} / ${links.length}`);
    }
  }

  const summary = await sql`
    SELECT
      (SELECT count(DISTINCT company_id)::int FROM company_categories) AS companies_with_categories,
      (SELECT count(*)::int FROM companies) AS total_companies,
      (SELECT count(*)::int FROM company_categories) AS link_rows
  `;
  const top = await sql`
    SELECT c.slug, c.name, count(*)::int AS n
    FROM company_categories cc
    JOIN categories c ON c.id = cc.category_id
    GROUP BY c.slug, c.name
    ORDER BY n DESC
    LIMIT 25
  `;
  const samples = await sql`
    SELECT co.name, co.headline,
      array_agg(c.slug ORDER BY c.slug) AS categories
    FROM companies co
    JOIN company_categories cc ON cc.company_id = co.id
    JOIN categories c ON c.id = cc.category_id
    WHERE co.name IN ('021 Design', '1 Tec', '2g Foods', 'Ace Packwell', 'Fogg Filler Co', 'AUSPACK')
    GROUP BY co.name, co.headline
    ORDER BY co.name
  `;

  console.log("Done.", summary[0]);
  console.log("Top categories:", top);
  console.log("Samples:", samples);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
