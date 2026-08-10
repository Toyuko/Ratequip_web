import { randomUUID } from "crypto";
import type {
  ReputationDimension,
  ReputationEvent,
  ReputationEventType,
  ReputationProjection,
} from "@/lib/collaborate/types";

const MIN_SAMPLE = 3;

/**
 * Reputation is earned, never purchased, never authored (§1.2 / §11).
 * Every event must link to a transaction or system-observed fact.
 */
export function createReputationEvent(input: {
  partyId: string;
  engagementId: string;
  type: ReputationEventType;
  transactionRef: string;
  milestoneId?: string;
  counterpartyId?: string;
  valueMinor?: number;
  currency?: string;
  attribution?: string;
}): ReputationEvent {
  if (!input.transactionRef) {
    throw new Error("ReputationEvent requires a linked transactionRef");
  }
  return {
    reputationEventId: `rep_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    partyId: input.partyId,
    engagementId: input.engagementId,
    milestoneId: input.milestoneId,
    counterpartyId: input.counterpartyId,
    type: input.type,
    valueMinor: input.valueMinor,
    currency: input.currency,
    occurredAt: new Date().toISOString(),
    attribution: input.attribution,
    transactionRef: input.transactionRef,
  };
}

export function projectReputation(
  partyId: string,
  events: ReputationEvent[],
): ReputationProjection {
  const mine = events.filter((e) => e.partyId === partyId);
  const dimensions: ReputationProjection["dimensions"] = {};

  const accepted = mine.filter((e) => e.type === "MILESTONE_ACCEPTED" || e.type === "SESSION_COMPLETED");
  const late = mine.filter((e) => e.type === "MILESTONE_LATE");
  const revisions = mine.filter((e) => e.type === "REVISION_REQUESTED");
  const disputes = mine.filter((e) => e.type === "DISPUTE_UPHELD_AGAINST");
  const noShows = mine.filter((e) => e.type === "NO_SHOW");

  setDim(dimensions, "on_time_delivery", accepted.length, late.length);
  setDim(dimensions, "work_quality", accepted.length, revisions.length);
  setDim(
    dimensions,
    "dispute_cancellation",
    accepted.length + disputes.length,
    disputes.length + noShows.length,
  );
  setDim(dimensions, "technical_capability", accepted.length, 0);

  return {
    partyId,
    dimensions,
    updatedAt: new Date().toISOString(),
  };
}

function setDim(
  dims: ReputationProjection["dimensions"],
  key: ReputationDimension,
  positive: number,
  negative: number,
) {
  const sampleSize = positive + negative;
  if (sampleSize < MIN_SAMPLE) return;
  const score = sampleSize === 0 ? 0 : Math.round((100 * positive) / sampleSize);
  dims[key] = { score, sampleSize, trend: "FLAT" };
}
