import type { Money } from "@/lib/collaborate/types";

export function money(currency: string, amountMinor: number): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("Money amounts must be integer minor units");
  }
  if (amountMinor < 0) {
    throw new Error("Money amounts must be non-negative");
  }
  return { currency: currency.toUpperCase(), amountMinor };
}

export function formatMoney(m: Money, locale = "en-AU"): string {
  const major = m.amountMinor / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: m.currency,
    }).format(major);
  } catch {
    return `${m.currency} ${(m.amountMinor / 100).toFixed(2)}`;
  }
}

export function assertSameCurrency(a: Money, b: Money) {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.currency, a.amountMinor + b.amountMinor);
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.currency, a.amountMinor - b.amountMinor);
}

export function sumAllocations(
  allocations: { amountMinor: number; currency: string }[],
  currency: string,
): Money {
  let total = 0;
  for (const a of allocations) {
    if (a.currency !== currency) {
      throw new Error("Allocation currency mismatch");
    }
    total += a.amountMinor;
  }
  return money(currency, total);
}
