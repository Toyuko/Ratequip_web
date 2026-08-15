"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AddCompanyWizardShell } from "@/components/organic-growth/wizard-shell";
import { useListingDraft } from "@/components/organic-growth/use-listing-draft";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateListingSubmission } from "@/lib/actions/organic-growth";
import {
  INTENDED_PURPOSES,
  RELATIONSHIPS,
  type IntendedPurpose,
  type Relationship,
} from "@/lib/organic-growth/types";

const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  owner_representative: "Owner, director or authorised representative",
  customer_buyer: "Customer / buyer",
  supplier: "Supplier",
  project_participant: "Project participant",
  employee_former: "Employee / former employee",
  industry_peer: "Industry peer",
  research: "Discovered in research",
  other: "Other",
};

const PURPOSE_LABELS: Record<IntendedPurpose, string> = {
  claim_own_company: "Claim and manage my company profile",
  leave_review: "Leave a review",
  include_rfq: "Include in an RFQ",
  invite_project: "Invite to a project",
  watchlist: "Save to watchlist",
  directory_coverage: "Correct directory coverage",
  other: "Other",
};

export default function AddRelationshipPage() {
  const router = useRouter();
  const { draft, ready, save } = useListingDraft();
  const [relationship, setRelationship] = useState<Relationship>("research");
  const [purpose, setPurpose] = useState<IntendedPurpose>("directory_coverage");
  const [conflictDeclared, setConflictDeclared] = useState(false);
  const [pending, startTransition] = useTransition();

  const selfClaim = draft?.listingIntent === "self_claim";

  useEffect(() => {
    if (!ready) return;
    if (!draft) {
      router.replace("/companies/search");
      return;
    }
    if (draft.listingIntent === "self_claim") {
      setRelationship(draft.relationship ?? "owner_representative");
      setPurpose(draft.intendedPurpose ?? "claim_own_company");
      setConflictDeclared(true);
      return;
    }
    if (draft.relationship) setRelationship(draft.relationship);
    if (draft.intendedPurpose) setPurpose(draft.intendedPurpose);
    setConflictDeclared(draft.conflictDeclared);
  }, [ready, draft, router]);

  if (!ready || !draft) return null;

  function onContinue() {
    const current = draft;
    if (!current) return;
    startTransition(async () => {
      const result = await updateListingSubmission({
        ...current,
        relationship,
        intendedPurpose: purpose,
        conflictDeclared: selfClaim ? true : conflictDeclared,
        skipReview: true,
        status: "review_skipped",
      });
      if (!result.ok) return;
      save(result.submission as never);
      router.push(`/companies/add/confirm?submissionId=${current.id}`);
    });
  }

  return (
    <AddCompanyWizardShell
      step="relationship"
      title={selfClaim ? "Confirm your role" : "Relationship and purpose"}
      description={
        selfClaim
          ? "You’re claiming this profile for your company. Confirm how you’re connected — verification happens after publish."
          : "Tell us why you are adding this company. You can skip writing a review for now."
      }
      submissionId={draft.id}
    >
      <div className="space-y-4">
        {selfClaim ? (
          <p className="rounded-md border border-[var(--rq-border)] bg-[var(--rq-surface)] px-3 py-2 text-sm text-[var(--rq-slate)]">
            After you publish, you’ll verify with a company email, published
            phone, website control, or admin approval — same as claiming an
            existing RateQuip profile.
          </p>
        ) : null}
        <div>
          <Label htmlFor="relationship">Your relationship</Label>
          <select
            id="relationship"
            className="mt-1 h-11 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as Relationship)}
          >
            {(selfClaim
              ? (["owner_representative", "employee_former", "other"] as const)
              : RELATIONSHIPS
            ).map((r) => (
              <option key={r} value={r}>
                {RELATIONSHIP_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        {!selfClaim ? (
          <div>
            <Label htmlFor="purpose">Intended purpose</Label>
            <select
              id="purpose"
              className="mt-1 h-11 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as IntendedPurpose)}
            >
              {INTENDED_PURPOSES.filter((p) => p !== "claim_own_company").map(
                (p) => (
                  <option key={p} value={p}>
                    {PURPOSE_LABELS[p]}
                  </option>
                ),
              )}
            </select>
          </div>
        ) : null}
        {!selfClaim ? (
          <label className="flex items-start gap-3 text-sm text-[var(--rq-slate)]">
            <input
              type="checkbox"
              className="mt-1"
              checked={conflictDeclared}
              onChange={(e) => setConflictDeclared(e.target.checked)}
            />
            <span>
              I declare any conflict of interest (employee, competitor, paid
              representative or related party) where applicable.
            </span>
          </label>
        ) : (
          <p className="text-sm text-[var(--rq-muted)]">
            Purpose: {PURPOSE_LABELS.claim_own_company}
          </p>
        )}
        {!selfClaim ? (
          <p className="rounded-md bg-[var(--rq-surface)] p-3 text-sm text-[var(--rq-muted)]">
            Review drafting is optional in this Phase 1 slice. You can leave a
            review after the unclaimed profile is created.
          </p>
        ) : null}
        <Button onClick={onContinue} disabled={pending}>
          {pending ? "Saving…" : "Continue to confirmation"}
        </Button>
      </div>
    </AddCompanyWizardShell>
  );
}
