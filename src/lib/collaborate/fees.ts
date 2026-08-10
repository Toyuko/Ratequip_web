import { randomUUID } from "crypto";
import type { EngagementMode, FeeQuote } from "@/lib/collaborate/types";
import { money } from "@/lib/collaborate/money";

/** Versioned fee schedule — snapshots are immutable once accepted. */
export const FEE_SCHEDULE_VERSION = "collaborate-fees-v1";

type FeeRule = {
  mode: EngagementMode | "*";
  /** Basis points of gross (100 = 1%). */
  feeBps: number;
  chargedTo: FeeQuote["chargedTo"];
  minFeeMinor: number;
  maxFeeMinor?: number;
};

const RULES: FeeRule[] = [
  { mode: "SESSION", feeBps: 1500, chargedTo: "CONTRIBUTOR", minFeeMinor: 500 },
  { mode: "JOB", feeBps: 1200, chargedTo: "CONTRIBUTOR", minFeeMinor: 1000 },
  { mode: "POD", feeBps: 1000, chargedTo: "CONTRIBUTOR", minFeeMinor: 2000 },
  { mode: "VENTURE", feeBps: 0, chargedTo: "BUYER", minFeeMinor: 0 },
];

export type FeeQuoteInput = {
  engagementId: string;
  mode: EngagementMode;
  currency: string;
  grossMinor: number;
  /** Provider (PSP) fee estimate in minor units. */
  providerFeeMinor?: number;
  /** Progression / volume discount bps (never purchasable ranking). */
  discountBps?: number;
};

export function computeFeeQuote(input: FeeQuoteInput): FeeQuote {
  const rule =
    RULES.find((r) => r.mode === input.mode) ??
    RULES.find((r) => r.mode === "*")!;

  let feeBps = rule.feeBps;
  if (input.discountBps && input.discountBps > 0) {
    feeBps = Math.max(200, feeBps - input.discountBps);
  }

  let platformFeeMinor = Math.round((input.grossMinor * feeBps) / 10_000);
  platformFeeMinor = Math.max(platformFeeMinor, rule.minFeeMinor);
  if (rule.maxFeeMinor != null) {
    platformFeeMinor = Math.min(platformFeeMinor, rule.maxFeeMinor);
  }
  if (input.grossMinor === 0) platformFeeMinor = 0;

  const providerFeeMinor = input.providerFeeMinor ?? 0;
  const netToContributorMinor = Math.max(
    0,
    input.grossMinor - platformFeeMinor - providerFeeMinor,
  );

  const currency = input.currency.toUpperCase();
  return {
    feeQuoteId: `fq_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    engagementId: input.engagementId,
    scheduleVersion: FEE_SCHEDULE_VERSION,
    currency,
    grossMinor: input.grossMinor,
    platformFeeMinor,
    providerFeeMinor,
    netToContributorMinor,
    feeBps,
    chargedTo: rule.chargedTo,
    disclosure: {
      gross: money(currency, input.grossMinor),
      platformFee: money(currency, platformFeeMinor),
      providerFee: money(currency, providerFeeMinor),
      netToContributor: money(currency, netToContributorMinor),
    },
    createdAt: new Date().toISOString(),
  };
}

/** Fee must be disclosed before any acceptance action. */
export function assertFeeDisclosed(quote: FeeQuote | null | undefined) {
  if (!quote) {
    throw new Error("FeeQuote must be disclosed before acceptance");
  }
  if (
    quote.disclosure.gross.amountMinor !== quote.grossMinor ||
    quote.disclosure.platformFee.amountMinor !== quote.platformFeeMinor
  ) {
    throw new Error("FeeQuote disclosure does not match computed fees");
  }
}
