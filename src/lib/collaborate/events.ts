import { createHash, randomUUID } from "crypto";
import type { DomainEvent } from "@/lib/collaborate/types";

export function hashPayload(payload: Record<string, unknown>): string {
  return createHash("sha256")
    .update(JSON.stringify(payload, Object.keys(payload).sort()))
    .digest("hex");
}

export function appendDomainEvent(input: {
  engagementId: string;
  actingAsPartyId: string;
  actorId?: string;
  type: string;
  payload: Record<string, unknown>;
  prevEvent: DomainEvent | null;
}): DomainEvent {
  const eventId = `evt_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const payloadHash = hashPayload(input.payload);
  const prevEventId = input.prevEvent?.eventId ?? null;
  const chainMaterial = [
    prevEventId ?? "GENESIS",
    eventId,
    input.engagementId,
    input.actingAsPartyId,
    input.type,
    payloadHash,
  ].join("|");
  const chainHash = createHash("sha256").update(chainMaterial).digest("hex");

  return {
    eventId,
    engagementId: input.engagementId,
    actorId: input.actorId,
    actingAsPartyId: input.actingAsPartyId,
    type: input.type,
    payload: input.payload,
    payloadHash,
    occurredAt: new Date().toISOString(),
    prevEventId,
    chainHash,
  };
}

export function verifyEventChain(events: DomainEvent[]): {
  ok: boolean;
  error?: string;
} {
  let prev: DomainEvent | null = null;
  for (const ev of events) {
    if (prev === null) {
      if (ev.prevEventId !== null) {
        return { ok: false, error: `First event has prevEventId ${ev.prevEventId}` };
      }
    } else if (ev.prevEventId !== prev.eventId) {
      return {
        ok: false,
        error: `Broken chain at ${ev.eventId}: expected prev ${prev.eventId}`,
      };
    }
    const expectedPayload = hashPayload(ev.payload);
    if (expectedPayload !== ev.payloadHash) {
      return { ok: false, error: `Payload tamper at ${ev.eventId}` };
    }
    prev = ev;
  }
  return { ok: true };
}
