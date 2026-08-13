import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the RateQuip team about the industrial marketplace, RFQs and supplier claims.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
