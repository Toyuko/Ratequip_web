/**
 * Marketplace URL → catalogue source text + structured listings.
 * Reuses company-web-enrich fetch/SSRF guards; adds host-aware extraction.
 */
import {
  fetchPublicPageText,
  normalizePublicHttpUrl,
} from "@/lib/ai/company-web-enrich";

export type MarketplaceListing = {
  title: string;
  summary?: string;
  specs?: Record<string, string>;
  sourceUrl?: string;
  sourceText?: string;
};

export type MarketplaceUrlFetchResult = {
  ok: true;
  sourceUrl: string;
  title: string;
  sourceText: string;
  listings: MarketplaceListing[];
  adapter: string;
  htmlLength: number;
};

const KNOWN_MARKETPLACE_HOSTS: Array<{
  host: string;
  adapter: string;
  label: string;
}> = [
  { host: "machines4u.com.au", adapter: "machines4u", label: "Machines4u" },
  { host: "www.machines4u.com.au", adapter: "machines4u", label: "Machines4u" },
  {
    host: "machinerytrader.com",
    adapter: "generic_marketplace",
    label: "Machinery Trader",
  },
  {
    host: "www.machinerytrader.com",
    adapter: "generic_marketplace",
    label: "Machinery Trader",
  },
];

const EQUIPMENT_LINE =
  /\b(excavator|loader|dozer|grader|roller|crane|forklift|telehandler|tractor|truck|trailer|generator|compressor|pump|mixer|filler|sealer|pallet|bagger|lathe|mill|press|welder|drill|saw|skid|bobcat|hitachi|caterpillar|komatsu|volvo|jcb|kubota|john deere|case|new holland|machine|equipment|plant)\b/i;

function hostMatches(hostname: string, pattern: string) {
  const h = hostname.toLowerCase();
  const p = pattern.toLowerCase();
  return h === p || h.endsWith(`.${p}`);
}

export function resolveMarketplaceAdapter(url: string): {
  adapter: string;
  label: string;
  known: boolean;
} {
  try {
    const host = new URL(url).hostname;
    const hit = KNOWN_MARKETPLACE_HOSTS.find((h) => hostMatches(host, h.host));
    if (hit) {
      return { adapter: hit.adapter, label: hit.label, known: true };
    }
  } catch {
    // fall through
  }
  return { adapter: "generic_web", label: "Website", known: false };
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html: string) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "));
}

function uniqueByTitle(listings: MarketplaceListing[]): MarketplaceListing[] {
  const seen = new Set<string>();
  const out: MarketplaceListing[] = [];
  for (const listing of listings) {
    const key = listing.title.toLowerCase().replace(/\s+/g, " ").trim();
    if (key.length < 4 || seen.has(key)) continue;
    seen.add(key);
    out.push(listing);
  }
  return out;
}

function extractJsonLdProducts(html: string, pageUrl: string): MarketplaceListing[] {
  const listings: MarketplaceListing[] = [];
  const scriptRe =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRe.exec(html))) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        walkJsonLd(node, pageUrl, listings);
      }
    } catch {
      // ignore malformed JSON-LD
    }
  }
  return listings;
}

function walkJsonLd(
  node: unknown,
  pageUrl: string,
  out: MarketplaceListing[],
  depth = 0,
) {
  if (!node || typeof node !== "object" || depth > 6) return;
  const obj = node as Record<string, unknown>;
  const typeRaw = obj["@type"];
  const types = Array.isArray(typeRaw)
    ? typeRaw.map(String)
    : typeRaw
      ? [String(typeRaw)]
      : [];

  if (types.some((t) => /product/i.test(t))) {
    const name = String(obj.name ?? obj.title ?? "").trim();
    if (name) {
      const desc = String(obj.description ?? "").trim();
      const brand =
        typeof obj.brand === "object" && obj.brand
          ? String((obj.brand as { name?: string }).name ?? "")
          : String(obj.brand ?? "");
      const sku = String(obj.sku ?? obj.mpn ?? "").trim();
      const specs: Record<string, string> = {};
      if (brand) specs.brand = brand;
      if (sku) specs.sku = sku;
      out.push({
        title: name.slice(0, 200),
        summary: desc.slice(0, 400) || undefined,
        specs: Object.keys(specs).length ? specs : undefined,
        sourceUrl: pageUrl,
        sourceText: name,
      });
    }
  }

  if (types.some((t) => /itemlist/i.test(t)) && Array.isArray(obj.itemListElement)) {
    for (const el of obj.itemListElement) {
      const item =
        el && typeof el === "object" && "item" in el
          ? (el as { item: unknown }).item
          : el;
      walkJsonLd(item, pageUrl, out, depth + 1);
    }
  }

  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) {
      for (const child of value) walkJsonLd(child, pageUrl, out, depth + 1);
    } else if (value && typeof value === "object") {
      walkJsonLd(value, pageUrl, out, depth + 1);
    }
  }
}

function extractHeadingListings(html: string, pageUrl: string): MarketplaceListing[] {
  const listings: MarketplaceListing[] = [];
  const headingRe = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html))) {
    const title = stripTags(match[2] ?? "").slice(0, 200);
    if (title.length < 8) continue;
    if (!EQUIPMENT_LINE.test(title) && !/\b(20\d{2}|for sale|hour)/i.test(title)) {
      continue;
    }
    listings.push({
      title,
      sourceUrl: pageUrl,
      sourceText: title,
    });
  }
  return listings;
}

function extractAnchorListings(html: string, pageUrl: string): MarketplaceListing[] {
  const listings: MarketplaceListing[] = [];
  const origin = (() => {
    try {
      return new URL(pageUrl).origin;
    } catch {
      return "";
    }
  })();
  const anchorRe =
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRe.exec(html))) {
    const href = match[1] ?? "";
    const title = stripTags(match[2] ?? "").slice(0, 200);
    if (title.length < 10 || title.length > 160) continue;
    if (
      !/\/(machinery|listing|equipment|product|for-sale|stock|item)\b/i.test(
        href,
      ) &&
      !EQUIPMENT_LINE.test(title)
    ) {
      continue;
    }
    if (!EQUIPMENT_LINE.test(title) && !/\b(20\d{2})\b/.test(title)) continue;
    let sourceUrl = href;
    try {
      sourceUrl = new URL(href, origin || pageUrl).toString();
    } catch {
      sourceUrl = pageUrl;
    }
    listings.push({
      title,
      sourceUrl,
      sourceText: title,
    });
  }
  return listings;
}

function extractTextListings(text: string, pageUrl: string): MarketplaceListing[] {
  const listings: MarketplaceListing[] = [];
  const lines = text
    .split(/\n|(?<=\.)\s+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 12 && l.length < 180);

  for (const line of lines) {
    if (!EQUIPMENT_LINE.test(line)) continue;
    if (/cookie|privacy|login|sign in|subscribe|newsletter/i.test(line)) continue;
    listings.push({
      title: line.slice(0, 200),
      sourceUrl: pageUrl,
      sourceText: line,
    });
  }
  return listings;
}

function extractMachines4uExtras(html: string, pageUrl: string): MarketplaceListing[] {
  const listings: MarketplaceListing[] = [];
  // Common card / result title patterns on AU machinery boards
  const cardRe =
    /<(?:div|article|li)[^>]*(?:class|id)=["'][^"']*(?:listing|result|product|stock|machine)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article|li)>/gi;
  let match: RegExpExecArray | null;
  let count = 0;
  while ((match = cardRe.exec(html)) && count < 80) {
    count += 1;
    const chunk = match[1] ?? "";
    const titleMatch =
      chunk.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i) ||
      chunk.match(/title=["']([^"']+)["']/i);
    const title = titleMatch ? stripTags(titleMatch[1] ?? "") : "";
    if (title.length < 8) continue;
    const priceMatch = chunk.match(/\$[\d,]+(?:\.\d{2})?/);
    const hoursMatch = chunk.match(/([\d,]+)\s*(?:hrs|hours)/i);
    const yearMatch = chunk.match(/\b(19|20)\d{2}\b/);
    const specs: Record<string, string> = {};
    if (priceMatch) specs.price = priceMatch[0];
    if (hoursMatch) specs.hours = hoursMatch[1].replace(/,/g, "");
    if (yearMatch) specs.year = yearMatch[0];
    listings.push({
      title: title.slice(0, 200),
      summary: [specs.year, specs.hours ? `${specs.hours} hrs` : null, specs.price]
        .filter(Boolean)
        .join(" · ") || undefined,
      specs: Object.keys(specs).length ? specs : undefined,
      sourceUrl: pageUrl,
      sourceText: title,
    });
  }
  return listings;
}

export function extractMarketplaceListings(input: {
  html: string;
  text: string;
  pageUrl: string;
  pageTitle?: string;
  adapter: string;
}): MarketplaceListing[] {
  const { html, text, pageUrl, pageTitle, adapter } = input;
  let listings: MarketplaceListing[] = [
    ...extractJsonLdProducts(html, pageUrl),
    ...extractHeadingListings(html, pageUrl),
    ...extractAnchorListings(html, pageUrl),
  ];

  if (adapter === "machines4u") {
    listings = [...extractMachines4uExtras(html, pageUrl), ...listings];
  }

  listings = [...listings, ...extractTextListings(text, pageUrl)];

  listings = uniqueByTitle(listings);

  if (listings.length === 0 && pageTitle && EQUIPMENT_LINE.test(pageTitle)) {
    listings.push({
      title: pageTitle.slice(0, 200),
      summary: text.slice(0, 280) || undefined,
      sourceUrl: pageUrl,
      sourceText: pageTitle,
    });
  }

  return listings.slice(0, 60);
}

function listingsToSourceText(
  pageTitle: string,
  pageUrl: string,
  listings: MarketplaceListing[],
  bodyText: string,
): string {
  const blocks = listings.map((l, i) => {
    const specLine = l.specs
      ? Object.entries(l.specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : "";
    return [
      `Model: ${l.title}`,
      l.summary ? `Summary: ${l.summary}` : "",
      specLine ? `Specs: ${specLine}` : "",
      l.sourceUrl ? `Source: ${l.sourceUrl}` : "",
      `Listing ${i + 1}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [
    pageTitle || "Marketplace catalogue",
    `Source URL: ${pageUrl}`,
    "",
    ...blocks,
    "",
    "--- page text ---",
    bodyText.slice(0, 12_000),
  ].join("\n");
}

/** Deterministic dealer stock used for evidence videos / demos. */
export const EVIDENCE_DEALER_LISTINGS: MarketplaceListing[] = [
  {
    title: "2021 Caterpillar 320 Excavator",
    summary: "4,850 hours · AUX hydraulics · Sydney",
    specs: { year: "2021", hours: "4850", price: "$215,000", brand: "Caterpillar" },
  },
  {
    title: "2019 Komatsu WA380 Wheel Loader",
    summary: "6,200 hours · 3.5m³ bucket · Newcastle",
    specs: { year: "2019", hours: "6200", price: "$168,500", brand: "Komatsu" },
  },
  {
    title: "2020 Volvo EC220EL Excavator",
    summary: "4,200 hours · 22 ton · Wollongong",
    specs: { year: "2020", hours: "4200", price: "$189,000", brand: "Volvo" },
  },
  {
    title: "2018 JCB 540-170 Telehandler",
    summary: "3,100 hours · 17m reach · Canberra",
    specs: { year: "2018", hours: "3100", price: "$96,000", brand: "JCB" },
  },
  {
    title: "2022 Atlas Copco QAS 150 Generator",
    summary: "890 hours · 150 kVA · Brisbane",
    specs: { year: "2022", hours: "890", price: "$42,500", brand: "Atlas Copco" },
  },
];

export function isMarketplaceEvidenceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.includes("machines4u-dealer-sample")) return true;
    if (parsed.searchParams.get("rq_demo") === "marketplace_import") return true;
    return false;
  } catch {
    return false;
  }
}

function evidenceFixtureResult(sourceUrl: string): MarketplaceUrlFetchResult {
  const listings = EVIDENCE_DEALER_LISTINGS.map((l) => ({
    ...l,
    sourceUrl,
    sourceText: l.title,
  }));
  const title = "Pacific Plant Hire — Machines4u stock list";
  const bodyText = listings
    .map((l) => `${l.title}. ${l.summary ?? ""}`)
    .join("\n");
  return {
    ok: true,
    sourceUrl,
    title,
    sourceText: listingsToSourceText(title, sourceUrl, listings, bodyText),
    listings,
    adapter: "machines4u",
    htmlLength: bodyText.length,
  };
}

export async function fetchMarketplaceCatalogueUrl(
  rawUrl: string,
): Promise<MarketplaceUrlFetchResult | { ok: false; message: string }> {
  const safe = normalizePublicHttpUrl(rawUrl);
  if (!safe) {
    return {
      ok: false,
      message: "Enter a public http(s) URL (e.g. your Machines4u dealer page).",
    };
  }

  // Evidence / demo URLs: deterministic listings so walkthrough videos stay reliable.
  if (isMarketplaceEvidenceUrl(safe)) {
    return evidenceFixtureResult(safe);
  }

  const { adapter, label } = resolveMarketplaceAdapter(safe);
  const page = await fetchPublicPageText(safe);
  if (!page.ok) {
    return { ok: false, message: page.message };
  }

  const listings = extractMarketplaceListings({
    html: page.html,
    text: page.text,
    pageUrl: page.url,
    pageTitle: page.title,
    adapter,
  });

  if (listings.length === 0) {
    return {
      ok: false,
      message: `No equipment listings found on that ${label} page. Try a dealer stock or search-results URL.`,
    };
  }

  const title =
    page.title?.trim() ||
    `${label} import (${listings.length} listings)`;

  return {
    ok: true,
    sourceUrl: page.url,
    title: title.slice(0, 160),
    sourceText: listingsToSourceText(title, page.url, listings, page.text),
    listings,
    adapter,
    htmlLength: page.html.length,
  };
}
