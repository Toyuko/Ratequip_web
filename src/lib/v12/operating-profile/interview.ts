/**
 * Part 5 company-setup interview builder.
 * Combines Part 1 DQE packs with Part 5 operating-profile + industry packs.
 * Deterministic — no live LLM. Framing is assistant-style for the wizard UI.
 */
import universalIndustrial from "@/data/v12/part5/universal_industrial.v1.json";
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
  pet_food: petFood as IndustryPack,
  pharma_capping: pharmaCapping as IndustryPack,
  hand_sanitiser: handSanitiser as IndustryPack,
  mining_assay: miningAssay as IndustryPack,
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
  return Object.entries(INDUSTRY_PACKS).map(([id, pack]) => ({
    id,
    label: pack.industry.replace(/_/g, " "),
    version: pack.version,
    adjacentCount: pack.adjacent.length,
  }));
}

export function getSetupIndustryPack(id: string): IndustryPack {
  return INDUSTRY_PACKS[id] ?? INDUSTRY_PACKS.pet_food!;
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
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
  if (answerType === "single_select" || opts.length > 0) inputType = "single_select";
  if (answerType === "multi_select") inputType = "multi_select";
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
      "Helps RateQuip route you to the right workspace and matching rules for your role.",
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

  // Intent options stay selectable; industry/locations become free text when options empty
  sections.push({
    id: "activation",
    label: "Company basics",
    description:
      "A short activation set so RateQuip knows your intent, industry focus and operating footprint.",
    questions: universalQs.map((q) => {
      if (q.id === "universal.primary_industry" || q.id === "universal.locations") {
        return {
          ...q,
          inputType: "textarea" as const,
          options: undefined,
          prompt:
            q.id === "universal.primary_industry"
              ? "Describe your primary industry or manufacturing focus."
              : "List your main operating sites or service regions.",
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
        "Triggered by your selected industry pack so matching and project adjacency stay grounded.",
      answerOwner: "either" as const,
      source: "industry_pack" as const,
    })),
  });

  return sections;
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

  const intent = input.answers["universal.intent"];
  if (intent === "create_rfq" || intent === "find_supplier") {
    suggestions.unshift({
      id: "sug-buyer-rfq-path",
      label: "Prioritise RFQ and supplier shortlist tools",
      reason: "Inferred from your stated first goal.",
      source: "role_inference",
      status: "pending",
    });
  }
  if (intent === "publish_products" || input.role === "supplier") {
    suggestions.unshift({
      id: "sug-supplier-catalogue",
      label: "Prioritise catalogue and contractor/supplier profile tools",
      reason: "Inferred from supplier role or publish-products intent.",
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
        const a = (answers[q.id] ?? "").trim();
        return a ? `${q.prompt} → ${a}` : null;
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
