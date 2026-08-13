import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Solutions",
  description: "RateQuip for buyers, suppliers, professionals, project owners, agencies and students.",
};

export default function SolutionsIndexPage() {
  redirect("/solutions/buyers");
}
