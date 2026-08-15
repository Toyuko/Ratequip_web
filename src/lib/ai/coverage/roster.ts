import { generateObject } from "ai";
import { RFQ_AI_MAX_RETRIES, RFQ_AI_MODEL } from "@/lib/ai/model";
import { COVERAGE_SHARED_RULES } from "./shared-rules";
import {
  rosterExtractionSchema,
  type RosterCandidate,
} from "./types";

function uniqueByName(candidates: RosterCandidate[], limit = 30) {
  const out: RosterCandidate[] = [];
  const seen = new Set<string>();
  for (const c of candidates) {
    const key = c.rawName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || key.length < 2) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

/** Cheap HTML/text heuristics when AI is unavailable. */
export function heuristicRosterExtract(input: {
  sourceUrl: string;
  text: string;
  html?: string;
}): RosterCandidate[] {
  const candidates: RosterCandidate[] = [];
  const text = input.text;

  // Linked company-ish anchors
  if (input.html) {
    let sourceHost = "";
    try {
      sourceHost = new URL(input.sourceUrl).hostname;
    } catch {
      sourceHost = "";
    }
    const linkRe =
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(input.html)) && candidates.length < 40) {
      const href = (match[1] ?? "").trim();
      const label = (match[2] ?? "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (label.length < 3 || label.length > 120) continue;
      if (/^(home|contact|about|login|register|privacy|cookie|next|prev|page\s*\d+)/i.test(label)) {
        continue;
      }
      if (!/[A-Za-z]{2,}/.test(label)) continue;
      if (href.startsWith("#")) continue;

      let absolute: string | null = null;
      try {
        absolute = new URL(href, input.sourceUrl).toString();
      } catch {
        absolute = null;
      }

      const isExternal =
        absolute &&
        sourceHost &&
        (() => {
          try {
            return new URL(absolute).hostname !== sourceHost;
          } catch {
            return false;
          }
        })();

      candidates.push({
        rawName: label.slice(0, 200),
        nativeName: null,
        website: isExternal ? absolute : null,
        profileUrl: !isExternal && absolute ? absolute : null,
        countryHint: null,
        cityHint: null,
        categoryHints: [],
        brandsOnPage: [],
        roleGuess: "unknown",
        sourceRef: null,
        evidenceQuote: label.slice(0, 200),
        sourceUrl: input.sourceUrl,
      });
    }
  }

  // Bullet / line names: "· Acme Packaging GmbH"
  for (const line of text.split(/(?<=[.!?])\s+|\n+/)) {
    const cleaned = line.replace(/\s+/g, " ").trim();
    if (cleaned.length < 4 || cleaned.length > 100) continue;
    if (
      /\b(GmbH|S\.p\.A\.|S\.r\.l\.|Pty Ltd|Ltd\.|LLC|Inc\.|A\.Ş\.|株式会社|有限公司)\b/i.test(
        cleaned,
      )
    ) {
      candidates.push({
        rawName: cleaned.slice(0, 200),
        nativeName: null,
        website: null,
        profileUrl: null,
        countryHint: null,
        cityHint: null,
        categoryHints: [],
        brandsOnPage: [],
        roleGuess: "unknown",
        sourceRef: null,
        evidenceQuote: cleaned.slice(0, 200),
        sourceUrl: input.sourceUrl,
      });
    }
  }

  return uniqueByName(candidates, 30);
}

/**
 * P2 roster extraction — high recall from a fetched list page.
 */
export async function extractRosterFromPage(input: {
  sourceUrl: string;
  pageText: string;
  html?: string;
  useAi?: boolean;
}): Promise<{
  companies: RosterCandidate[];
  nextPageUrls: string[];
  facetUrls: string[];
  usedAi: boolean;
}> {
  const heuristic = heuristicRosterExtract({
    sourceUrl: input.sourceUrl,
    text: input.pageText,
    html: input.html,
  });

  if (input.useAi === false) {
    return {
      companies: heuristic,
      nextPageUrls: [],
      facetUrls: [],
      usedAi: false,
    };
  }

  try {
    const { object } = await generateObject({
      model: RFQ_AI_MODEL,
      schema: rosterExtractionSchema,
      maxRetries: RFQ_AI_MAX_RETRIES,
      temperature: 0,
      abortSignal: AbortSignal.timeout(22_000),
      system: `${COVERAGE_SHARED_RULES}

TASK: ROSTER EXTRACTION

Extract EVERY company entity named on the page. This is a recall task.
Do not filter. Do not judge quality. Do not deduplicate. Do not skip distributors.
Special cases:
- Booth/stand/member IDs go in sourceRef.
- Parent with brands: one parent row, brands in brandsOnPage.
- Non-Latin names: nativeName = original; rawName = Latin form only if printed.
- Source profile links go in profileUrl, not website.
Only include URLs that appear in the page text.`,
      prompt: JSON.stringify({
        sourceUrl: input.sourceUrl,
        pageText: input.pageText.slice(0, 12_000),
      }),
    });

    const merged = uniqueByName(
      [
        ...object.companies.map((c) => ({
          ...c,
          sourceUrl: c.sourceUrl || input.sourceUrl,
        })),
        ...heuristic,
      ],
      40,
    );

    return {
      companies: merged,
      nextPageUrls: object.nextPageUrls.slice(0, 5),
      facetUrls: object.facetUrls.slice(0, 8),
      usedAi: true,
    };
  } catch (error) {
    console.warn("[coverage] roster AI extract failed", error);
    return {
      companies: heuristic,
      nextPageUrls: [],
      facetUrls: [],
      usedAi: false,
    };
  }
}
