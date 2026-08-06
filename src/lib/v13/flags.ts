/**
 * Enterprise overlay feature flags.
 * Defaults are OFF so Phase 2 acceptance never depends on V13.
 */

function envFlag(name: string): boolean {
  const v = process.env[name];
  if (v == null || v === "") return false;
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "on";
}

export function isPart7Enabled(): boolean {
  return envFlag("ENTERPRISE_PART7_ENABLED");
}

export function isGraphMatchEnabled(): boolean {
  return envFlag("ENTERPRISE_GRAPH_MATCH_ENABLED");
}

export function isCatalogueLedgerEnabled(): boolean {
  return envFlag("ENTERPRISE_CATALOGUE_LEDGER_ENABLED");
}

export function enterpriseFlagSnapshot() {
  return {
    part7: isPart7Enabled(),
    graphMatch: isGraphMatchEnabled(),
    catalogueLedger: isCatalogueLedgerEnabled(),
  };
}
