import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About RateQuip",
  description:
    "RateQuip is a B2B trust, procurement and equipment-lifecycle platform. Rate. Compare. Connect. Grow.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
