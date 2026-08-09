import { Suspense } from "react";
import { AutomatedClaimForm } from "@/components/companies/claim/automated-claim-form";

export const metadata = { title: "Claim a company profile" };

export default async function ClaimCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; token?: string }>;
}) {
  const params = await searchParams;
  const company = params.company?.trim() ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Claim a company profile
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--rq-slate)]">
        Confirm the company, tell us how you’re connected, then verify with the
        fastest method available. RateQuip automates access decisions — there is
        no staff document-review queue.
      </p>
      <Suspense
        fallback={
          <p className="mt-8 text-sm text-[var(--rq-muted)]">Loading claim…</p>
        }
      >
        <AutomatedClaimForm initialSlug={company} />
      </Suspense>
    </div>
  );
}
