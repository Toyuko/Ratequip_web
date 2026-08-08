/**
 * Part 5 company-setup interview builder.
 * Combines Part 1 DQE packs with Part 5 operating-profile + industry packs.
 * Deterministic — no live LLM. Framing is assistant-style for the wizard UI.
 *
 * Industry packs are sensed from company name / early answers when possible.
 * Callers should not require users to pick a demo vertical pack up front.
 */
import universalIndustrial from "@/data/v12/part5/universal_industrial.v1.json";
import generalIndustrial from "@/data/v12/part5/general.v1.json";
import handSanitiser from "@/data/v12/part5/hand_sanitiser.v1.json";
import miningAssay from "@/data/v12/part5/mining_assay.v1.json";
import petFood from "@/data/v12/part5/pet_food.v1.json";
import pharmaCapping from "@/data/v12/part5/pharma_capping.v1.json";
import { questionsForPack } from "@/lib/v12/seeds";
import type {
  CompanyRole,
  SetupQuestion,
  SetupSection,
  SetupSuggestion,
} from "@/lib/v12/operating-profile/types";

type IndustryPack = {
  industry: string;
  version: string;
  adjacent: string[];
  critical_questions: string[];
};

const INDUSTRY_PACKS: Record<string, IndustryPack> = {
  general: generalIndustrial as IndustryPack,
  pet_food: petFood as IndustryPack,
  pharma_capping: pharmaCapping as IndustryPack,
  hand_sanitiser: handSanitiser as IndustryPack,
  mining_assay: miningAssay as IndustryPack,
};

/** Keyword / alias hints used to sense a pack from company name or free text. */
const PACK_SENSE_ALIASES: Record<string, string[]> = {
  pet_food: [
    "pet food",
    "petfood",
    "pet-food",
    "kibble",
    "animal feed",
    "pet nutrition",
    "wet pet",
    "dry pet",
  ],
  pharma_capping: [
    "pharma",
    "pharmaceutical",
    "capping",
    "capper",
    "vial",
    "sterile fill",
    "tablet",
    "gmp",
    "life science",
  ],
  hand_sanitiser: [
    "sanitiser",
    "sanitizer",
    "hand gel",
    "disinfectant",
    "hygiene liquid",
    "ethanol gel",
  ],
  mining_assay: [
    "mining",
    "assay",
    "mineral",
    "ore",
    "metallurgy",
    "lab assay",
    "geo lab",
  ],
};

const GROUP_LABELS: Record<string, string> = {
  business_objective: "Business outcome",
  current_process: "How you operate today",
  product: "Products & materials",
  capacity: "Capacity & throughput",
  cleaning: "Cleaning & contamination control",
  integration: "Systems & interfaces",
  commercial: "Budget & commercial terms",
  lifecycle: "Lifecycle & support",
};

const ROLE_PACK: Record<CompanyRole, string> = {
  buyer: "role.buyer",
  supplier: "role.supplier",
  contractor: "role.contractor",
};

export const COMPANY_SETUP_POLICY = "v12.2-part5-ops-profile-5c";

export function listSetupIndustryPacks() {
  return Object.entries(INDUSTRY_PACKS)
    .filter(([id]) => id !== "general")
    .map(([id, pack]) => ({
      id,
      label: pack.industry.replace(/_/g, " "),
      version: pack.version,
      adjacentCount: pack.adjacent.length,
    }));
}

export function getSetupIndustryPack(id: string): IndustryPack {
  return INDUSTRY_PACKS[id] ?? INDUSTRY_PACKS.general!;
}

function normaliseSenseText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Sense a setup industry pack from company name and/or early free-text answers.
 * Returns `general` when no vertical pack matches confidently.
 */
export function suggestSetupIndustryPack(text: string): {
  packId: string;
  confidence: number;
  reason: string;
} {
  const haystack = normaliseSenseText(text);
  if (!haystack) {
    return {
      packId: "general",
      confidence: 0,
      reason: "No company or industry text yet — using general industrial interview.",
    };
  }

  let bestId = "general";
  let bestScore = 0;
  let bestHit = "";

  for (const [packId, aliases] of Object.entries(PACK_SENSE_ALIASES)) {
    for (const alias of aliases) {
      const needle = normaliseSenseText(alias);
      if (!needle) continue;
      if (haystack.includes(needle) || needle.split(" ").every((t) => haystack.includes(t))) {
        const score = needle.length;
        if (score > bestScore) {
          bestScore = score;
          bestId = packId;
          bestHit = alias;
        }
      }
    }
  }

  if (bestId === "general") {
    return {
      packId: "general",
      confidence: 0.2,
      reason:
        "No specialised vertical matched — using general industrial interview; answers can refine this later.",
    };
  }

  return {
    packId: bestId,
    confidence: Math.min(0.95, 0.55 + bestScore / 40),
    reason: `Sensed from “${bestHit}” in the company / industry text.`,
  };
}

export function resolveSetupIndustryPack(input: {
  companyName?: string;
  industryPack?: string | null;
  hintText?: string;
}): {
  packId: string;
  source: "explicit" | "inferred" | "general";
  confidence: number;
  reason: string;
} {
  const explicit = (input.industryPack ?? "").trim();
  if (explicit && explicit !== "auto" && INDUSTRY_PACKS[explicit]) {
    return {
      packId: explicit,
      source: explicit === "general" ? "general" : "explicit",
      confidence: 1,
      reason: "Industry pack provided explicitly.",
    };
  }

  const sensed = suggestSetupIndustryPack(
    [input.companyName ?? "", input.hintText ?? ""].filter(Boolean).join(" "),
  );
  return {
    packId: sensed.packId,
    source: sensed.packId === "general" ? "general" : "inferred",
    confidence: sensed.confidence,
    reason: sensed.reason,
  };
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

/** Multi-select answers are stored as comma-separated values. */
export function parseMultiAnswer(value: string | undefined | null): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function hasIntent(
  answer: string | undefined | null,
  ...needles: string[]
): boolean {
  const selected = new Set(parseMultiAnswer(answer));
  return needles.some((n) => selected.has(n));
}

function dqeToQuestion(
  q: ReturnType<typeof questionsForPack>[number],
  groupId: string,
  groupLabel: string,
  answerOwner: SetupQuestion["answerOwner"],
): SetupQuestion {
  const opts = (q.options ?? []).map((o) =>
    typeof o === "string"
      ? { value: o, label: o.replace(/_/g, " ") }
      : o,
  );
  const answerType = q.answer_type ?? q.input_type ?? "text";
  let inputType: SetupQuestion["inputType"] = "textarea";
  if (answerType === "multi_select") inputType = "multi_select";
  else if (answerType === "single_select" || opts.length > 0)
    inputType = "single_select";
  if (answerType === "text" || answerType === "short_text") inputType = "text";

  return {
    id: q.id,
    prompt: q.prompt ?? q.id,
    groupId,
    groupLabel,
    required: true,
    inputType: opts.length === 0 && inputType === "single_select" ? "textarea" : inputType,
    options: opts.length > 0 ? opts : undefined,
    whyAsked:
      q.id === "universal.intent"
        ? "Select all that apply. Helps RateQuip route you to the right workspace and matching rules."
        : "Helps RateQuip route you to the right workspace and matching rules for your role.",
    answerOwner,
    source: "dqe",
  };
}

export function buildCompanySetupSections(input: {
  role: CompanyRole;
  industryPack: string;
}): SetupSection[] {
  const pack = getSetupIndustryPack(input.industryPack);
  const sections: SetupSection[] = [];

  const universalQs = questionsForPack("universal")
    .filter((q) =>
      ["universal.intent", "universal.primary_industry", "universal.locations"].includes(
        q.id,
      ),
    )
    .map((q) => dqeToQuestion(q, "activation", "Company basics", "either"));

  // Intent is multi-select for setup; industry/locations are free text with clearer copy.
  // "claim company" is omitted — the user is already creating this company profile.
  const SETUP_INTENT_OPTIONS: Array<{ value: string; label: string }> = [
    { value: "publish_products", label: "Publish products / capabilities and get matched" },
    { value: "find_supplier", label: "Find suppliers or equipment" },
    { value: "create_rfq", label: "Create RFQs and compare quotes" },
    { value: "find_work", label: "Find contractor or service work" },
    { value: "add_asset", label: "Register equipment assets" },
  ];

  sections.push({
    id: "activation",
    label: "Company basics",
    description:
      "A short activation set so RateQuip knows your goals, what you do, and where you operate.",
    questions: universalQs.map((q) => {
      if (q.id === "universal.intent") {
        return {
          ...q,
          prompt: "What do you want to achieve on RateQuip?",
          inputType: "multi_select" as const,
          options: SETUP_INTENT_OPTIONS,
          whyAsked: "Select all that apply — most companies have more than one goal.",
        };
      }
      if (q.id === "universal.primary_industry") {
        return {
          ...q,
          inputType: "textarea" as const,
          options: undefined,
          prompt: "What does your company do?",
          whyAsked:
            "RateQuip is for buyers, suppliers, contractors, services and equipment — not only manufacturing. A short plain-language description is enough.",
          placeholder:
            "e.g. Inkjet coding & marking equipment; electrical contracting; cold-chain logistics; food packaging OEM",
        };
      }
      if (q.id === "universal.locations") {
        return {
          ...q,
          inputType: "textarea" as const,
          options: undefined,
          prompt: "Where do you operate or sell?",
          whyAsked:
            "Countries, states/regions, or cities you serve — used for matching and regional suggestions.",
          placeholder: "e.g. Australia (VIC, NSW); New Zealand; Southeast Asia",
        };
      }
      return q;
    }),
  });

  const roleQs = questionsForPack(ROLE_PACK[input.role])
    .slice(0, 4)
    .map((q) =>
      dqeToQuestion(
        q,
        `role_${input.role}`,
        `${input.role[0]!.toUpperCase()}${input.role.slice(1)} profile`,
        input.role === "supplier" ? "supplier" : "buyer",
      ),
    );

  if (roleQs.length > 0) {
    sections.push({
      id: `role_${input.role}`,
      label: `${input.role[0]!.toUpperCase()}${input.role.slice(1)} questions`,
      description: `Role-specific questions for a ${input.role} account.`,
      questions: roleQs,
    });
  }

  const groups = universalIndustrial.groups as Record<string, string[]>;
  for (const [groupId, prompts] of Object.entries(groups)) {
    sections.push({
      id: `ops_${groupId}`,
      label: GROUP_LABELS[groupId] ?? groupId,
      description:
        "Business operating profile questions from the Part 5 industrial interview pack.",
      questions: prompts.map((prompt, i) => ({
        id: `ops.${groupId}.${i + 1}`,
        prompt,
        groupId: `ops_${groupId}`,
        groupLabel: GROUP_LABELS[groupId] ?? groupId,
        required: i === 0,
        inputType: "textarea" as const,
        whyAsked:
          "Builds an evidence-ready operating profile (facilities, process, capacity, compliance) without inventing facts.",
        answerOwner: "either" as const,
        source: "operating_profile" as const,
      })),
    });
  }

  sections.push({
    id: `industry_${pack.industry}`,
    label: `${pack.industry.replace(/_/g, " ")} deep dive`,
    description:
      "Industry-pack critical questions. Unknown is allowed — RateQuip will not invent answers.",
    questions: pack.critical_questions.map((prompt, i) => ({
      id: `ind.${pack.industry}.${i + 1}`,
      prompt,
      groupId: `industry_${pack.industry}`,
      groupLabel: `${pack.industry.replace(/_/g, " ")} deep dive`,
      required: false,
      inputType: "textarea" as const,
      whyAsked:
        "Triggered by your sensed industry pack so matching and project adjacency stay grounded.",
      answerOwner: "either" as const,
      source: "industry_pack" as const,
    })),
  });

  // General / unscored packs have no critical questions — drop the empty deep dive.
  return sections.filter((s) => s.questions.length > 0);
}

export function buildSetupSuggestions(input: {
  role: CompanyRole;
  industryPack: string;
  answers: Record<string, string>;
}): SetupSuggestion[] {
  const pack = getSetupIndustryPack(input.industryPack);
  const suggestions: SetupSuggestion[] = pack.adjacent.slice(0, 8).map((label) => ({
    id: `sug-${slug(label)}`,
    label,
    reason: `Common adjacency for ${pack.industry.replace(/_/g, " ")} operations. Confirm before it influences matching.`,
    source: "industry_adjacency" as const,
    status: "pending" as const,
  }));

  const intentAnswer = input.answers["universal.intent"];
  if (hasIntent(intentAnswer, "create_rfq", "find_supplier")) {
    suggestions.unshift({
      id: "sug-buyer-rfq-path",
      label: "Prioritise RFQ and supplier shortlist tools",
      reason: "Inferred from your stated goals (find supplier / create RFQ).",
      source: "role_inference",
      status: "pending",
    });
  }
  if (hasIntent(intentAnswer, "publish_products") || input.role === "supplier") {
    suggestions.unshift({
      id: "sug-supplier-catalogue",
      label: "Prioritise catalogue and contractor/supplier profile tools",
      reason: "Inferred from supplier role or publish-products intent.",
      source: "role_inference",
      status: "pending",
    });
  }
  if (hasIntent(intentAnswer, "claim_company")) {
    suggestions.unshift({
      id: "sug-claim-company",
      label: "Prioritise company claim and verification steps",
      reason: "Inferred from claim-company intent.",
      source: "role_inference",
      status: "pending",
    });
  }
  if (hasIntent(intentAnswer, "find_work")) {
    suggestions.unshift({
      id: "sug-find-work",
      label: "Prioritise contractor / service opportunity matching",
      reason: "Inferred from find-work intent.",
      source: "role_inference",
      status: "pending",
    });
  }
  if (hasIntent(intentAnswer, "add_asset")) {
    suggestions.unshift({
      id: "sug-add-asset",
      label: "Prioritise asset registry and equipment profile tools",
      reason: "Inferred from add-asset intent.",
      source: "role_inference",
      status: "pending",
    });
  }

  return suggestions;
}

export function summariseAnswers(
  sections: SetupSection[],
  answers: Record<string, string>,
): Array<{ key: string; label: string; summary: string }> {
  return sections.map((section) => {
    const bits = section.questions
      .map((q) => {
        const raw = (answers[q.id] ?? "").trim();
        if (!raw) return null;
        const display =
          q.inputType === "multi_select"
            ? parseMultiAnswer(raw)
                .map((v) => v.replace(/_/g, " "))
                .join(", ")
            : raw;
        return `${q.prompt} → ${display}`;
      })
      .filter(Boolean) as string[];
    return {
      key: section.id,
      label: section.label,
      summary:
        bits.length > 0
          ? bits.slice(0, 3).join(" · ")
          : "No answers recorded in this section yet.",
    };
  });
}
