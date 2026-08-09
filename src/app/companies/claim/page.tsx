import { Suspense } from "react";
import { AutomatedClaimForm } from "@/components/companies/claim/automated-claim-form";

export const metadata = { title: "Claim a company profile" };

export default async function ClaimCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; q?: string; token?: string }>;
}) {
  const params = await searchParams;
  const company = params.company?.trim() ?? "";
  const q = params.q?.trim() ?? "";

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-10 text-sm text-[var(--rq-muted)] sm:px-6">
          Loading claim…
        </div>
      }
    >
      <AutomatedClaimForm initialSlug={company} initialQuery={q} />
    </Suspense>
  );
}
