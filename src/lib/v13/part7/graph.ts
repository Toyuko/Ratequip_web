import taxonomyEdgesJson from "@/data/v12/taxonomy_edges_part1.json";
import capabilitiesJson from "@/data/v12/capabilities.json";
import { isGraphMatchEnabled } from "@/lib/v13/flags";
import { getIndustryKnowledgePack } from "@/lib/v13/part7/packs";

type Edge = {
  from_stable_key: string;
  to_stable_key: string;
  edge_type: string;
  confidence: string;
};

const edges = taxonomyEdgesJson as Edge[];

export function adjacentTaxonomyKeys(keys: string[], depth = 1): string[] {
  const out = new Set(keys);
  let frontier = [...keys];
  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const e of edges) {
      if (frontier.includes(e.from_stable_key) && !out.has(e.to_stable_key)) {
        out.add(e.to_stable_key);
        next.push(e.to_stable_key);
      }
      if (frontier.includes(e.to_stable_key) && !out.has(e.from_stable_key)) {
        out.add(e.from_stable_key);
        next.push(e.from_stable_key);
      }
    }
    frontier = next;
  }
  return [...out];
}

export function capabilityKeysForIndustry(industryPack: string): string[] {
  const pack = getIndustryKnowledgePack(industryPack);
  if (!pack) return [];
  const hints = new Set(
    [...pack.processHints, ...pack.adjacent, pack.id].map((s) =>
      s.toLowerCase().replace(/\s+/g, "_"),
    ),
  );
  const caps = capabilitiesJson as Array<{
    stable_key?: string;
    object_class?: string;
    id?: string;
  }>;
  const matched = caps.filter((c) => {
    const hay = `${c.stable_key ?? ""} ${c.object_class ?? ""}`.toLowerCase();
    return [...hints].some((h) => hay.includes(h) || h.includes(c.object_class ?? ""));
  });
  const keys = matched
    .map((c) => c.stable_key ?? c.id)
    .filter((x): x is string => Boolean(x));
  // Fallback: first design/manufacture capabilities for industrial packs
  if (keys.length === 0) {
    return caps
      .filter((c) => (c.stable_key ?? "").startsWith("cap."))
      .slice(0, 12)
      .map((c) => c.stable_key!)
      .filter(Boolean);
  }
  return keys.slice(0, 24);
}

/** Graph-aware feature boost for matching when flag enabled. */
export function graphProximityScore(input: {
  requirementKeys: string[];
  candidateKeys: string[];
}): { score: number; reasons: string[] } {
  if (!isGraphMatchEnabled()) {
    return { score: 0, reasons: [] };
  }
  const expanded = new Set(adjacentTaxonomyKeys(input.requirementKeys, 1));
  const hits = input.candidateKeys.filter((k) => expanded.has(k));
  if (hits.length === 0) return { score: 0, reasons: [] };
  const score = Math.min(1, hits.length / Math.max(input.requirementKeys.length, 1));
  return {
    score,
    reasons: [`graph_adjacency_hits:${hits.length}`],
  };
}
