export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [k: string]: Json };

export interface RuleContext {
  roles: string[];
  answers: Record<string, Json>;
  taxonomy: Set<string>;
  permissions: Set<string>;
  jurisdiction?: string;
}

export function evaluateRule(rule: unknown, ctx: RuleContext): boolean {
  if (rule == null || (typeof rule === "object" && Object.keys(rule as object).length === 0)) {
    return true;
  }
  const r = rule as Record<string, unknown>;
  if ("const" in r) return Boolean(r.const);
  if (r.and) return (r.and as unknown[]).every((x) => evaluateRule(x, ctx));
  if (r.or) return (r.or as unknown[]).some((x) => evaluateRule(x, ctx));
  if (r.not) return !evaluateRule(r.not, ctx);
  if (r.roleIn) {
    return (r.roleIn as string[]).some((role) => ctx.roles.includes(role));
  }
  if (r.exists) {
    const key = r.exists as string;
    return ctx.answers[key] !== undefined && ctx.answers[key] !== null;
  }
  if (r.eq) {
    const [key, val] = r.eq as [string, Json];
    return ctx.answers[key] === val;
  }
  if (r.selectedTaxonomy) {
    return ctx.taxonomy.has(r.selectedTaxonomy as string);
  }
  if (r.hasPermission) {
    return ctx.permissions.has(r.hasPermission as string);
  }
  if (r.jurisdictionIs) {
    return ctx.jurisdiction === r.jurisdictionIs;
  }
  // Unknown operators default to visible for seed packs with incomplete rules
  return true;
}
