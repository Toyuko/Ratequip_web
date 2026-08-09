import { z } from "zod";
import { generateObject } from "ai";
import { RFQ_AI_MAX_RETRIES, RFQ_AI_MODEL } from "@/lib/ai/model";
import { registrableDomainFromUrl } from "@/lib/organic-growth/privacy";
import type { DiscoveredSource } from "@/lib/claims/types";

export const companyClaimDiscoverSchema = z.object({
  emailDomain: z.string().optional(),
  phone: z.string().optional(),
  abnOrRegistry: z.string().optional(),
  legalName: z.string().optional(),
  sources: z
    .array(
      z.object({
        kind: z.enum([
          "website",
          "email_domain",
          "phone",
          "abn",
          "linkedin",
          "google_business",
          "alibaba",
          "youtube",
          "social",
          "other",
        ]),
        label: z.string(),
        value: z.string(),
        strength: z.enum(["very_strong", "strong", "medium", "supporting"]),
        confidence: z.number().min(0).max(1),
      }),
    )
    .default([]),
});

export type CompanyClaimDiscoverResult = z.infer<
  typeof companyClaimDiscoverSchema
> & {
  sources: DiscoveredSource[];
  usedAi: boolean;
};

function heuristicDiscover(input: {
  name: string;
  website?: string;
  city?: string;
  country?: string;
  phone?: string;
  abn?: string;
  publicProfiles?: Array<{
    kind: DiscoveredSource["kind"];
    label: string;
    value: string;
  }>;
}): CompanyClaimDiscoverResult {
  const domain = registrableDomainFromUrl(input.website);
  const sources: DiscoveredSource[] = [];

  if (input.website) {
    sources.push({
      id: "src-website",
      kind: "website",
      label: "Company website",
      value: input.website,
      strength: "very_strong",
      confidence: 0.95,
    });
  }
  if (domain) {
    sources.push({
      id: "src-email-domain",
      kind: "email_domain",
      label: `Work email @${domain}`,
      value: domain,
      strength: "strong",
      confidence: 0.92,
    });
  }
  if (input.phone) {
    sources.push({
      id: "src-phone",
      kind: "phone",
      label: "Published company phone",
      value: input.phone,
      strength: "strong",
      confidence: 0.85,
    });
  }
  if (input.abn) {
    sources.push({
      id: "src-abn",
      kind: "abn",
      label: "Business registration / ABN",
      value: input.abn,
      strength: "strong",
      confidence: 0.8,
    });
  }
  for (const [index, profile] of (input.publicProfiles ?? []).entries()) {
    sources.push({
      id: `src-public-${index}`,
      kind: profile.kind,
      label: profile.label,
      value: profile.value,
      strength:
        profile.kind === "linkedin" || profile.kind === "alibaba"
          ? "medium"
          : "supporting",
      confidence: 0.65,
    });
  }

  return {
    emailDomain: domain,
    phone: input.phone,
    abnOrRegistry: input.abn,
    legalName: input.name,
    sources,
    usedAi: false,
  };
}

export async function discoverCompanyClaimSources(input: {
  name: string;
  website?: string;
  city?: string;
  country?: string;
  phone?: string;
  abn?: string;
  publicProfiles?: Array<{
    kind: DiscoveredSource["kind"];
    label: string;
    value: string;
  }>;
  description?: string;
}): Promise<CompanyClaimDiscoverResult> {
  const fallback = heuristicDiscover(input);

  try {
    const { object } = await generateObject({
      model: RFQ_AI_MODEL,
      schema: companyClaimDiscoverSchema,
      maxRetries: RFQ_AI_MAX_RETRIES,
      temperature: 0.2,
      abortSignal: AbortSignal.timeout(15000),
      system: `You help RateQuip pre-fill company claim verification sources.
Only suggest plausible public business sources from the provided company facts.
Never invent registry numbers or phone numbers that were not implied.
Prefer website domain, work email domain, phone, ABN/registry, LinkedIn, Google Business, Alibaba, YouTube/social.
Mark strength honestly: website/DNS and registry are strong; social is supporting.`,
      prompt: JSON.stringify({
        name: input.name,
        website: input.website,
        city: input.city,
        country: input.country,
        phone: input.phone,
        abn: input.abn,
        description: input.description?.slice(0, 500),
        knownProfiles: input.publicProfiles,
      }),
    });

    const sources: DiscoveredSource[] = object.sources.map((s, i) => ({
      id: `ai-${i}-${s.kind}`,
      ...s,
    }));

    // Prefer heuristic seeds when AI omitted core facts we already know.
    const mergedIds = new Set(sources.map((s) => s.value.toLowerCase()));
    for (const seed of fallback.sources) {
      if (!mergedIds.has(seed.value.toLowerCase())) {
        sources.unshift(seed);
      }
    }

    return {
      emailDomain: object.emailDomain || fallback.emailDomain,
      phone: object.phone || fallback.phone,
      abnOrRegistry: object.abnOrRegistry || fallback.abnOrRegistry,
      legalName: object.legalName || fallback.legalName,
      sources,
      usedAi: true,
    };
  } catch (error) {
    console.warn("[claim-discover] AI fallback", error);
    return fallback;
  }
}
