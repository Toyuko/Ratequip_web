"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { CLAIM_AFTER_PUBLISH_KEY } from "@/components/companies/company-discovery-search";
import { AddCompanyWizardShell } from "@/components/organic-growth/wizard-shell";
import { useListingDraft } from "@/components/organic-growth/use-listing-draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateListingSubmission } from "@/lib/actions/organic-growth";
import {
  CONTACT_SOURCES,
  type ContactCandidateDraft,
  type ContactSource,
  type ListingIntent,
} from "@/lib/organic-growth/types";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<ContactSource, string> = {
  business_relationship: "Existing business relationship",
  company_website: "Company website",
  business_card_or_signature: "Business card / email signature",
  public_directory: "Public directory",
  other: "Other",
};

const INTENT_OPTIONS: Array<{
  id: ListingIntent;
  title: string;
  description: string;
}> = [
  {
    id: "self_claim",
    title: "This is my company",
    description:
      "You’re the owner, director, or authorised representative. We’ll publish the profile, then take you straight into claim & verify — no invitation email needed.",
  },
  {
    id: "invite_others",
    title: "Invite someone else to claim it",
    description:
      "You’re adding a company you know about. Send a private claim invitation to the right person at that business.",
  },
  {
    id: "leave_unclaimed",
    title: "Leave it unclaimed for now",
    description:
      "Create the public listing without invitations. Anyone with authority can claim it later.",
  },
];

function emptyContact(): ContactCandidateDraft {
  return {
    id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    email: "",
    emailMasked: "",
    contactName: "",
    role: "",
    sourceType: "business_relationship",
    sourceUrl: "",
    sourceNote: "",
    personalNote: "",
    sendAfterPublish: true,
    domainMatchCategory: "unknown",
    sendEligibility: "pending",
  };
}

function markClaimAfterPublish(enabled: boolean) {
  try {
    if (enabled) sessionStorage.setItem(CLAIM_AFTER_PUBLISH_KEY, "1");
    else sessionStorage.removeItem(CLAIM_AFTER_PUBLISH_KEY);
  } catch {
    /* ignore */
  }
}

function ContactsForm() {
  const router = useRouter();
  const params = useSearchParams();
  const fromClaim = params.get("from") === "claim";
  const { draft, ready, save } = useListingDraft();
  const [intent, setIntent] = useState<ListingIntent | null>(
    fromClaim ? "self_claim" : null,
  );
  const [contacts, setContacts] = useState<ContactCandidateDraft[]>([
    emptyContact(),
  ]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!draft) {
      router.replace("/companies/search");
      return;
    }
    if (draft.listingIntent) setIntent(draft.listingIntent);
    else if (fromClaim) setIntent("self_claim");
    if (draft.contacts.length > 0) setContacts(draft.contacts);
  }, [ready, draft, router, fromClaim]);

  if (!ready || !draft) return null;

  function updateContact(id: string, patch: Partial<ContactCandidateDraft>) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function continueWithIntent() {
    const current = draft;
    if (!current || !intent) {
      setError("Choose how you want to handle this company profile.");
      return;
    }

    startTransition(async () => {
      setError(null);

      if (intent === "invite_others") {
        const payloadContacts = contacts.filter(
          (c) => (c.email ?? "").trim().length > 0,
        );
        if (payloadContacts.length === 0) {
          setError("Add at least one email to invite, or pick another option.");
          return;
        }
        for (const c of payloadContacts) {
          if (!c.sourceType) {
            setError("Select how you know each email address.");
            return;
          }
          if (
            (c.sourceType === "public_directory" ||
              c.sourceType === "other") &&
            !c.sourceUrl?.trim() &&
            !c.sourceNote?.trim()
          ) {
            setError("Add a source URL or note for public/other contacts.");
            return;
          }
        }

        markClaimAfterPublish(false);
        const result = await updateListingSubmission({
          ...current,
          listingIntent: intent,
          contacts: payloadContacts,
          skipContacts: false,
          relationship: current.relationship,
          intendedPurpose: current.intendedPurpose ?? "directory_coverage",
          status: "contacts_complete",
        });
        if (!result.ok) {
          setError(result.message ?? "Unable to save contacts.");
          return;
        }
        save(result.submission as never);
        router.push(`/companies/add/relationship?submissionId=${current.id}`);
        return;
      }

      // self_claim or leave_unclaimed — no invitation recipients
      markClaimAfterPublish(intent === "self_claim");
      const result = await updateListingSubmission({
        ...current,
        listingIntent: intent,
        contacts: [],
        skipContacts: true,
        relationship:
          intent === "self_claim"
            ? "owner_representative"
            : current.relationship ?? "research",
        intendedPurpose:
          intent === "self_claim"
            ? "claim_own_company"
            : current.intendedPurpose ?? "directory_coverage",
        conflictDeclared: intent === "self_claim" ? true : current.conflictDeclared,
        status: "contacts_skipped",
      });
      if (!result.ok) {
        setError(result.message ?? "Unable to save.");
        return;
      }
      save(result.submission as never);
      router.push(`/companies/add/relationship?submissionId=${current.id}`);
    });
  }

  const companyLabel = draft.companyName || "this company";

  return (
    <AddCompanyWizardShell
      step="contacts"
      title={
        intent === "self_claim"
          ? `Claim ${companyLabel}`
          : intent === "invite_others"
            ? "Who should we invite to claim this company?"
            : "How should this company be claimed?"
      }
      description={
        intent === "self_claim"
          ? "You’re setting up your own company. No invitation is sent — after publish you’ll verify your connection and take control of the profile."
          : intent === "invite_others"
            ? "Addresses are used only to send and manage this invitation. They are never published as company contact details."
            : "Choose whether you’re the company, inviting someone else, or leaving the listing unclaimed."
      }
      submissionId={draft.id}
    >
      <div className="space-y-6">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--rq-ink)]">
            Are you setting up your own company?
          </legend>
          <ul className="mt-3 space-y-2">
            {INTENT_OPTIONS.map((option) => {
              const selected = intent === option.id;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setIntent(option.id);
                      setError(null);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-[var(--rq-orange)] bg-orange-50 dark:bg-orange-950/30"
                        : "border-[var(--rq-border)] bg-[var(--rq-bg)] hover:bg-[var(--rq-hover)]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        selected
                          ? "border-[var(--rq-orange)] bg-[var(--rq-orange)]"
                          : "border-[var(--rq-border)]",
                      )}
                      aria-hidden
                    >
                      {selected ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      ) : null}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[var(--rq-ink)]">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-[var(--rq-slate)]">
                        {option.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {intent === "self_claim" ? (
          <p className="rounded-md border border-[var(--rq-border)] bg-[var(--rq-surface)] px-3 py-2 text-sm text-[var(--rq-slate)]">
            Next you’ll confirm your relationship (owner / employee / etc.) and
            publish. Then RateQuip opens the claim wizard so you can verify with
            a company email, phone, website control, or admin approval.
          </p>
        ) : null}

        {intent === "leave_unclaimed" ? (
          <p className="rounded-md border border-[var(--rq-border)] bg-[var(--rq-surface)] px-3 py-2 text-sm text-[var(--rq-slate)]">
            The listing publishes as Unclaimed. No emails are sent. You can still
            claim it later from the company page if you have authority.
          </p>
        ) : null}

        {intent === "invite_others" ? (
          <div className="space-y-6">
            <p className="rounded-md border border-[var(--rq-border)] bg-[var(--rq-surface)] px-3 py-2 text-sm text-[var(--rq-slate)]">
              A valid business email is required before a claim invitation is
              sent. If this is actually your company, switch to{" "}
              <button
                type="button"
                className="font-semibold text-[var(--rq-orange)] underline-offset-2 hover:underline"
                onClick={() => setIntent("self_claim")}
              >
                This is my company
              </button>{" "}
              instead.
            </p>
            {contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="space-y-3 rounded-md border border-[var(--rq-border)] p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--rq-ink)]">
                    Contact {index + 1}
                  </h3>
                  {contacts.length > 1 ? (
                    <button
                      type="button"
                      className="text-xs text-red-600"
                      onClick={() =>
                        setContacts((prev) =>
                          prev.filter((c) => c.id !== contact.id),
                        )
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <div>
                  <Label>Contact email</Label>
                  <Input
                    className="mt-1"
                    type="email"
                    value={contact.email ?? ""}
                    onChange={(e) =>
                      updateContact(contact.id, { email: e.target.value })
                    }
                    placeholder="name@company.com"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Contact name (optional)</Label>
                    <Input
                      className="mt-1"
                      value={contact.contactName ?? ""}
                      onChange={(e) =>
                        updateContact(contact.id, {
                          contactName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Role / department</Label>
                    <Input
                      className="mt-1"
                      value={contact.role ?? ""}
                      onChange={(e) =>
                        updateContact(contact.id, { role: e.target.value })
                      }
                      placeholder="Owner, sales, ops…"
                    />
                  </div>
                </div>
                <div>
                  <Label>How do you know this address?</Label>
                  <select
                    className="mt-1 h-11 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
                    value={contact.sourceType}
                    onChange={(e) =>
                      updateContact(contact.id, {
                        sourceType: e.target.value as ContactSource,
                      })
                    }
                  >
                    {CONTACT_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {SOURCE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Source URL or note</Label>
                  <Input
                    className="mt-1"
                    value={contact.sourceUrl || contact.sourceNote || ""}
                    onChange={(e) =>
                      updateContact(contact.id, {
                        sourceUrl: e.target.value,
                        sourceNote: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Personal note to recipient (optional, max 300)</Label>
                  <Textarea
                    className="mt-1"
                    maxLength={300}
                    value={contact.personalNote ?? ""}
                    onChange={(e) =>
                      updateContact(contact.id, {
                        personalNote: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ))}

            {contacts.length < 5 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setContacts((prev) => [...prev, emptyContact()])
                }
              >
                Add another contact
              </Button>
            ) : null}

            <p className="text-sm text-[var(--rq-muted)]">
              Maximum five recipients on the initial listing. Disposable domains
              are blocked. Consumer domains require a direct-relationship
              declaration.
            </p>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={continueWithIntent}
            disabled={pending || !intent}
          >
            {pending
              ? "Saving…"
              : intent === "self_claim"
                ? "Continue — I’ll claim this company"
                : intent === "leave_unclaimed"
                  ? "Continue without invitations"
                  : "Continue"}
          </Button>
        </div>
      </div>
    </AddCompanyWizardShell>
  );
}

export default function AddContactsPage() {
  return (
    <Suspense>
      <ContactsForm />
    </Suspense>
  );
}
