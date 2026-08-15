/**
 * Coverage-oriented query expansion (P4-lite + P1 search seeds).
 * Prefer deterministic expansions so we do not burn AI quota on every search.
 */

export type CoverageQuerySet = {
  primary: string[];
  roster: string[];
  regional: string[];
  all: string[];
};

/** Local maker / directory terms by region/country hint. */
const REGION_TERMS: Array<{
  match: RegExp;
  categoryHints: string[];
  makerTerms: string[];
  legalSuffixes: string[];
  directories: string[];
}> = [
  {
    match: /germany|deutschland|dach|austria|österreich|switzerland|schweiz/i,
    categoryHints: ["Verpackungsmaschinen", "Abfüllanlagen", "Maschinenbau"],
    makerTerms: ["Hersteller", "Maschinenbauer", "Anbieter", "Lieferant"],
    legalSuffixes: ["GmbH", "AG", "KG"],
    directories: ["VDMA Mitglieder", "Interpack Aussteller"],
  },
  {
    match: /italy|italia|italian/i,
    categoryHints: ["macchine imballaggio", "macchine confezionatrici"],
    makerTerms: ["produttore", "costruttore", "fornitore"],
    legalSuffixes: ["S.p.A.", "S.r.l."],
    directories: ["UCIMA", "IPACK-IMA espositori"],
  },
  {
    match: /türkiye|turkey|turkish/i,
    categoryHints: ["ambalaj makineleri", "dolum makinesi"],
    makerTerms: ["üretici", "imalatçı", "tedarikçi"],
    legalSuffixes: ["A.Ş.", "Ltd. Şti."],
    directories: ["TÜYAP fuar", "İstanbul Sanayi Odası"],
  },
  {
    match: /france|french|français/i,
    categoryHints: ["machines d'emballage", "conditionnement"],
    makerTerms: ["fabricant", "constructeur", "fournisseur"],
    legalSuffixes: ["SAS", "SARL", "SA"],
    directories: ["Emballage salon exposants"],
  },
  {
    match: /japan|日本|japanese/i,
    categoryHints: ["包装機械", "充填機"],
    makerTerms: ["メーカー", "製造", "供給"],
    legalSuffixes: ["株式会社", "有限会社"],
    directories: ["JPMMA", "FOOMA"],
  },
  {
    match: /taiwan|台灣|台湾/i,
    categoryHints: ["包裝機械", "充填機"],
    makerTerms: ["製造商", "供應商", "廠商"],
    legalSuffixes: ["股份有限公司", "有限公司"],
    directories: ["Taiwan Packaging Machinery"],
  },
  {
    match: /china|中国|中國/i,
    categoryHints: ["包装机械", "灌装机"],
    makerTerms: ["制造商", "供应商", "厂家"],
    legalSuffixes: ["有限公司", "股份有限公司"],
    directories: ["Chinaplas exhibitors", "包装机械协会"],
  },
  {
    match: /australia|australian/i,
    categoryHints: ["packaging machinery", "processing equipment"],
    makerTerms: ["manufacturer", "supplier", "distributor"],
    legalSuffixes: ["Pty Ltd", "Ltd"],
    directories: ["AUSPACK exhibitors", "AMIA"],
  },
];

function uniqueQueries(values: string[], limit = 10) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const v = value.replace(/\s+/g, " ").trim();
    if (v.length < 3) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
    if (out.length >= limit) break;
  }
  return out;
}

function looksLikeCompanyName(query: string) {
  const q = query.trim();
  if (q.length < 3) return false;
  // URL-ish or very short brand tokens still count as company-ish.
  if (/^https?:\/\//i.test(q) || /\.[a-z]{2,}$/i.test(q)) return true;
  // Category / equipment phrases tend to be longer and plural/generic.
  if (
    /\b(machine|machinery|equipment|supplier|suppliers|manufacturer|manufacturers|directory|exhibitor|exhibitors|filling|packaging|processing)\b/i.test(
      q,
    )
  ) {
    return false;
  }
  // Compact proper-noun style (1–4 tokens, no category words).
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.length <= 4;
}

/**
 * Build coverage search queries from a user search + optional country.
 * Company-name lookups stay lean; category/region searches expand into roster probes.
 */
export function buildCoverageQueries(input: {
  query: string;
  country?: string;
}): CoverageQuerySet {
  const query = input.query.trim();
  const country = input.country?.trim() || "";
  const primary = uniqueQueries(
    [query, country ? `${query} ${country}` : "", `${query} official website`],
    4,
  );

  const rosterSeeds = [
    `${query} exhibitor list`,
    `${query} exhibitors directory`,
    `${query} brands we represent`,
    `${query} distributors partners`,
    `${query} member directory association`,
    `${query} suppliers buyers guide`,
    `${query} used machinery brands`,
  ];

  if (country) {
    rosterSeeds.push(
      `${query} ${country} manufacturers directory`,
      `${query} ${country} trade association members`,
    );
  }

  const regional: string[] = [];
  const regionBlob = `${query} ${country}`;
  for (const region of REGION_TERMS) {
    if (!region.match.test(regionBlob)) continue;
    for (const cat of region.categoryHints.slice(0, 2)) {
      for (const maker of region.makerTerms.slice(0, 2)) {
        regional.push(`${cat} ${maker}`);
      }
      for (const suffix of region.legalSuffixes.slice(0, 2)) {
        regional.push(`${cat} ${suffix}`);
      }
    }
    for (const dir of region.directories.slice(0, 2)) {
      regional.push(dir);
      if (query && !looksLikeCompanyName(query)) {
        regional.push(`${query} ${dir}`);
      }
    }
  }

  // Company-name searches: keep roster probes light (related lists only).
  const roster = uniqueQueries(
    looksLikeCompanyName(query)
      ? [
          `${query} distributors`,
          `${query} where to buy`,
          `${query} authorised dealer`,
          country ? `${query} ${country} distributor` : "",
        ]
      : rosterSeeds,
    looksLikeCompanyName(query) ? 4 : 7,
  );

  const regionalLimited = uniqueQueries(
    looksLikeCompanyName(query) ? [] : regional,
    5,
  );

  return {
    primary,
    roster,
    regional: regionalLimited,
    all: uniqueQueries([...primary, ...roster, ...regionalLimited], 12),
  };
}

/** Heuristic: does this page look like a multi-company roster? */
export function looksLikeRosterHit(hit: {
  title: string;
  url: string;
  snippet: string;
}) {
  const blob = `${hit.title} ${hit.snippet} ${hit.url}`.toLowerCase();
  return (
    /\b(exhibitor|exhibitors|member.?directory|members list|buyers.?guide|brands we (represent|service|support)|our partners|authorised dealers?|distributor network|supplier.?index|brand.?index|aussteller|espositori|Mitglieder)\b/i.test(
      blob,
    ) || /\/(exhibitors?|members?|directory|partners|brands)(\/|$|\?)/i.test(hit.url)
  );
}
