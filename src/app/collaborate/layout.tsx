import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collaborate",
  description:
    "Book remote experts, post paid jobs and work with industrial specialists on RateQuip Collaborate.",
};

export default function CollaborateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
