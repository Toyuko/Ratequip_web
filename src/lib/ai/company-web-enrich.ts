import { z } from "zod";
import { generateObject } from "ai";
import { RFQ_AI_MAX_RETRIES, RFQ_AI_MODEL } from "@/lib/ai/model";
import {
  formatAbn,
  isAustraliaContext,
  resolveAbrEntity,
  type AbrEntity,
} from "@/lib/ai/abr-lookup";
import { COMPANY_TYPES, type CompanyType } from "@/lib/organic-growth/types";
import { registrableDomainFromUrl } from "@/lib/organic-growth/privacy";
import { isPublicWebsiteUrl } from "@/lib/utils";

const PRIVATE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
]);

const BLOCKED_HOST_SUFFIXES = [
  ".local",
  ".internal",
  ".localhost",
  ".lan",
];

export const companyEnrichmentSchema = z.object({
  companyName: z.string().min(1).max(160),
  legalName: z.string().optional(),
  websiteUrl: z.string().optional(),
  phoneDisplay: z.string().optional(),
  phones: z.array(z.string()).default([]),
  emails: z.array(z.string()).default([]),
  faxDisplay: z.string().optional(),
  countryCode: z.string().optional(),
  locality: z.string().optional(),
  region: z.string().optional(),
  addressLine: z.string().optional(),
  postalCode: z.string().optional(),
  addresses: z
    .array(
      z.object({
        line: z.string().optional(),
        locality: z.string().optional(),
        region: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
      }),
    )
    .default([]),
  abnOrRegistry: z.string().optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
  companyTypes: z.array(z.enum(COMPANY_TYPES)).default([]),
  categoryHints: z.array(z.string()).default([]),
  publicProfiles: z
    .array(
      z.object({
        kind: z.string(),
        label: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
  confidence: z.number().min(0).max(1).default(0.5),
});

export type CompanyEnrichment = z.infer<typeof companyEnrichmentSchema> & {
  publicSourceUrl?: string;
  source:
    | "web_scrape"
    | "web_search"
    | "heuristic"
    | "directory_seed"
    | "registry";
  usedAi: boolean;
  fetchedUrl?: string;
  matchReasons: string[];
  /** Tier-1 registry provenance (ABN Lookup / etc.). */
  registryMeta?: {
    provider: "abn_lookup";
    status?: string;
    acn?: string;
    entityType?: string;
    businessNames?: string[];
    sourceUrl?: string;
    retrievedAt?: string;
    transport?: "json" | "html";
  };
};

export type WebCompanyDiscovery = {
  query: string;
  enrichments: CompanyEnrichment[];
  searchHits: Array<{ title: string; url: string; snippet: string }>;
  usedWebSearch: boolean;
  message: string;
};

function isBlockedHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (PRIVATE_HOSTS.has(host)) return true;
  if (BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) return true;
  if (/^(10\.|192\.168\.|169\.254\.)/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (/^(::ffff:)?127\./.test(host)) return true;
  return false;
}

export function normalizePublicHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isBlockedHostname(url.hostname)) return null;
    if (!isPublicWebsiteUrl(url.toString())) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function looksLikeUrlQuery(q: string) {
  return /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/|\s|$)/i.test(q.trim());
}

function stripHtmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html: string, key: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
}

export async function fetchPublicPageText(url: string): Promise<{
  ok: true;
  url: string;
  title?: string;
  description?: string;
  text: string;
  html: string;
} | { ok: false; message: string }> {
  const safe = normalizePublicHttpUrl(url);
  if (!safe) {
    return { ok: false, message: "That URL is not a public http(s) website." };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(safe, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "RateQuipCompanyEnrich/1.0 (+https://ratequip.com; business listing assist)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { ok: false, message: `Website returned HTTP ${res.status}.` };
    }

    const finalUrl = normalizePublicHttpUrl(res.url) ?? safe;
    const contentType = res.headers.get("content-type") ?? "";
    if (
      contentType &&
      !/text\/html|application\/xhtml|text\/plain/i.test(contentType)
    ) {
      return { ok: false, message: "URL did not return HTML content." };
    }

    const buf = await res.arrayBuffer();
    const capped = buf.byteLength > 900_000 ? buf.slice(0, 900_000) : buf;
    const html = new TextDecoder("utf-8", { fatal: false }).decode(capped);
    const title =
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ||
      extractMeta(html, "og:title");
    const description =
      extractMeta(html, "og:description") || extractMeta(html, "description");
    const text = stripHtmlToText(html).slice(0, 16_000);

    return {
      ok: true,
      url: finalUrl,
      title,
      description,
      text,
      html,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch website";
    return { ok: false, message };
  }
}

const JUNK_EMAIL_LOCAL = /^(noreply|no-reply|donotreply|privacy|legal|spam|example)$/i;

function normalizePhoneCandidate(raw: string) {
  const cleaned = raw
    .replace(/^tel:/i, "")
    .replace(/[^\d+()\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Reject year ranges / FY labels / page ranges (e.g. 2164 253-257).
  if (/^(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}$/.test(cleaned)) return null;
  if (
    /\d{3}\s*[-–]\s*\d{3}$/.test(cleaned) &&
    !cleaned.startsWith("+") &&
    !cleaned.startsWith("0") &&
    !cleaned.startsWith("(")
  ) {
    return null;
  }

  let digits = cleaned.replace(/\D/g, "");
  if (digits.startsWith("61") && digits.length >= 11) {
    digits = `0${digits.slice(2)}`;
  }
  if (digits.length < 8 || digits.length > 15) return null;
  if (/^(19|20)\d{2}$/.test(digits) || /^\d{4}$/.test(digits)) return null;
  // Australian ABNs are 11 digits and should not be treated as phones.
  if (
    /^\d{11}$/.test(digits) &&
    !cleaned.startsWith("+") &&
    !cleaned.startsWith("0") &&
    !cleaned.startsWith("(")
  ) {
    return null;
  }
  // Reject bare long digit strings without phone separators unless +/0/( prefix.
  if (/^\d{10,}$/.test(cleaned) && !cleaned.startsWith("0")) return null;

  // Normalize common AU landline fragments like "2 6491 7777" → "(02) 6491 7777"
  const auLandline = cleaned.match(
    /^\(?0?([2-8])\)?[\s.-]*(\d{4})[\s.-]*(\d{4})$/,
  );
  if (auLandline) {
    digits = `0${auLandline[1]}${auLandline[2]}${auLandline[3]}`;
  }

  const isAuNational =
    /^0[2-8]\d{8}$/.test(digits) || /^04\d{8}$/.test(digits);
  const isIntl =
    cleaned.startsWith("+") && digits.length >= 10 && digits.length <= 15;

  if (!isAuNational && !isIntl) return null;
  if (isAuNational) {
    if (digits.startsWith("04")) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return cleaned.slice(0, 40);
}

function normalizeAbn(raw?: string) {
  if (!raw) return undefined;
  return formatAbn(raw);
}

function mergeAbrIntoEnrichment(
  enrichment: CompanyEnrichment,
  entity: AbrEntity,
): CompanyEnrichment {
  const profiles = [
    {
      kind: "abn",
      label: "ASIC / ABN registry record",
      value: entity.sourceUrl,
    },
    ...(enrichment.publicProfiles ?? []),
  ].filter(
    (p, index, arr) =>
      arr.findIndex((x) => x.value.toLowerCase() === p.value.toLowerCase()) ===
      index,
  );

  const confidence = Math.max(enrichment.confidence ?? 0.5, 0.9);
  const reasons = uniqueStrings(
    [
      `ABN Lookup Tier-1 (${entity.transport})`,
      `ABN ${entity.abnFormatted} · ${entity.status}`,
      entity.acn ? `ACN ${entity.acn}` : undefined,
      entity.businessNames.length
        ? `Business names: ${entity.businessNames.slice(0, 3).join(", ")}`
        : undefined,
      ...enrichment.matchReasons,
    ],
    10,
  );

  // Keep the enriched/trading display name when present; legal name always from ABR.
  const displayName =
    enrichment.companyName?.trim() &&
    !/^\d+$/.test(enrichment.companyName.trim())
      ? enrichment.companyName
      : entity.entityName;

  return {
    ...enrichment,
    companyName: displayName,
    legalName: entity.entityName,
    abnOrRegistry: entity.abnFormatted,
    countryCode: enrichment.countryCode || "Australia",
    region: enrichment.region || entity.state,
    postalCode: enrichment.postalCode || entity.postcode,
    publicProfiles: profiles,
    confidence,
    source: enrichment.source === "heuristic" ? "registry" : enrichment.source,
    registryMeta: {
      provider: "abn_lookup",
      status: entity.status,
      acn: entity.acn,
      entityType: entity.entityType,
      businessNames: entity.businessNames,
      sourceUrl: entity.sourceUrl,
      retrievedAt: entity.retrievedAt,
      transport: entity.transport,
    },
    matchReasons: reasons,
  };
}

async function applyAustralianRegistry(
  enrichment: CompanyEnrichment,
  input: { query: string; country?: string; websiteUrl?: string },
): Promise<CompanyEnrichment> {
  if (
    !isAustraliaContext({
      country: input.country || enrichment.countryCode,
      websiteUrl: input.websiteUrl || enrichment.websiteUrl,
      query: input.query,
      abnHint: enrichment.abnOrRegistry,
    })
  ) {
    return enrichment;
  }

  const resolved = await resolveAbrEntity({
    query: enrichment.legalName || enrichment.companyName || input.query,
    abnHint: enrichment.abnOrRegistry,
  });

  if (!resolved.entity) {
    return {
      ...enrichment,
      matchReasons: uniqueStrings(
        [
          ...enrichment.matchReasons,
          "ABN Lookup checked — no Tier-1 registry match",
        ],
        10,
      ),
    };
  }

  return mergeAbrIntoEnrichment(enrichment, resolved.entity);
}

function pickPrimaryPhone(phones: string[]) {
  const ranked = [...phones].sort((a, b) => {
    const score = (p: string) => {
      let s = 0;
      if (p.includes("+61") || p.startsWith("0")) s += 3;
      if (/[()\s-]/.test(p)) s += 2;
      if (p.replace(/\D/g, "").length === 11 && !p.includes("+") && !p.startsWith("0")) {
        s -= 5;
      }
      return s;
    };
    return score(b) - score(a);
  });
  return ranked[0];
}

function isPlausibleEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return false;
  if (normalized.endsWith(".png") || normalized.endsWith(".jpg")) return false;
  if (normalized.includes("sentry.io") || normalized.includes("example.com")) {
    return false;
  }
  const local = normalized.split("@")[0] ?? "";
  if (JUNK_EMAIL_LOCAL.test(local)) return false;
  return true;
}

function uniqueStrings(values: Array<string | undefined | null>, limit = 8) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const v = value?.trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
    if (out.length >= limit) break;
  }
  return out;
}

type ExtractedContacts = {
  phones: string[];
  emails: string[];
  addresses: Array<{
    line?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }>;
  socialProfiles: Array<{ kind: string; label: string; value: string }>;
  abnOrRegistry?: string;
  postalCode?: string;
};

function extractContactsFromHtml(html: string, text: string): ExtractedContacts {
  const phones: string[] = [];
  const emails: string[] = [];
  const socialProfiles: Array<{ kind: string; label: string; value: string }> =
    [];

  for (const match of html.matchAll(/mailto:([^"'?\s>]+)/gi)) {
    try {
      const email = decodeURIComponent(match[1] ?? "")
        .split("?")[0]
        ?.trim()
        .toLowerCase();
      if (email && isPlausibleEmail(email)) emails.push(email);
    } catch {
      /* ignore */
    }
  }

  for (const match of html.matchAll(/tel:([^"'?\s>]+)/gi)) {
    try {
      const phone = normalizePhoneCandidate(decodeURIComponent(match[1] ?? ""));
      if (phone) phones.push(phone);
    } catch {
      /* ignore */
    }
  }

  for (const match of text.matchAll(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  )) {
    const email = match[0]?.toLowerCase();
    if (email && isPlausibleEmail(email)) emails.push(email);
  }

  for (const match of text.matchAll(
    /(?:\+?\d{1,3}[\s().-]*)?(?:\(?\d{2,4}\)?[\s.-]*){2,4}\d{2,4}/g,
  )) {
    const phone = normalizePhoneCandidate(match[0] ?? "");
    if (phone) phones.push(phone);
  }

  const abn =
    normalizeAbn(
      text.match(/\bABN[:\s]*([0-9\s]{8,14})\b/i)?.[1],
    ) || undefined;
  const postalCode =
    text.match(/\b(?:NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s+(\d{4})\b/i)?.[1] ||
    text.match(/\b(\d{4})\b(?:\s*Australia)?/i)?.[1] ||
    undefined;

  const socialPatterns: Array<[RegExp, string, string]> = [
    [/https?:\/\/(?:www\.)?linkedin\.com\/company\/[^\s"'<>]+/gi, "linkedin", "LinkedIn"],
    [/https?:\/\/(?:www\.)?facebook\.com\/[^\s"'<>]+/gi, "social", "Facebook"],
    [/https?:\/\/(?:www\.)?instagram\.com\/[^\s"'<>]+/gi, "social", "Instagram"],
    [/https?:\/\/(?:www\.)?youtube\.com\/[^\s"'<>]+/gi, "youtube", "YouTube"],
    [/https?:\/\/(?:www\.)?x\.com\/[^\s"'<>]+/gi, "social", "X"],
  ];
  for (const [pattern, kind, label] of socialPatterns) {
    for (const match of html.matchAll(pattern)) {
      const value = (match[0] ?? "").replace(/[),.]+$/, "");
      if (value) socialProfiles.push({ kind, label, value });
    }
  }

  const addresses: ExtractedContacts["addresses"] = [];
  // JSON-LD PostalAddress / Organization
  for (const match of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const json = JSON.parse(match[1] ?? "");
      const nodes = Array.isArray(json) ? json : [json];
      for (const node of nodes) {
        const graph = Array.isArray(node?.["@graph"])
          ? node["@graph"]
          : [node];
        for (const item of graph) {
          const addr = item?.address;
          if (addr && typeof addr === "object") {
            addresses.push({
              line: addr.streetAddress,
              locality: addr.addressLocality,
              region: addr.addressRegion,
              postalCode: addr.postalCode,
              country: addr.addressCountry,
            });
          }
          if (typeof item?.telephone === "string") {
            const phone = normalizePhoneCandidate(item.telephone);
            if (phone) phones.push(phone);
          }
          if (typeof item?.email === "string" && isPlausibleEmail(item.email)) {
            emails.push(item.email.toLowerCase());
          }
        }
      }
    } catch {
      /* ignore bad JSON-LD */
    }
  }

  // Simple AU street address heuristic
  const street = text.match(
    /\b\d{1,5}\s+[A-Za-z0-9 .'/-]{3,40}\s(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Parade|Pde|Highway|Hwy|Lane|Ln|Court|Ct|Place|Pl)\b(?:[^.]{0,60})?/i,
  )?.[0];
  if (street) {
    const cleanedStreet = street
      .replace(/\s*\(PO Box[\s\S]*$/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    const locality =
      cleanedStreet.match(
        /\b([A-Za-z ]+?)\s+(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s+(\d{4})\b/,
      ) || null;
    addresses.push({
      line: cleanedStreet,
      locality: locality?.[1]?.trim(),
      region: locality?.[2],
      postalCode: locality?.[3],
      country: /australia/i.test(cleanedStreet) ? "Australia" : undefined,
    });
  }

  return {
    phones: uniqueStrings(phones, 6),
    emails: uniqueStrings(emails, 6),
    addresses: addresses.slice(0, 4),
    socialProfiles: socialProfiles.slice(0, 8),
    abnOrRegistry: abn,
    postalCode,
  };
}

async function gatherCompanyPages(baseUrl: string): Promise<{
  url: string;
  title?: string;
  description?: string;
  text: string;
  html: string;
  contactExtras: ExtractedContacts;
}> {
  const home = await fetchPublicPageText(baseUrl);
  if (!home.ok) {
    throw new Error(home.message);
  }

  const origin = new URL(home.url).origin;
  const paths = ["/contact", "/contact-us", "/about", "/about-us", "/locations"];
  let mergedHtml = home.html;
  let mergedText = home.text;
  const extras = extractContactsFromHtml(home.html, home.text);

  for (const path of paths) {
    const page = await fetchPublicPageText(`${origin}${path}`);
    if (!page.ok) continue;
    mergedHtml += `\n${page.html}`;
    mergedText += `\n${page.text}`;
    const more = extractContactsFromHtml(page.html, page.text);
    extras.phones.push(...more.phones);
    extras.emails.push(...more.emails);
    extras.addresses.push(...more.addresses);
    extras.socialProfiles.push(...more.socialProfiles);
    if (!extras.abnOrRegistry && more.abnOrRegistry) {
      extras.abnOrRegistry = more.abnOrRegistry;
    }
    if (!extras.postalCode && more.postalCode) {
      extras.postalCode = more.postalCode;
    }
    // Stop early once we have solid contact coverage.
    if (extras.emails.length >= 1 && extras.phones.length >= 1) break;
  }

  return {
    url: home.url,
    title: home.title,
    description: home.description,
    text: mergedText.slice(0, 20_000),
    html: mergedHtml.slice(0, 1_200_000),
    contactExtras: {
      phones: uniqueStrings(extras.phones, 6),
      emails: uniqueStrings(extras.emails, 6),
      addresses: extras.addresses.slice(0, 4),
      socialProfiles: extras.socialProfiles.slice(0, 8),
      abnOrRegistry: extras.abnOrRegistry,
      postalCode: extras.postalCode,
    },
  };
}

function isBlockedSearchHost(host: string) {
  return (
    host.includes("duckduckgo.") ||
    host.includes("facebook.") ||
    host.includes("twitter.") ||
    host.includes("x.com") ||
    host.includes("youtube.") ||
    host.includes("instagram.com")
  );
}

function pushUniqueHit(
  hits: Array<{ title: string; url: string; snippet: string }>,
  hit: { title: string; url: string; snippet: string },
  limit = 8,
) {
  if (hits.length >= limit) return;
  const safe = normalizePublicHttpUrl(hit.url);
  if (!safe) return;
  try {
    const host = new URL(safe).hostname.toLowerCase();
    if (isBlockedSearchHost(host)) return;
    if (hits.some((h) => h.url === safe)) return;
    hits.push({
      title: hit.title || host,
      url: safe,
      snippet: hit.snippet.slice(0, 280),
    });
  } catch {
    /* ignore */
  }
}

async function searchDuckDuckGoInstant(query: string) {
  const hits: Array<{ title: string; url: string; snippet: string }> = [];
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query,
    )}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(8_000),
      headers: {
        Accept: "application/json",
        "User-Agent":
          "RateQuipCompanyEnrich/1.0 (+https://ratequip.com; business listing assist)",
      },
    });
    if (!res.ok) return hits;
    const data = (await res.json()) as {
      AbstractURL?: string;
      AbstractText?: string;
      Heading?: string;
      Results?: Array<{ FirstURL?: string; Text?: string }>;
      RelatedTopics?: Array<
        | { FirstURL?: string; Text?: string }
        | { Topics?: Array<{ FirstURL?: string; Text?: string }> }
      >;
    };

    if (data.AbstractURL) {
      pushUniqueHit(hits, {
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.AbstractText || "",
      });
    }
    for (const row of data.Results ?? []) {
      if (row.FirstURL) {
        pushUniqueHit(hits, {
          title: stripHtmlToText(row.Text || ""),
          url: row.FirstURL,
          snippet: stripHtmlToText(row.Text || ""),
        });
      }
    }
    for (const topic of data.RelatedTopics ?? []) {
      if ("FirstURL" in topic && topic.FirstURL) {
        pushUniqueHit(hits, {
          title: stripHtmlToText(topic.Text || ""),
          url: topic.FirstURL,
          snippet: stripHtmlToText(topic.Text || ""),
        });
      } else if ("Topics" in topic) {
        for (const nested of topic.Topics ?? []) {
          if (nested.FirstURL) {
            pushUniqueHit(hits, {
              title: stripHtmlToText(nested.Text || ""),
              url: nested.FirstURL,
              snippet: stripHtmlToText(nested.Text || ""),
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn("[company-web-enrich] instant search failed", error);
  }
  return hits;
}

async function searchDuckDuckGoHtml(query: string) {
  const hits: Array<{ title: string; url: string; snippet: string }> = [];
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(
      `${query} official company website`,
    )}`;
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "User-Agent":
          "RateQuipCompanyEnrich/1.0 (+https://ratequip.com; business listing assist)",
        Accept: "text/html",
      },
    });
    if (!res.ok) return hits;

    const html = await res.text();
    const resultRe =
      /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = resultRe.exec(html)) && hits.length < 8) {
      const hrefRaw = match[1] ?? "";
      const title = stripHtmlToText(match[2] ?? "");
      let href = hrefRaw;
      const uddg = href.match(/[?&]uddg=([^&]+)/);
      if (uddg?.[1]) {
        try {
          href = decodeURIComponent(uddg[1]);
        } catch {
          /* keep href */
        }
      }
      pushUniqueHit(hits, { title, url: href, snippet: "" });
    }

    // Snippets sit near result links in DDG HTML.
    const snippetRe =
      /class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/(?:a|td|div)>/gi;
    let snippetMatch: RegExpExecArray | null;
    let index = 0;
    while ((snippetMatch = snippetRe.exec(html)) && index < hits.length) {
      const snippet = stripHtmlToText(snippetMatch[1] ?? "");
      if (snippet && hits[index]) hits[index].snippet = snippet.slice(0, 280);
      index += 1;
    }
  } catch (error) {
    console.warn("[company-web-enrich] html search failed", error);
  }
  return hits;
}

/** Guess common company website hosts when search APIs are blocked. */
function heuristicWebsiteGuesses(query: string) {
  const trimmed = query.trim();
  const cleaned = trimmed
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9.-]+/g, "");
  if (cleaned.includes(".") && cleaned.length >= 4) {
    const url = normalizePublicHttpUrl(`https://${cleaned}`);
    return url
      ? [{ title: query, url, snippet: "Parsed from query as a website." }]
      : [];
  }

  // Only invent hostnames for compact brand-like queries (no spaces).
  if (/\s/.test(trimmed)) return [];

  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);
  if (slug.length < 3) return [];

  const guesses = [
    `https://www.${slug}.com`,
    `https://www.${slug}.com.au`,
    `https://${slug}.com`,
    `https://${slug}.com.au`,
  ];
  return guesses
    .map((url) => {
      const safe = normalizePublicHttpUrl(url);
      return safe
        ? {
            title: `${query} (${new URL(safe).hostname})`,
            url: safe,
            snippet: "Heuristic website guess — will verify by fetching.",
          }
        : null;
    })
    .filter(Boolean) as Array<{ title: string; url: string; snippet: string }>;
}

async function searchDuckDuckGo(query: string): Promise<
  Array<{ title: string; url: string; snippet: string }>
> {
  const q = query.trim();
  if (q.length < 2) return [];

  const merged: Array<{ title: string; url: string; snippet: string }> = [];
  const [instant, html] = await Promise.all([
    searchDuckDuckGoInstant(q),
    searchDuckDuckGoHtml(q),
  ]);
  for (const hit of [...instant, ...html]) {
    pushUniqueHit(merged, hit);
  }

  if (merged.length === 0) {
    for (const guess of heuristicWebsiteGuesses(q)) {
      // Only keep guesses that actually respond — cheap HEAD/GET probe.
      try {
        const probe = await fetch(guess.url, {
          method: "GET",
          signal: AbortSignal.timeout(5_000),
          headers: {
            "User-Agent":
              "RateQuipCompanyEnrich/1.0 (+https://ratequip.com; business listing assist)",
            Accept: "text/html",
          },
          redirect: "follow",
        });
        if (probe.ok || (probe.status >= 300 && probe.status < 400)) {
          pushUniqueHit(merged, {
            ...guess,
            url: probe.url || guess.url,
          });
        }
      } catch {
        /* skip dead guess */
      }
      if (merged.length >= 3) break;
    }
  }

  return merged;
}

function heuristicFromPage(input: {
  query: string;
  page: {
    url: string;
    title?: string;
    description?: string;
    text: string;
    html?: string;
  };
  contacts?: ExtractedContacts;
}): CompanyEnrichment {
  const domain = registrableDomainFromUrl(input.page.url);
  const contacts =
    input.contacts ||
    extractContactsFromHtml(input.page.html || "", input.page.text);

  const titleCandidate =
    input.page.title?.split(/[|\-–—]/)[0]?.trim() || "";
  const genericTitle =
    !titleCandidate ||
    /^(home|welcome|official site|for a better world)$/i.test(titleCandidate);

  const name = (
    genericTitle
      ? input.query.trim() || domain || titleCandidate
      : titleCandidate || input.query.trim() || domain || "Company"
  ).slice(0, 160);

  const lower = input.page.text.toLowerCase();
  const types: CompanyType[] = [];
  if (/manufactur|oem|factory/.test(lower)) types.push("manufacturer");
  if (/supplier|distributor|dealer/.test(lower)) types.push("supplier");
  if (/contractor|install/.test(lower)) types.push("contractor");
  if (types.length === 0) types.push("supplier");

  const primaryAddress = contacts.addresses[0];
  const abnDigits = (contacts.abnOrRegistry || "").replace(/\D/g, "");
  const phones = uniqueStrings(contacts.phones, 6).filter((p) => {
    const digits = p.replace(/\D/g, "");
    if (digits.length === 11 && abnDigits && digits === abnDigits) return false;
    return true;
  });
  const emails = contacts.emails;
  const primaryPhone = pickPrimaryPhone(phones);

  return {
    companyName: name.slice(0, 160),
    legalName: name.slice(0, 160),
    websiteUrl: input.page.url,
    phoneDisplay: primaryPhone,
    phones,
    emails,
    countryCode: primaryAddress?.country,
    locality: primaryAddress?.locality,
    region: primaryAddress?.region,
    addressLine: primaryAddress?.line,
    postalCode: primaryAddress?.postalCode || contacts.postalCode,
    addresses: contacts.addresses,
    abnOrRegistry: normalizeAbn(contacts.abnOrRegistry),
    headline: input.page.description?.slice(0, 180),
    description: (input.page.description || input.page.text).slice(0, 600),
    companyTypes: types,
    categoryHints: [],
    publicProfiles: contacts.socialProfiles,
    confidence: 0.55,
    publicSourceUrl: input.page.url,
    source: "web_scrape",
    usedAi: false,
    fetchedUrl: input.page.url,
    matchReasons: [
      "Fetched public website",
      domain ? `Domain ${domain}` : "Website content parsed",
      phones.length ? `${phones.length} phone(s)` : "No phone found",
      emails.length ? `${emails.length} email(s)` : "No email found",
    ],
  };
}

function mergeEnrichmentWithContacts(
  enrichment: CompanyEnrichment,
  contacts: ExtractedContacts,
): CompanyEnrichment {
  const phones = uniqueStrings(
    [...(enrichment.phones ?? []), enrichment.phoneDisplay, ...contacts.phones],
    6,
  ).filter((p) => {
    const digits = p.replace(/\D/g, "");
    const abnDigits = (enrichment.abnOrRegistry || contacts.abnOrRegistry || "")
      .replace(/\D/g, "");
    if (digits.length === 11 && abnDigits && digits === abnDigits) return false;
    return true;
  });
  const emails = uniqueStrings(
    [...(enrichment.emails ?? []), ...contacts.emails],
    6,
  );
  const addresses =
    enrichment.addresses?.length > 0
      ? enrichment.addresses
      : contacts.addresses;
  const primary = addresses[0];
  const profiles = [
    ...(enrichment.publicProfiles ?? []),
    ...contacts.socialProfiles,
  ].slice(0, 10);
  const primaryPhone = pickPrimaryPhone(phones);

  return {
    ...enrichment,
    phoneDisplay: enrichment.phoneDisplay || primaryPhone,
    phones,
    emails,
    faxDisplay: enrichment.faxDisplay,
    addressLine: enrichment.addressLine || primary?.line,
    locality: enrichment.locality || primary?.locality,
    region: enrichment.region || primary?.region,
    postalCode:
      enrichment.postalCode || primary?.postalCode || contacts.postalCode,
    countryCode: enrichment.countryCode || primary?.country,
    addresses,
    abnOrRegistry: normalizeAbn(
      enrichment.abnOrRegistry || contacts.abnOrRegistry,
    ),
    publicProfiles: profiles,
    matchReasons: uniqueStrings(
      [
        ...enrichment.matchReasons,
        phones.length ? `Phones: ${phones.join(", ")}` : undefined,
        emails.length ? `Emails: ${emails.join(", ")}` : undefined,
        (enrichment.addressLine || primary?.line)
          ? `Address: ${enrichment.addressLine || primary?.line}`
          : undefined,
      ],
      8,
    ),
  };
}

async function aiEnrichFromPage(input: {
  query: string;
  country?: string;
  page: {
    url: string;
    title?: string;
    description?: string;
    text: string;
    html?: string;
  };
  contacts?: ExtractedContacts;
}): Promise<CompanyEnrichment> {
  const fallback = heuristicFromPage(input);
  try {
    const { object } = await generateObject({
      model: RFQ_AI_MODEL,
      schema: companyEnrichmentSchema,
      maxRetries: RFQ_AI_MAX_RETRIES,
      temperature: 0.1,
      abortSignal: AbortSignal.timeout(20_000),
      system: `You extract a complete public business profile for RateQuip from website text.
Only use facts present in the provided page content and pre-extracted contacts.
Extract every public phone, email, street address, locality, region/state, postal code, ABN/registry and social profile you can find.
Do not invent phone numbers, emails, ABN values, or addresses.
Prefer company/sales/info emails over personal consumer inboxes.
categoryHints should be short industrial category labels (e.g. packaging-machinery, inkjet-printers).
companyTypes must be from: ${COMPANY_TYPES.join(", ")}.`,
      prompt: JSON.stringify({
        searchQuery: input.query,
        preferredCountry: input.country,
        pageUrl: input.page.url,
        pageTitle: input.page.title,
        pageDescription: input.page.description,
        pageText: input.page.text.slice(0, 14000),
        preExtractedContacts: input.contacts ?? {
          phones: fallback.phones,
          emails: fallback.emails,
          addresses: fallback.addresses,
        },
      }),
    });

    const merged = mergeEnrichmentWithContacts(
      {
        ...object,
        websiteUrl:
          normalizePublicHttpUrl(object.websiteUrl || "") || input.page.url,
        publicSourceUrl: input.page.url,
        source: "web_scrape",
        usedAi: true,
        fetchedUrl: input.page.url,
        matchReasons: [
          "AI structured extraction from public website",
          `Confidence ${Math.round((object.confidence || 0.5) * 100)}%`,
        ],
      },
      input.contacts || {
        phones: [],
        emails: [],
        addresses: [],
        socialProfiles: [],
      },
    );
    return merged;
  } catch (error) {
    console.warn("[company-web-enrich] AI extract failed", error);
    return fallback;
  }
}

/**
 * Resolve one company enrichment from a known website or by searching the open web.
 */
export async function enrichCompanyFromWeb(input: {
  query: string;
  websiteUrl?: string;
  country?: string;
}): Promise<
  | { ok: true; enrichment: CompanyEnrichment; searchHits: WebCompanyDiscovery["searchHits"] }
  | { ok: false; message: string }
> {
  const query = input.query.trim();
  if (query.length < 2 && !input.websiteUrl) {
    return { ok: false, message: "Enter a company name or website." };
  }

  let target =
    normalizePublicHttpUrl(input.websiteUrl || "") ||
    (looksLikeUrlQuery(query) ? normalizePublicHttpUrl(query) : null);

  let searchHits: WebCompanyDiscovery["searchHits"] = [];

  if (!target) {
    searchHits = await searchDuckDuckGo(
      [query, input.country].filter(Boolean).join(" "),
    );
    target = searchHits[0]?.url ?? null;
  }

  if (!target) {
    // Tier-1 registry may still resolve AU companies without a website.
    if (
      isAustraliaContext({
        country: input.country,
        query,
      })
    ) {
      const shell: CompanyEnrichment = {
        companyName: query.slice(0, 160) || "Company",
        websiteUrl: undefined,
        phones: [],
        emails: [],
        addresses: [],
        companyTypes: ["supplier"],
        categoryHints: [],
        publicProfiles: [],
        confidence: 0.2,
        countryCode: input.country || "Australia",
        source: "heuristic",
        usedAi: false,
        matchReasons: ["No public website found — trying ABN Lookup"],
      };
      const withRegistry = await applyAustralianRegistry(shell, {
        query,
        country: input.country,
      });
      if (withRegistry.abnOrRegistry) {
        return { ok: true, enrichment: withRegistry, searchHits };
      }
    }
    // Last resort: heuristic shell so the wizard can still proceed.
    return {
      ok: true,
      enrichment: {
        companyName: query.slice(0, 160) || "Company",
        websiteUrl: undefined,
        phones: [],
        emails: [],
        addresses: [],
        companyTypes: ["supplier"],
        categoryHints: [],
        publicProfiles: [],
        confidence: 0.2,
        countryCode: input.country,
        source: "heuristic",
        usedAi: false,
        matchReasons: [
          "No public website could be fetched — enter details manually or try a full website URL",
        ],
      },
      searchHits,
    };
  }

  let bundle: Awaited<ReturnType<typeof gatherCompanyPages>>;
  try {
    bundle = await gatherCompanyPages(target);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to scrape website";
    const failedShell: CompanyEnrichment = {
      companyName: query.slice(0, 160) || target,
      websiteUrl: target,
      phones: [],
      emails: [],
      addresses: [],
      companyTypes: ["supplier"],
      categoryHints: [],
      publicProfiles: [],
      confidence: 0.25,
      countryCode: input.country,
      publicSourceUrl: target,
      source: "web_search",
      usedAi: false,
      fetchedUrl: target,
      matchReasons: [`Found website candidate but scrape failed: ${message}`],
    };
    const withRegistry = await applyAustralianRegistry(failedShell, {
      query,
      country: input.country,
      websiteUrl: target,
    });
    return { ok: true, enrichment: withRegistry, searchHits };
  }

  const enrichment = await aiEnrichFromPage({
    query: query || bundle.title || target,
    country: input.country,
    page: {
      url: bundle.url,
      title: bundle.title,
      description: bundle.description,
      text: bundle.text,
      html: bundle.html,
    },
    contacts: bundle.contactExtras,
  });

  const withRegistry = await applyAustralianRegistry(enrichment, {
    query: query || enrichment.companyName,
    country: input.country,
    websiteUrl: target,
  });

  return { ok: true, enrichment: withRegistry, searchHits };
}

/**
 * Search the web for several company candidates and enrich the top results.
 */
export async function discoverCompaniesFromWeb(input: {
  query: string;
  country?: string;
  limit?: number;
}): Promise<WebCompanyDiscovery> {
  const query = input.query.trim();
  const limit = Math.min(input.limit ?? 4, 5);
  const enrichments: CompanyEnrichment[] = [];

  // Direct URL query → single scrape
  const directUrl = looksLikeUrlQuery(query)
    ? normalizePublicHttpUrl(query)
    : null;

  if (directUrl) {
    const one = await enrichCompanyFromWeb({
      query,
      websiteUrl: directUrl,
      country: input.country,
    });
    if (one.ok) {
      return {
        query,
        enrichments: [one.enrichment],
        searchHits: one.searchHits,
        usedWebSearch: false,
        message: one.enrichment.usedAi
          ? "Filled from the company website with AI extraction."
          : "Filled from the company website.",
      };
    }
  }

  const searchHits = await searchDuckDuckGo(
    [query, input.country].filter(Boolean).join(" "),
  );

  const seenHosts = new Set<string>();
  for (const hit of searchHits) {
    if (enrichments.length >= limit) break;
    const host = (() => {
      try {
        return new URL(hit.url).hostname.replace(/^www\./, "");
      } catch {
        return hit.url;
      }
    })();
    if (seenHosts.has(host)) continue;
    seenHosts.add(host);

    try {
      const bundle = await gatherCompanyPages(hit.url);
      const enrichment = await aiEnrichFromPage({
        query,
        country: input.country,
        page: {
          url: bundle.url,
          title: bundle.title,
          description: bundle.description,
          text: bundle.text,
          html: bundle.html,
        },
        contacts: bundle.contactExtras,
      });
      enrichments.push({
        ...enrichment,
        matchReasons: [
          ...enrichment.matchReasons,
          `Web search hit: ${hit.title}`,
        ],
      });
    } catch {
      // Keep the public search result so the user can still pick / scrape it.
      const title =
        hit.title.split(/[|\-–—]/)[0]?.trim() || query;
      enrichments.push({
        companyName: title.slice(0, 160),
        websiteUrl: hit.url,
        phones: [],
        emails: [],
        addresses: [],
        companyTypes: ["supplier"],
        categoryHints: [],
        publicProfiles: [],
        confidence: 0.35,
        countryCode: input.country,
        headline: hit.snippet?.slice(0, 180) || undefined,
        description: hit.snippet?.slice(0, 600) || undefined,
        publicSourceUrl: hit.url,
        source: "web_search",
        usedAi: false,
        fetchedUrl: hit.url,
        matchReasons: [
          "Found via public web search",
          hit.snippet
            ? "Snippet available — open site or continue to scrape in Details"
            : "Website candidate — details not fully scraped yet",
        ],
      });
    }
  }

  if (enrichments.length === 0 && query.length >= 2) {
    const fallback = await enrichCompanyFromWeb({
      query,
      country: input.country,
    });
    if (fallback.ok) enrichments.push(fallback.enrichment);
  }

  return {
    query,
    enrichments,
    searchHits,
    usedWebSearch: searchHits.length > 0,
    message:
      enrichments.length > 0
        ? `Found ${enrichments.length} public web candidate${enrichments.length === 1 ? "" : "s"}. Review extracted details or add the company with your own brief description.`
        : "No public websites found yet. Enter the company name and a brief description below, or try a full website URL.",
  };
}

export function enrichmentToListingFields(enrichment: CompanyEnrichment) {
  const phones = uniqueStrings(
    [...(enrichment.phones ?? []), enrichment.phoneDisplay],
    6,
  );
  const emails = uniqueStrings(enrichment.emails ?? [], 6);
  const primaryPhone = pickPrimaryPhone(phones) || enrichment.phoneDisplay;
  const contactSummary = [
    phones.length ? `Phones: ${phones.join("; ")}` : null,
    emails.length ? `Emails: ${emails.join("; ")}` : null,
    enrichment.addressLine
      ? `Address: ${[
          enrichment.addressLine,
          enrichment.locality,
          enrichment.region,
          enrichment.postalCode,
          enrichment.countryCode,
        ]
          .filter(Boolean)
          .join(", ")}`
      : null,
    enrichment.abnOrRegistry
      ? `Registry/ABN: ${enrichment.abnOrRegistry}${
          enrichment.registryMeta?.status
            ? ` (${enrichment.registryMeta.status})`
            : ""
        }`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    companyName: enrichment.legalName || enrichment.companyName,
    websiteUrl: enrichment.websiteUrl,
    companyTypes: enrichment.companyTypes.length
      ? enrichment.companyTypes
      : (["supplier"] as CompanyType[]),
    countryCode: enrichment.countryCode,
    locality: enrichment.locality,
    region: enrichment.region,
    addressLine: enrichment.addressLine,
    postalCode: enrichment.postalCode,
    phoneDisplay: primaryPhone,
    phoneNumbers: phones,
    emailCandidates: emails,
    publicSourceUrl: enrichment.publicSourceUrl || enrichment.websiteUrl,
    headline: enrichment.headline?.trim() || undefined,
    description: enrichment.description?.trim() || undefined,
    privateNotes: [
      "Auto-filled from public web sources. Review before publishing.",
      enrichment.registryMeta
        ? `Tier-1 registry: ABN Lookup (${enrichment.registryMeta.transport || "unknown"})`
        : null,
      contactSummary,
    ]
      .filter(Boolean)
      .join("\n\n"),
    categoryHints: enrichment.categoryHints,
    abnOrRegistry: enrichment.abnOrRegistry,
    publicProfiles: enrichment.publicProfiles,
    addresses: enrichment.addresses,
    registryMeta: enrichment.registryMeta,
  };
}
