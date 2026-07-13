"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AddCompanyWizardShell } from "@/components/organic-growth/wizard-shell";
import {
  clearLocalDraft,
  useListingDraft,
} from "@/components/organic-growth/use-listing-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { publishListingSubmission } from "@/lib/actions/organic-growth";
import type { DisclosurePreference } from "@/lib/organic-growth/types";

export default function AddConfirmPage() {
  const router = useRouter();
  const { draft, ready, save } = useListingDraft();
  const [accepted, setAccepted] = useState(false);
  const [disclosure, setDisclosure] =
    useState<DisclosurePreference>("anonymous_ratequip_user");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!ready) return;
    if (!draft) {
      router.replace("/companies/search");
      return;
    }
    setDisclosure(draft.disclosurePreference);
    setAccepted(draft.declarationsAccepted);
  }, [ready, draft, router]);

  if (!ready || !draft) return null;

  const recipients = draft.skipContacts
    ? []
    : draft.contacts.filter((c) => c.sendAfterPublish !== false);
  const hasRecipients = recipients.length > 0;

  function onPublish() {
    if (!accepted) {
      setError("Accept the declarations before publishing.");
      return;
    }
    const current = draft;
    if (!current) return;
    startTransition(async () => {
      const result = await publishListingSubmission({
        id: current.id,
        declarationsAccepted: true,
        disclosurePreference: disclosure,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      save(result.submission as never);
      clearLocalDraft();
      writePublishedId(result.submission.id);
      router.push(`/companies/add/success/${result.submission.id}`);
    });
  }

  return (
    <AddCompanyWizardShell
      step="confirm"
      title="Review and publish"
      description="Confirm the public profile facts, private recipients and declarations. Retry-safe: double submit creates one company only."
      submissionId={draft.id}
    >
      <div className="space-y-6">
        <section>
          <h2 className="font-semibold text-[var(--rq-ink)]">Public profile preview</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Name" value={draft.companyName} />
            <Row label="Website" value={draft.websiteUrl || "—"} />
            <Row
              label="Location"
              value={`${draft.locality ?? "—"}, ${draft.countryCode ?? "—"}`}
            />
            <Row label="Types" value={draft.companyTypes.join(", ")} />
            <Row label="Categories" value={draft.categories.join(", ")} />
          </dl>
          <Badge variant="warning" className="mt-3">
            Will publish as Unclaimed
          </Badge>
        </section>

        <section>
          <h2 className="font-semibold text-[var(--rq-ink)]">
            Private referral contacts
          </h2>
          {hasRecipients ? (
            <ul className="mt-3 space-y-2 text-sm">
              {recipients.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--rq-border)] px-3 py-2"
                >
                  <span>
                    {c.emailMasked || c.email}{" "}
                    {c.role ? <span className="text-[var(--rq-muted)]">· {c.role}</span> : null}
                  </span>
                  <Badge
                    variant={
                      c.sendEligibility === "eligible" ? "success" : "warning"
                    }
                  >
                    {c.sendEligibility}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--rq-muted)]">
              No claim invitations will be sent.
            </p>
          )}
        </section>

        <section className="rounded-md bg-[var(--rq-surface)] p-4 text-sm">
          <p className="font-semibold text-[var(--rq-ink)]">Credit summary</p>
          <p className="mt-1 text-[var(--rq-slate)]">
            Listing creation: <strong>0 credits</strong>. Initial claim
            invitation: <strong>0 credits</strong>.
          </p>
        </section>

        <div>
          <Label htmlFor="disclosure">Invitation disclosure preference</Label>
          <select
            id="disclosure"
            className="mt-1 h-11 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
            value={disclosure}
            onChange={(e) =>
              setDisclosure(e.target.value as DisclosurePreference)
            }
          >
            <option value="anonymous_ratequip_user">A RateQuip user</option>
            <option value="user_display_name">My display name</option>
            <option value="verified_business_name">My verified business name</option>
          </select>
        </div>

        <label className="flex items-start gap-3 text-sm text-[var(--rq-slate)]">
          <input
            type="checkbox"
            className="mt-1"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>
            I confirm the company is real, the information is accurate to the
            best of my knowledge, any contact addresses were obtained through a
            legitimate business relationship or source, and I am not creating
            this listing to impersonate, harass or obtain fraudulent rewards. I
            understand RateQuip will notify listed recipients and retain an
            audit record.
          </span>
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button onClick={onPublish} disabled={pending || !accepted}>
          {pending
            ? "Publishing…"
            : hasRecipients
              ? "Create company and send invitation"
              : "Create company"}
        </Button>
      </div>
    </AddCompanyWizardShell>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-[var(--rq-muted)]">{label}</dt>
      <dd className="text-[var(--rq-ink)]">{value || "—"}</dd>
    </div>
  );
}

function writePublishedId(id: string) {
  try {
    window.sessionStorage.setItem("rq-og-last-published", id);
  } catch {
    /* ignore */
  }
}
