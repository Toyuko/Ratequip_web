import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find or add a company",
  description:
    "Search RateQuip’s directory before adding a company. Claim an unclaimed match or publish from public sources.",
};

export default function CompanySearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
