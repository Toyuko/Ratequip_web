import { randomUUID } from "crypto";
import type {
  Money,
  PayoutAllocation,
} from "@/lib/collaborate/types";
import type {
  CaptureRef,
  FeeInstruction,
  HoldRef,
  PaymentProvider,
  PayoutQuote,
  PayoutRef,
  ProviderAccountRef,
  ProviderStatus,
  RefundRef,
  SettlementRef,
} from "@/lib/collaborate/payment-provider";

/**
 * Sandbox PaymentProvider for Phase 0.
 * Simulates PSP-held escrow without touching RateQuip's balance sheet.
 * Replace with Stripe Connect / licensed PSP when corridor is ready.
 */
export class SandboxPaymentProvider implements PaymentProvider {
  readonly providerName = "sandbox";
  readonly providerVersion = "1.0.0";

  private holds = new Map<string, HoldRef>();
  private captures = new Map<string, CaptureRef>();
  private payouts = new Map<string, PayoutRef>();

  async onboardParty(
    partyId: string,
    _kycPack: Record<string, unknown>,
  ): Promise<ProviderAccountRef> {
    return {
      providerName: this.providerName,
      providerVersion: this.providerVersion,
      providerRef: `acct_${partyId.slice(0, 12)}`,
    };
  }

  async createHold(
    milestoneId: string,
    amount: Money,
    buyerRef: string,
  ): Promise<HoldRef> {
    const holdId = `hold_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const hold: HoldRef = {
      providerName: this.providerName,
      providerVersion: this.providerVersion,
      providerRef: buyerRef,
      holdId,
      milestoneId,
      amount,
      status: "HELD",
    };
    this.holds.set(holdId, hold);
    return hold;
  }

  async captureHold(holdRef: HoldRef): Promise<CaptureRef> {
    const hold = this.holds.get(holdRef.holdId);
    if (!hold || hold.status !== "HELD") {
      throw new Error("Hold not available for capture");
    }
    hold.status = "CAPTURED";
    const capture: CaptureRef = {
      providerName: this.providerName,
      providerVersion: this.providerVersion,
      providerRef: hold.providerRef,
      captureId: `cap_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
      holdId: hold.holdId,
      amount: hold.amount,
    };
    this.captures.set(capture.captureId, capture);
    return capture;
  }

  async releaseSplit(
    captureRef: CaptureRef,
    allocations: PayoutAllocation[],
    feeInstruction: FeeInstruction,
  ): Promise<PayoutRef[]> {
    const capture = this.captures.get(captureRef.captureId);
    if (!capture) throw new Error("Capture not found");

    const allocSum = allocations.reduce((s, a) => s + a.amountMinor, 0);
    if (allocSum + feeInstruction.platformFeeMinor > capture.amount.amountMinor) {
      throw new Error("Split exceeds captured amount");
    }

    const refs: PayoutRef[] = [];
    for (const alloc of allocations) {
      const payout: PayoutRef = {
        providerName: this.providerName,
        providerVersion: this.providerVersion,
        providerRef: capture.providerRef,
        payoutId: `po_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
        captureId: capture.captureId,
        actorId: alloc.actorId,
        amount: {
          currency: alloc.currency,
          amountMinor: alloc.amountMinor,
        },
        status: "SETTLED",
      };
      this.payouts.set(payout.payoutId, payout);
      refs.push(payout);
    }
    return refs;
  }

  async refund(
    captureRef: CaptureRef,
    amount: Money,
    reason: string,
  ): Promise<RefundRef> {
    return {
      providerName: this.providerName,
      providerVersion: this.providerVersion,
      providerRef: captureRef.providerRef,
      refundId: `rf_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
      captureId: captureRef.captureId,
      amount,
      reason,
    };
  }

  async quotePayout(
    payoutRef: PayoutRef,
    targetCurrency: string,
    method: string,
  ): Promise<PayoutQuote> {
    return {
      quoteId: `pq_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      payoutRef: payoutRef.payoutId,
      targetCurrency,
      method,
      rate: 1,
      feeMinor: 0,
      netMinor: payoutRef.amount.amountMinor,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    };
  }

  async executePayout(
    payoutRef: PayoutRef,
    quoteId: string,
  ): Promise<SettlementRef> {
    return {
      providerName: this.providerName,
      providerVersion: this.providerVersion,
      providerRef: payoutRef.providerRef,
      settlementId: `stl_${quoteId}`,
      payoutId: payoutRef.payoutId,
      net: payoutRef.amount,
    };
  }

  async getStatus(ref: string): Promise<ProviderStatus> {
    if (this.holds.has(ref)) {
      return { ref, status: this.holds.get(ref)!.status };
    }
    if (this.captures.has(ref)) {
      return { ref, status: "CAPTURED" };
    }
    if (this.payouts.has(ref)) {
      return { ref, status: this.payouts.get(ref)!.status };
    }
    return { ref, status: "UNKNOWN" };
  }

  async webhookHandler(
    event: Record<string, unknown>,
  ): Promise<{ type: string; payload: Record<string, unknown> }[]> {
    return [{ type: "sandbox.webhook", payload: event }];
  }
}

let singleton: SandboxPaymentProvider | null = null;

export function getSandboxPaymentProvider(): SandboxPaymentProvider {
  if (!singleton) singleton = new SandboxPaymentProvider();
  return singleton;
}

export function resetSandboxPaymentProvider() {
  singleton = new SandboxPaymentProvider();
}
