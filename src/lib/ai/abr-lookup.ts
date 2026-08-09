/**
 * Tier-1 Australian Business Register (ABN Lookup) client.
 *
 * Prefer the official JSON API when `ABR_GUID` / `ABN_LOOKUP_GUID` is set.
 * Falls back to the public ABN Lookup HTML search/detail pages (no GUID required).
 * Never invents registry fields — returns null/empty when ABR has no match.
 */

const ABR_ORIGIN = "https://abr.business.gov.au";
const FETCH_TIMEOUT_MS = 12_000;
const USER_AGENT = "RateQuipCompanyDiscovery/1.0 (+https://ratequip.com)";

function decodeHtmlEntities(raw: string) {
  return raw
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export type AbrEntity = {
  abn: string;
  abnFormatted: string;
  acn?: string;
  entityName: string;
  entityType?: string;
  status: string;
  statusEffectiveFrom?: string;
  gstRegisteredFrom?: string;
  businessNames: string[];
  state?: string;
  postcode?: string;
  sourceUrl: string;
  retrievedAt: string;
  transport: "json" | "html";
};

export type AbrNameMatch = {
  abn: string;
  abnFormatted: string;
  entityName: string;
  status: string;
  nameType?: string;
  state?: string;
  postcode?: string;
  score?: number;
  sourceUrl: string;
};

function abrGuid(): string | undefined {
  const raw =
    process.env.ABR_GUID?.trim() ||
    process.env.ABN_LOOKUP_GUID?.trim() ||
    "";
  return raw || undefined;
}

export function formatAbn(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 11) return raw.trim();
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
}

export function extractAbnDigits(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length === 11 ? digits : null;
}

export function isAustraliaContext(input: {
  country?: string;
  websiteUrl?: string;
  query?: string;
  abnHint?: string;
}): boolean {
  if (extractAbnDigits(input.abnHint) || extractAbnDigits(input.query)) {
    return true;
  }
  const country = (input.country || "").toLowerCase();
  if (
    country.includes("australia") ||
    country === "au" ||
    country === "aus" ||
    country.includes("nsw") ||
    country.includes("vic") ||
    country.includes("qld")
  ) {
    return true;
  }
  const site = (input.websiteUrl || "").toLowerCase();
  if (/\.com\.au\b|\.net\.au\b|\.org\.au\b|\.asn\.au\b/.test(site)) return true;
  return false;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      Accept: "text/html,application/json,*/*",
      "User-Agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`ABR fetch failed (${res.status})`);
  }
  return res.text();
}

function unwrapJsonp(body: string): unknown {
  const trimmed = body.trim();
  const match = trimmed.match(/^([a-zA-Z_$][\w$]*)\(([\s\S]*)\)\s*;?\s*$/);
  if (match) {
    return JSON.parse(match[2] ?? "{}");
  }
  return JSON.parse(trimmed);
}

function parseCompressedNameItem(raw: string): AbrNameMatch | null {
  // Example:
  // 70604909711,70 604 909 711,0000000001,Active,active,INKJETPRINT PTY LTD,...,Entity Name,,2066 NSW,...,NSW,...,2066,...,99
  const parts = raw.split(",");
  if (parts.length < 6) return null;
  const abn = (parts[0] ?? "").replace(/\D/g, "");
  if (abn.length !== 11) return null;
  const entityName = (parts[5] ?? "").trim();
  if (!entityName) return null;
  const status = (parts[3] ?? parts[4] ?? "").trim() || "Unknown";
  const nameType = (parts[8] ?? "").trim() || undefined;
  const state = (parts[11] ?? "").trim() || undefined;
  const postcode = (parts[12] ?? "").trim() || undefined;
  const scoreRaw = (parts[parts.length - 1] ?? "").trim();
  const score = Number(scoreRaw);
  return {
    abn,
    abnFormatted: formatAbn(abn),
    entityName,
    status,
    nameType,
    state: state || undefined,
    postcode: postcode || undefined,
    score: Number.isFinite(score) ? score : undefined,
    sourceUrl: `${ABR_ORIGIN}/ABN/View?abn=${abn}`,
  };
}

function parseHtmlAbnDetails(html: string, abn: string): AbrEntity | null {
  const legalName = decodeHtmlEntities(
    html.match(/itemprop="legalName">([^<]+)/i)?.[1] ||
      html
        .match(/Entity name:<\/th>\s*<td[^>]*>\s*([\s\S]*?)<\/td>/i)?.[1]
        ?.replace(/<[^>]+>/g, " ") ||
      "",
  );
  if (!legalName) return null;

  const statusRaw = decodeHtmlEntities(
    html
      .match(/ABN status:<\/th>\s*<td[^>]*>\s*([\s\S]*?)<\/td>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ") || "Unknown",
  );
  const entityType = decodeHtmlEntities(
    html
      .match(/Entity type:<\/th>\s*<td[^>]*>\s*([\s\S]*?)<\/td>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ") || "",
  ) || undefined;
  const locality =
    html.match(/itemprop="addressLocality">([^<]+)/i)?.[1]?.trim() ||
    undefined;
  const state =
    locality?.match(/\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/i)?.[1]?.toUpperCase() ||
    undefined;
  const postcode = locality?.match(/\b(\d{4})\b/)?.[1] || undefined;
  const gst = decodeHtmlEntities(
    html
      .match(/GST\):<\/th>\s*<td[^>]*>\s*([\s\S]*?)<\/td>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ") || "",
  ) || undefined;

  const businessNames = Array.from(
    html.matchAll(/searchIdType=BUSN[^>]*>([^<]+)/gi),
  )
    .map((m) => m[1]?.trim())
    .filter((n): n is string => Boolean(n));

  const acnMatch =
    html.match(/ASIC number:<\/th>\s*<td[^>]*>\s*([\s\S]*?)<\/td>/i)?.[1] ||
    html.match(/\b(\d{3}\s*\d{3}\s*\d{3})\b[\s\S]{0,80}ASIC/i)?.[1] ||
    html.match(/searchText=(\d{9})/i)?.[1];
  const acnDigits = acnMatch?.replace(/\D/g, "");
  const statusEffectiveFrom = statusRaw.match(
    /(\d{1,2}\s+\w+\s+\d{4})/i,
  )?.[1];

  return {
    abn,
    abnFormatted: formatAbn(abn),
    acn:
      acnDigits && acnDigits.length === 9
        ? `${acnDigits.slice(0, 3)} ${acnDigits.slice(3, 6)} ${acnDigits.slice(6)}`
        : undefined,
    entityName: legalName,
    entityType,
    status: statusRaw,
    statusEffectiveFrom,
    gstRegisteredFrom: gst?.toLowerCase().includes("registered")
      ? gst
      : undefined,
    businessNames,
    state,
    postcode,
    sourceUrl: `${ABR_ORIGIN}/ABN/View?abn=${abn}`,
    retrievedAt: new Date().toISOString(),
    transport: "html",
  };
}

async function lookupAbnViaJson(abn: string): Promise<AbrEntity | null> {
  const guid = abrGuid();
  if (!guid) return null;
  const url = `${ABR_ORIGIN}/json/AbnDetails.aspx?abn=${encodeURIComponent(abn)}&callback=cb&guid=${encodeURIComponent(guid)}`;
  const body = await fetchText(url);
  const data = unwrapJsonp(body) as Record<string, unknown>;
  if (data.Message && !data.Abn && !data.EntityName) {
    console.warn("[abr-lookup] JSON ABN lookup message", data.Message);
    return null;
  }
  const entityName = String(data.EntityName || "").trim();
  const abnDigits = String(data.Abn || abn).replace(/\D/g, "");
  if (!entityName || abnDigits.length !== 11) return null;
  const businessNames = Array.isArray(data.BusinessName)
    ? data.BusinessName.map(String)
    : [];
  return {
    abn: abnDigits,
    abnFormatted: formatAbn(abnDigits),
    acn: data.Acn ? String(data.Acn) : undefined,
    entityName,
    entityType: data.EntityTypeName ? String(data.EntityTypeName) : undefined,
    status: String(data.AbnStatus || "Unknown"),
    statusEffectiveFrom: data.AbnStatusEffectiveFrom
      ? String(data.AbnStatusEffectiveFrom)
      : undefined,
    gstRegisteredFrom: data.Gst ? String(data.Gst) : undefined,
    businessNames,
    state: data.AddressState ? String(data.AddressState) : undefined,
    postcode: data.AddressPostcode ? String(data.AddressPostcode) : undefined,
    sourceUrl: `${ABR_ORIGIN}/ABN/View?abn=${abnDigits}`,
    retrievedAt: new Date().toISOString(),
    transport: "json",
  };
}

async function lookupAbnViaHtml(abn: string): Promise<AbrEntity | null> {
  const html = await fetchText(`${ABR_ORIGIN}/ABN/View?abn=${encodeURIComponent(abn)}`);
  return parseHtmlAbnDetails(html, abn);
}

export async function lookupAbrByAbn(
  abnRaw: string,
): Promise<AbrEntity | null> {
  const abn = extractAbnDigits(abnRaw);
  if (!abn) return null;
  try {
    const viaJson = await lookupAbnViaJson(abn);
    if (viaJson) return viaJson;
  } catch (error) {
    console.warn("[abr-lookup] JSON ABN detail failed", error);
  }
  try {
    return await lookupAbnViaHtml(abn);
  } catch (error) {
    console.warn("[abr-lookup] HTML ABN detail failed", error);
    return null;
  }
}

async function searchNameViaJson(name: string): Promise<AbrNameMatch[]> {
  const guid = abrGuid();
  if (!guid) return [];
  const url = `${ABR_ORIGIN}/json/MatchingNames.aspx?name=${encodeURIComponent(name)}&maxResults=5&callback=cb&guid=${encodeURIComponent(guid)}`;
  const body = await fetchText(url);
  const data = unwrapJsonp(body) as {
    Message?: string;
    Names?: Array<{
      Abn?: string;
      Name?: string;
      NameType?: string;
      Score?: number;
      IsActive?: boolean | string;
      State?: string;
      Postcode?: string;
    }>;
  };
  if (data.Message && !data.Names?.length) {
    console.warn("[abr-lookup] JSON name search message", data.Message);
    return [];
  }
  return (data.Names ?? [])
    .map((row) => {
      const abn = String(row.Abn || "").replace(/\D/g, "");
      const entityName = String(row.Name || "").trim();
      if (abn.length !== 11 || !entityName) return null;
      const active =
        row.IsActive === true ||
        String(row.IsActive || "").toLowerCase() === "y" ||
        String(row.IsActive || "").toLowerCase() === "true";
      return {
        abn,
        abnFormatted: formatAbn(abn),
        entityName,
        status: active ? "Active" : "Unknown",
        nameType: row.NameType ? String(row.NameType) : undefined,
        state: row.State ? String(row.State) : undefined,
        postcode: row.Postcode ? String(row.Postcode) : undefined,
        score: typeof row.Score === "number" ? row.Score : undefined,
        sourceUrl: `${ABR_ORIGIN}/ABN/View?abn=${abn}`,
      } satisfies AbrNameMatch;
    })
    .filter((m): m is AbrNameMatch => Boolean(m));
}

async function searchNameViaHtml(name: string): Promise<AbrNameMatch[]> {
  const url = `${ABR_ORIGIN}/Search/ResultsActive?SearchText=${encodeURIComponent(name)}`;
  const html = await fetchText(url);
  const compressed = Array.from(
    html.matchAll(
      /name="Results\.NameItems\[\d+\]\.Compressed"[^>]*value="([^"]+)"/gi,
    ),
  ).map((m) => m[1] ?? "");

  const fromCompressed = compressed
    .map(parseCompressedNameItem)
    .filter((m): m is AbrNameMatch => Boolean(m));
  if (fromCompressed.length > 0) return fromCompressed.slice(0, 5);

  // Fallback: parse result table links
  const fromLinks = Array.from(
    html.matchAll(
      /href="\/ABN\/View\?abn=(\d{11})"[\s\S]{0,220}?>([\s\S]*?)<\/a>/gi,
    ),
  )
    .map((m) => {
      const abn = m[1] ?? "";
      const label = (m[2] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (!abn) return null;
      return {
        abn,
        abnFormatted: formatAbn(abn),
        entityName: label || formatAbn(abn),
        status: "Active",
        sourceUrl: `${ABR_ORIGIN}/ABN/View?abn=${abn}`,
      } satisfies AbrNameMatch;
    })
    .filter((m): m is AbrNameMatch => Boolean(m));

  return fromLinks.slice(0, 5);
}

export async function searchAbrByName(
  name: string,
): Promise<AbrNameMatch[]> {
  const query = name.trim();
  if (query.length < 2) return [];
  try {
    const viaJson = await searchNameViaJson(query);
    if (viaJson.length > 0) return viaJson;
  } catch (error) {
    console.warn("[abr-lookup] JSON name search failed", error);
  }
  try {
    return await searchNameViaHtml(query);
  } catch (error) {
    console.warn("[abr-lookup] HTML name search failed", error);
    return [];
  }
}

/**
 * Resolve the best ABR entity for a company name / optional ABN hint.
 */
export async function resolveAbrEntity(input: {
  query: string;
  abnHint?: string;
}): Promise<{
  entity: AbrEntity | null;
  candidates: AbrNameMatch[];
  sourcesChecked: string[];
  sourcesWithNoMatch: string[];
}> {
  const sourcesChecked: string[] = [];
  const sourcesWithNoMatch: string[] = [];
  const hint = extractAbnDigits(input.abnHint) || extractAbnDigits(input.query);

  if (hint) {
    sourcesChecked.push("abn_lookup_by_abn");
    const entity = await lookupAbrByAbn(hint);
    if (entity) {
      return { entity, candidates: [], sourcesChecked, sourcesWithNoMatch };
    }
    sourcesWithNoMatch.push("abn_lookup_by_abn");
  }

  sourcesChecked.push("abn_lookup_by_name");
  const candidates = await searchAbrByName(input.query);
  if (candidates.length === 0) {
    sourcesWithNoMatch.push("abn_lookup_by_name");
    return { entity: null, candidates: [], sourcesChecked, sourcesWithNoMatch };
  }

  const best = candidates[0]!;
  sourcesChecked.push("abn_lookup_details");
  const entity = await lookupAbrByAbn(best.abn);
  if (!entity) {
    sourcesWithNoMatch.push("abn_lookup_details");
    // Synthesize a partial entity from the search hit so Tier-1 ABN still surfaces.
    return {
      entity: {
        abn: best.abn,
        abnFormatted: best.abnFormatted,
        entityName: best.entityName,
        status: best.status,
        businessNames: [],
        state: best.state,
        postcode: best.postcode,
        sourceUrl: best.sourceUrl,
        retrievedAt: new Date().toISOString(),
        transport: "html",
      },
      candidates,
      sourcesChecked,
      sourcesWithNoMatch,
    };
  }

  return { entity, candidates, sourcesChecked, sourcesWithNoMatch };
}
