"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AddCompanyWizardShell } from "@/components/organic-growth/wizard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListingSubmission } from "@/lib/actions/organic-growth";
import type { ListingSubmissionDraft, PublishedInvitation } from "@/lib/organic-growth/types";

type SafeSubmission = ListingSubmissionDraft & {
  invitations?: PublishedInvitation[];
};

export default function AddSuccessPage() {
  const params = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<SafeSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const result = await getListingSubmission(params.submissionId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSubmission(result.submission as SafeSubmission);
    })();
  }, [params.submissionId]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-red-600">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/companies/search">Add a company</Link>
        </Button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-[var(--rq-muted)]">
        Loading…
      </div>
    );
  }

  const invitations = submission.invitations ?? [];
  const slug = submission.publishedCompanySlug;

  return (
    <AddCompanyWizardShell
      step="success"
      title="Company created"
      description="The unclaimed profile is live. Delivery does not mean the company has claimed the profile yet."
      submissionId={submission.id}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="warning">Unclaimed profile</Badge>
          {slug ? (
            <Link
              href={`/companies/${slug}`}
              className="font-semibold text-orange-600 hover:underline"
            >
              {submission.companyName}
            </Link>
          ) : (
            <span className="font-semibold">{submission.companyName}</span>
          )}
        </div>

        <section>
          <h2 className="font-semibold text-[var(--rq-ink)]">Invitation status</h2>
          {invitations.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--rq-muted)]">
              No claim invitations were queued.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--rq-border)] px-3 py-2 text-sm"
                >
                  <span>
                    {inv.emailMasked}
                    {inv.role ? ` · ${inv.role}` : ""}
                  </span>
                  <Badge variant={inv.state === "sent" ? "success" : "muted"}>
                    {inv.state}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-sm text-[var(--rq-slate)]">
          Referral eligibility is recorded, but rewards stay pending until a
          qualifying claim event is verified. No reward is promised at this step.
        </p>

        <div className="flex flex-wrap gap-3">
          {slug ? (
            <Button asChild>
              <Link href={`/companies/${slug}`}>View profile</Link>
            </Button>
          ) : null}
          {slug ? (
            <Button asChild variant="outline">
              <Link href={`/reviews/new?company=${slug}`}>Leave a review</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href={`/companies/add/${submission.id}/invitations`}>
              Manage invitations
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/companies/search">Add another company</Link>
          </Button>
        </div>
      </div>
    </AddCompanyWizardShell>
  );
}
