import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post an RFQ",
  description:
    "Create a structured RateQuip requirement. Buyer Free includes one RFQ per month; additional RFQs cost 25 credits.",
};

export default function NewRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
