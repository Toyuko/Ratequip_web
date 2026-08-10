import type { Money, PayoutAllocation } from "@/lib/collaborate/types";

export type ProviderAccountRef = {
  providerName: string;
  providerVersion: string;
  providerRef: string;
};

export type HoldRef = ProviderAccountRef & {
  holdId: string;
  milestoneId: string;
  amount: Money;
  status: "HELD" | "CAPTURED" | "RELEASED" | "REFUNDED" | "FAILED";
};

export type CaptureRef = ProviderAccountRef & {
  captureId: string;
  holdId: string;
  amount: Money;
};

export type PayoutRef = ProviderAccountRef & {
  payoutId: string;
  captureId: string;
  actorId: string;
  amount: Money;
  status: "PENDING" | "SETTLED" | "FAILED";
};

export type RefundRef = ProviderAccountRef & {
  refundId: string;
  captureId: string;
  amount: Money;
  reason: string;
};

export type PayoutQuote = {
  quoteId: string;
  payoutRef: string;
  targetCurrency: string;
  method: string;
  rate: number;
  feeMinor: number;
  netMinor: number;
  expiresAt: string;
};

export type SettlementRef = ProviderAccountRef & {
  settlementId: string;
  payoutId: string;
  net: Money;
};

export type ProviderStatus = {
  ref: string;
  status: string;
  detail?: string;
};

export type FeeInstruction = {
  platformFeeMinor: number;
  currency: string;
};

/**
 * PaymentProvider abstraction (§9.4).
 * RateQuip never holds customer funds — the licensed PSP does.
 */
export interface PaymentProvider {
  readonly providerName: string;
  readonly providerVersion: string;

  onboardParty(
    partyId: string,
    kycPack: Record<string, unknown>,
  ): Promise<ProviderAccountRef>;

  createHold(
    milestoneId: string,
    amount: Money,
    buyerRef: string,
  ): Promise<HoldRef>;

  captureHold(holdRef: HoldRef): Promise<CaptureRef>;

  releaseSplit(
    captureRef: CaptureRef,
    allocations: PayoutAllocation[],
    feeInstruction: FeeInstruction,
  ): Promise<PayoutRef[]>;

  refund(
    captureRef: CaptureRef,
    amount: Money,
    reason: string,
  ): Promise<RefundRef>;

  quotePayout(
    payoutRef: PayoutRef,
    targetCurrency: string,
    method: string,
  ): Promise<PayoutQuote>;

  executePayout(
    payoutRef: PayoutRef,
    quoteId: string,
  ): Promise<SettlementRef>;

  getStatus(ref: string): Promise<ProviderStatus>;

  webhookHandler(event: Record<string, unknown>): Promise<
    { type: string; payload: Record<string, unknown> }[]
  >;
}

export type CorridorKey = {
  jurisdiction: string;
  currency: string;
  method: string;
  valueMinor: number;
};

/**
 * Selects a PSP by payee jurisdiction, currency, method and value.
 * Multi-provider from day one (§9.4).
 */
export class PayoutRouter {
  constructor(private providers: PaymentProvider[]) {
    if (providers.length === 0) {
      throw new Error("PayoutRouter requires at least one PaymentProvider");
    }
  }

  select(_corridor: CorridorKey): PaymentProvider {
    // v1: single corridor (Stripe/sandbox). Replace without rewriting callers.
    return this.providers[0]!;
  }

  list(): PaymentProvider[] {
    return [...this.providers];
  }
}
