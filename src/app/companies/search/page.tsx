"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CaptureReferralRef } from "@/components/referrals/capture-referral-ref";
import { AddCompanyWizardShell } from "@/components/organic-growth/wizard-shell";
import { CompanyDiscoverySearch } from "@/components/companies/company-discovery-search";

function SearchForm() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialCountry = params.get("country") ?? "";
  const fromClaim = params.get("from") === "claim";

  return (
    <AddCompanyWizardShell
      step="search"
      title="Search before adding"
      description={
        fromClaim
          ? "Find an existing RateQuip company to claim, or add it from public sources first — we’ll return you to the claim wizard after publish."
          : "Search RateQuip’s directory and the open web. Claim an unclaimed match, or add a new company from public sources and review before publishing."
      }
    >
      <CaptureReferralRef />
      <CompanyDiscoverySearch
        intent="both"
        initialQuery={initialQ}
        initialCountry={initialCountry}
        returnToClaimAfterPublish={fromClaim}
        autoSearch={initialQ.trim().length >= 2}
      />
    </AddCompanyWizardShell>
  );
}

export default function CompaniesSearchPage() {
  return (
    <Suspense>
      <SearchForm />
    </Suspense>
  );
}
