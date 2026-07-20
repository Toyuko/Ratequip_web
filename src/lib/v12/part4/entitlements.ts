import { createHash } from "node:crypto";
import type { Result } from "@/lib/v12/part4/types";

export type UsagePreview = {
  id: string;
  actionClass: string;
  unit: string;
  low: number;
  high: number;
  remaining: number;
  resetAt?: string;
  warnings: string[];
  policyVersion: string;
  confirmed?: boolean;
  confirmedAt?: string;
  confirmedBy?: string;
};

export type LedgerEntry = {
  id: string;
  correlationId: string;
  previewId?: string;
  quantity: number;
  unit: string;
  entryType: "consume" | "reverse" | "goodwill";
  immutableHash: string;
  createdAt: string;
  actionClass: string;
};

/** Feature 145 — transparent usage preview before chargeable work. */
export function createUsagePreview(
  input: Omit<UsagePreview, "warnings" | "id"> & { id?: string },
): UsagePreview {
  const warnings: string[] = [];
  if (input.high > input.remaining) warnings.push("ESTIMATE_EXCEEDS_REMAINING");
  if (input.low < 0 || input.high < input.low) {
    throw new Error("INVALID_ESTIMATE");
  }
  return {
    id: input.id ?? `prev-${Date.now()}`,
    actionClass: input.actionClass,
    unit: input.unit,
    low: input.low,
    high: input.high,
    remaining: input.remaining,
    resetAt: input.resetAt,
    policyVersion: input.policyVersion,
    warnings,
  };
}

export class UsageLedger {
  private entries: LedgerEntry[] = [];

  append(e: LedgerEntry): Result<LedgerEntry> {
    if (this.entries.some((x) => x.id === e.id)) {
      return { ok: false, code: "DUPLICATE_LEDGER_ID", message: e.id };
    }
    this.entries.push(Object.freeze({ ...e }));
    return { ok: true, value: e };
  }

  list(): readonly LedgerEntry[] {
    return this.entries;
  }
}

export function hashLedgerPayload(payload: Record<string, unknown>) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

/** Action classes that require preview confirmation (ADR-0041). */
export const CHARGEABLE_ACTIONS = new Set([
  "intelligence.urs_analysis",
  "intelligence.publish_scope",
  "matching.sponsored_boost",
  "rfq.publish",
  "catalog.import_process",
]);
