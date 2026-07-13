"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
} from "@/lib/organic-growth/types";

const SOURCE_LABELS: Record<ContactSource, string> = {
  business_relationship: "Existing business relationship",
  company_website: "Company website",
  business_card_or_signature: "Business card / email signature",
  public_directory: "Public directory",
  other: "Other",
};

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

export default function AddContactsPage() {
  const router = useRouter();
  const { draft, ready, save } = useListingDraft();
  const [contacts, setContacts] = useState<ContactCandidateDraft[]>([emptyContact()]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!draft) {
      router.replace("/companies/search");
      return;
    }
    if (draft.contacts.length > 0) setContacts(draft.contacts);
  }, [ready, draft, router]);

  if (!ready || !draft) return null;

  function updateContact(id: string, patch: Partial<ContactCandidateDraft>) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function continueWithContacts(skip: boolean) {
    const current = draft;
    if (!current) return;
    startTransition(async () => {
      const payloadContacts = skip
        ? []
        : contacts.filter((c) => (c.email ?? "").trim().length > 0);

      for (const c of payloadContacts) {
        if (!c.sourceType) {
          setError("Select how you know each email address.");
          return;
        }
        if (
          (c.sourceType === "public_directory" || c.sourceType === "other") &&
          !c.sourceUrl?.trim() &&
          !c.sourceNote?.trim()
        ) {
          setError("Add a source URL or note for public/other contacts.");
          return;
        }
      }

      const result = await updateListingSubmission({
        ...current,
        contacts: payloadContacts,
        skipContacts: skip,
        status: skip ? "contacts_skipped" : "contacts_complete",
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      save(result.submission as never);
      router.push(`/companies/add/relationship?submissionId=${current.id}`);
    });
  }

  return (
    <AddCompanyWizardShell
      step="contacts"
      title="Who should we invite to claim this company?"
      description="Addresses are used only to send and manage this invitation. They are never published as company contact details."
      submissionId={draft.id}
    >
      <div className="space-y-6">
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
                    setContacts((prev) => prev.filter((c) => c.id !== contact.id))
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
                onChange={(e) => updateContact(contact.id, { email: e.target.value })}
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
                    updateContact(contact.id, { contactName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Role / department</Label>
                <Input
                  className="mt-1"
                  value={contact.role ?? ""}
                  onChange={(e) => updateContact(contact.id, { role: e.target.value })}
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
                  updateContact(contact.id, { personalNote: e.target.value })
                }
              />
            </div>
          </div>
        ))}

        {contacts.length < 5 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setContacts((prev) => [...prev, emptyContact()])}
          >
            Add another contact
          </Button>
        ) : null}

        <p className="text-sm text-[var(--rq-muted)]">
          Maximum five recipients on the initial listing. Disposable domains are
          blocked. Consumer domains require a direct-relationship declaration.
        </p>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => continueWithContacts(false)} disabled={pending}>
            {pending ? "Saving…" : "Continue"}
          </Button>
          <Button
            variant="outline"
            onClick={() => continueWithContacts(true)}
            disabled={pending}
          >
            I don&apos;t know an email address
          </Button>
        </div>
      </div>
    </AddCompanyWizardShell>
  );
}
