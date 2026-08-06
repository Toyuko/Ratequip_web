import userTypePacks from "@/data/v13/user_type_packs.json";
import industryPacks from "@/data/v13/industry_packs.json";

export type UserTypePack = (typeof userTypePacks.packs)[number];
export type IndustryPack = (typeof industryPacks.packs)[number];

export function listUserTypePacks(): UserTypePack[] {
  return userTypePacks.packs;
}

export function listIndustryKnowledgePacks(): IndustryPack[] {
  return industryPacks.packs;
}

export function getUserTypePack(id: string): UserTypePack | undefined {
  return userTypePacks.packs.find((p) => p.id === id);
}

const INDUSTRY_ALIASES: Record<string, string> = {
  pet_food: "food",
  pharma_capping: "pharmaceutical",
  hand_sanitiser: "chemical",
  mining_assay: "chemical",
};

export function getIndustryKnowledgePack(id: string): IndustryPack | undefined {
  const resolved = INDUSTRY_ALIASES[id] ?? id;
  return industryPacks.packs.find((p) => p.id === resolved || p.id === id);
}

/** Map setup role + industry to Part 7 seed predicates. */
export function seedPredicatesForSetup(input: {
  role: string;
  industryPack: string;
}): Array<{ predicate: string; value: unknown; confidence: number }> {
  const rolePack = getUserTypePack(input.role) ?? getUserTypePack("buyer");
  const industry = getIndustryKnowledgePack(input.industryPack);
  const seeds: Array<{ predicate: string; value: unknown; confidence: number }> =
    [...(rolePack?.seedPredicates ?? [])];
  if (industry) {
    seeds.push({
      predicate: "industry.primary",
      value: industry.id,
      confidence: 0.9,
    });
    seeds.push({
      predicate: "industry.adjacent",
      value: industry.adjacent,
      confidence: 0.75,
    });
    seeds.push({
      predicate: "taxonomy.keys",
      value: industry.taxonomyKeys,
      confidence: 0.8,
    });
    seeds.push({
      predicate: "process.hints",
      value: industry.processHints,
      confidence: 0.7,
    });
  }
  return seeds;
}
