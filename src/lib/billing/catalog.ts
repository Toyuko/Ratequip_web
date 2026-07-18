import { demoPlans, type DemoPlan } from "@/lib/db/demo-data";

/** Credits charged when creating an RFQ. */
export const RFQ_CREDIT_COST = 25;

/** Free / inactive buyers: max RFQs per calendar month (credits still apply). */
export const FREE_TIER_MONTHLY_RFQ_LIMIT = 1;

/** Default marketplace commission in basis points (250 = 2.5%). */
export const DEFAULT_COMMISSION_BPS = 250;

export type CreditPack = {
  code: string;
  name: string;
  credits: number;
  priceUsd: number;
  highlighted?: boolean;
};

export const creditPacks: CreditPack[] = [
  {
    code: "credits-100",
    name: "Starter pack",
    credits: 100,
    priceUsd: 29,
  },
  {
    code: "credits-500",
    name: "Growth pack",
    credits: 500,
    priceUsd: 99,
    highlighted: true,
  },
  {
    code: "credits-2000",
    name: "Scale pack",
    credits: 2000,
    priceUsd: 299,
  },
];

export function getPlanByCode(code: string): DemoPlan | undefined {
  return demoPlans.find((p) => p.code === code);
}

export function listCatalogPlans(): DemoPlan[] {
  return demoPlans;
}

export function getCreditPackByCode(code: string): CreditPack | undefined {
  return creditPacks.find((p) => p.code === code);
}

export function listCreditPacks(): CreditPack[] {
  return creditPacks;
}

export function isPaidActivePlan(planCode: string | null | undefined, status: string | null | undefined) {
  if (status !== "active" && status !== "trialing") return false;
  if (!planCode || planCode === "buyer-free") return false;
  const plan = getPlanByCode(planCode);
  return Boolean(plan && plan.priceMonthly > 0);
}

export function billingAudiencePath(
  audience: DemoPlan["audience"] | string | undefined,
): "/dashboard/buyer/billing" | "/dashboard/supplier/billing" {
  return audience === "supplier"
    ? "/dashboard/supplier/billing"
    : "/dashboard/buyer/billing";
}

export function commissionAmountCents(quoteAmount: number, commissionBps: number) {
  return Math.round((quoteAmount * commissionBps) / 10000);
}
