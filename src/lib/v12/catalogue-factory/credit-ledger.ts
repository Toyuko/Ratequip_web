/**
 * Module 68 CreditReservationLedger — TypeScript port.
 * Gated by ENTERPRISE_CATALOGUE_LEDGER_ENABLED for production path;
 * always available for unit/smoke when called directly.
 */

export type ReservationEntry = {
  key: string;
  reserved: number;
  consumed: number;
  released: number;
  status: "RESERVED" | "RECONCILED";
};

declare global {
  // eslint-disable-next-line no-var
  var __ratequipCatalogCreditLedger: Map<string, ReservationEntry> | undefined;
}

function ledger(): Map<string, ReservationEntry> {
  if (!globalThis.__ratequipCatalogCreditLedger) {
    globalThis.__ratequipCatalogCreditLedger = new Map();
  }
  return globalThis.__ratequipCatalogCreditLedger;
}

export function resetCatalogCreditLedger() {
  globalThis.__ratequipCatalogCreditLedger = new Map();
}

export function reserveCredits(key: string, maximum: number): ReservationEntry {
  const store = ledger();
  const existing = store.get(key);
  if (existing) return existing;
  const entry: ReservationEntry = {
    key,
    reserved: maximum,
    consumed: 0,
    released: 0,
    status: "RESERVED",
  };
  store.set(key, entry);
  return entry;
}

export function reconcileCredits(
  key: string,
  actual: number,
): ReservationEntry {
  const store = ledger();
  const entry = store.get(key);
  if (!entry) {
    throw new Error(`No reservation for key ${key}`);
  }
  if (entry.status === "RECONCILED") return entry;
  if (actual > entry.reserved) {
    throw new Error("actual exceeds authorised maximum");
  }
  entry.consumed = actual;
  entry.released = Math.round((entry.reserved - actual) * 100) / 100;
  entry.status = "RECONCILED";
  return entry;
}

export function getReservation(key: string): ReservationEntry | null {
  return ledger().get(key) ?? null;
}
