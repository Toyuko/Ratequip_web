import Stripe from "stripe";
import { hasStripe } from "@/lib/config";

export function getStripe() {
  if (!hasStripe()) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export const planPriceEnvMap: Record<string, string | undefined> = {
  "buyer-premium": process.env.STRIPE_PRICE_BUYER_PREMIUM,
  "supplier-silver": process.env.STRIPE_PRICE_SUPPLIER_SILVER,
  "supplier-gold": process.env.STRIPE_PRICE_SUPPLIER_GOLD,
  "supplier-platinum": process.env.STRIPE_PRICE_SUPPLIER_PLATINUM,
};
