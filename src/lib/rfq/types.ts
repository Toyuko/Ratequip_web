export type RequirementPriority = "must" | "prefer" | "optional";

export type TechnicalRequirement = {
  text: string;
  priority: RequirementPriority;
};

export const SCOPE_OF_SUPPLY_OPTIONS = [
  "supply",
  "install",
  "commission",
  "validation",
  "training",
  "spares",
] as const;

export type ScopeOfSupply = (typeof SCOPE_OF_SUPPLY_OPTIONS)[number];

export const COMPLIANCE_OPTIONS = [
  "GMP / cGMP",
  "TGA",
  "FDA",
  "ISO",
  "Australian Standards",
  "OH&S / WHS",
] as const;

export function normalizeRequirements(
  value: unknown,
): TechnicalRequirement[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { text?: unknown; priority?: unknown };
      const text = typeof row.text === "string" ? row.text.trim() : "";
      if (!text) return null;
      const priority =
        row.priority === "prefer" || row.priority === "optional"
          ? row.priority
          : "must";
      return { text, priority } satisfies TechnicalRequirement;
    })
    .filter((item): item is TechnicalRequirement => Boolean(item));
}

export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}
