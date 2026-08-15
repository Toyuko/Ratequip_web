import { generateObject } from "ai";
import { RFQ_AI_MAX_RETRIES, RFQ_AI_MODEL } from "@/lib/ai/model";
import { COVERAGE_SHARED_RULES } from "./shared-rules";
import {
  lateralExpansionSchema,
  type LateralCandidate,
} from "./types";

/**
 * P3-lite lateral expansion from page text already fetched for a seed company.
 * Probes distributors / partners / brands named on the seed site (no extra web search).
 */
export async function expandLaterallyFromPage(input: {
  companyName: string;
  companyDomain?: string;
  country?: string;
  categoryHints?: string[];
  pageText: string;
  pageUrl: string;
  useAi?: boolean;
}): Promise<{ candidates: LateralCandidate[]; usedAi: boolean }> {
  if (input.useAi === false) {
    return {
      candidates: heuristicLateralFromText(input),
      usedAi: false,
    };
  }

  try {
    const { object } = await generateObject({
      model: RFQ_AI_MODEL,
      schema: lateralExpansionSchema,
      maxRetries: RFQ_AI_MAX_RETRIES,
      temperature: 0,
      abortSignal: AbortSignal.timeout(20_000),
      system: `${COVERAGE_SHARED_RULES}

TASK: LATERAL EXPANSION (on-page only)

From the seed company's own page text, extract OTHER companies named as:
distributors, agents, dealers, partners, brands represented, subsidiaries,
parents, competitors compared, or OEMs referenced in case studies.

Only emit names that appear in the page text. Website only if the URL appears
verbatim. Prefer high-confidence distributor and partner mentions.`,
      prompt: JSON.stringify({
        seed: {
          name: input.companyName,
          domain: input.companyDomain,
          country: input.country,
          categories: input.categoryHints ?? [],
        },
        pageUrl: input.pageUrl,
        pageText: input.pageText.slice(0, 10_000),
      }),
    });

    return {
      candidates: object.candidates.slice(0, 20),
      usedAi: true,
    };
  } catch (error) {
    console.warn("[coverage] lateral expansion failed", error);
    return {
      candidates: heuristicLateralFromText(input),
      usedAi: false,
    };
  }
}

function heuristicLateralFromText(input: {
  companyName: string;
  pageText: string;
  pageUrl: string;
}): LateralCandidate[] {
  const candidates: LateralCandidate[] = [];
  const sections = input.pageText.match(
    /(?:distributors?|dealers?|partners?|agents?|where to buy|authorised|authorized|our brands|brands we)[\s\S]{0,800}/gi,
  );
  if (!sections) return candidates;

  for (const section of sections.slice(0, 3)) {
    for (const match of section.matchAll(
      /\b([A-Z][A-Za-z0-9&.''-]{1,40}(?:\s+[A-Z][A-Za-z0-9&.''-]{1,40}){0,4})\b/g,
    )) {
      const name = (match[1] ?? "").trim();
      if (name.length < 3) continue;
      if (name.toLowerCase() === input.companyName.toLowerCase()) continue;
      if (
        /^(Distributor|Dealer|Partner|Agent|Contact|About|Home|Europe|Asia|America)$/i.test(
          name,
        )
      ) {
        continue;
      }
      candidates.push({
        rawName: name,
        nativeName: null,
        website: null,
        countryHint: null,
        relationship: /brand/i.test(section)
          ? "oem_of_seeds_distributor"
          : "distributor_of_seed",
        probe: /brand/i.test(section) ? 2 : 1,
        confidence: "low",
        evidenceQuote: section.slice(0, 200),
        sourceUrl: input.pageUrl,
      });
      if (candidates.length >= 12) break;
    }
  }

  const seen = new Set<string>();
  return candidates.filter((c) => {
    const key = c.rawName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
