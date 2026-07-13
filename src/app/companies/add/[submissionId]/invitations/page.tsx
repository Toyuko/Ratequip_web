"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListingSubmission } from "@/lib/actions/organic-growth";
import type { ListingSubmissionDraft, PublishedInvitation } from "@/lib/organic-growth/types";

type SafeSubmission = ListingSubmissionDraft & {
  invitations?: PublishedInvitation[];
};

export default function ManageInvitationsPage() {
  const params = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<SafeSubmission | null>(null);

  useEffect(() => {
    void (async () => {
      const result = await getListingSubmission(params.submissionId);
      if (result.ok) setSubmission(result.submission as SafeSubmission);
    })();
  }, [params.submissionId]);

  if (!submission) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-[var(--rq-muted)]">
        Loading invitations…
      </div>
    );
  }

  const invitations = submission.invitations ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Manage claim invitations
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Track delivery for {submission.companyName}. Resend limits and
        suppression rules from v10.1 apply in production.
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--rq-border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--rq-surface)] text-[var(--rq-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Recipient</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3 font-medium">Claim link</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <tr key={inv.id} className="border-t border-[var(--rq-border)]">
                <td className="px-4 py-3">{inv.emailMasked}</td>
                <td className="px-4 py-3">{inv.role || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="muted">{inv.state}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/claim/${inv.claimToken}`}
                    className="text-orange-600 hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {invitations.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-[var(--rq-muted)]"
                >
                  No invitations for this submission.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Button asChild variant="outline" className="mt-6">
        <Link href={`/companies/add/success/${submission.id}`}>Back</Link>
      </Button>
    </div>
  );
}
