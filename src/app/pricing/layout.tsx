import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Buyer and supplier plans, RateQuip credit packs, and what 25 credits buys on an RFQ.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
