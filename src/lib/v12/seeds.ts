import capabilitiesJson from "@/data/v12/capabilities.json";
import questionDefsJson from "@/data/v12/question_definitions_part1.json";
import questionPacksJson from "@/data/v12/question_packs.json";
import rolesJson from "@/data/v12/roles.json";
import taxonomyEdgesJson from "@/data/v12/taxonomy_edges_part1.json";
import taxonomyNodesJson from "@/data/v12/taxonomy_nodes_part1.json";
import type { QuestionDefinition } from "@/lib/v12/dqe/resolver";

export type TaxonomyNode = {
  id: string;
  stable_key: string;
  scheme_id: string;
  node_type: string;
  preferred_label: string;
  parent_stable_key?: string;
  synonyms?: string;
  region?: string;
  status?: string;
};

export type TaxonomyEdge = {
  id?: string;
  from_stable_key: string;
  to_stable_key: string;
  edge_type: string;
};

export type CapabilitySeed = {
  id: string;
  stable_key?: string;
  label?: string;
  name?: string;
  category?: string;
};

export type RoleSeed = {
  id: string;
  name?: string;
  label?: string;
};

export type QuestionPack = {
  id: string;
  version: number;
  name: string;
  status: string;
};

export const taxonomyNodes = taxonomyNodesJson as TaxonomyNode[];
export const taxonomyEdges = taxonomyEdgesJson as TaxonomyEdge[];
export const questionPacks = questionPacksJson as QuestionPack[];
export const questionDefinitions = questionDefsJson as QuestionDefinition[];
export const capabilities = capabilitiesJson as CapabilitySeed[];
export const v12Roles = rolesJson as RoleSeed[];

export function listIndustries() {
  return taxonomyNodes.filter((n) => n.node_type === "industry");
}

export function listChildren(parentStableKey: string) {
  return taxonomyNodes.filter((n) => n.parent_stable_key === parentStableKey);
}

export function searchTaxonomy(q: string, limit = 40) {
  const query = q.trim().toLowerCase();
  if (!query) return taxonomyNodes.slice(0, limit);
  return taxonomyNodes
    .filter(
      (n) =>
        n.preferred_label.toLowerCase().includes(query) ||
        n.stable_key.toLowerCase().includes(query) ||
        (n.synonyms ?? "").toLowerCase().includes(query),
    )
    .slice(0, limit);
}

export function questionsForPack(packId: string): QuestionDefinition[] {
  const byPack = questionDefinitions.filter((q) => q.pack_id === packId);
  if (byPack.length > 0) {
    return byPack.map((q) => ({
      ...q,
      input_type: (q as { answer_type?: string }).answer_type,
      options: Array.isArray(q.options)
        ? q.options.map((o) =>
            typeof o === "string"
              ? { value: o, label: o.replace(/_/g, " ") }
              : o,
          )
        : undefined,
    })) as QuestionDefinition[];
  }
  return [];
}
