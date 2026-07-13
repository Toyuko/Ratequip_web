import { demoCompanies, type DemoCompany } from "@/lib/db/demo-data";
import { slugify } from "@/lib/utils";
import {
  createClaimToken,
  encryptEmailDemo,
  emailNormalizedHash,
  maskEmail,
  normalizeEmail,
  registrableDomainFromUrl,
} from "./privacy";
import type {
  ListingSubmissionDraft,
  PublishedInvitation,
} from "./types";

type StoredSubmission = ListingSubmissionDraft & {
  invitations: PublishedInvitation[];
  contactCiphertexts: Record<string, string>;
};

const globalStore = globalThis as typeof globalThis & {
  __rqOrganicGrowthStore?: Map<string, StoredSubmission>;
  __rqClaimTokens?: Map<string, { submissionId: string; invitationId: string }>;
};

function submissions() {
  if (!globalStore.__rqOrganicGrowthStore) {
    globalStore.__rqOrganicGrowthStore = new Map();
  }
  return globalStore.__rqOrganicGrowthStore;
}

function claimTokens() {
  if (!globalStore.__rqClaimTokens) {
    globalStore.__rqClaimTokens = new Map();
  }
  return globalStore.__rqClaimTokens;
}

export function createEmptySubmission(partial?: Partial<ListingSubmissionDraft>) {
  const now = new Date().toISOString();
  const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const draft: StoredSubmission = {
    id,
    idempotencyKey: partial?.idempotencyKey ?? `idem-${id}`,
    status: "draft",
    companyTypes: [],
    categories: [],
    conflictDeclared: false,
    disclosurePreference: "anonymous_ratequip_user",
    declarationsAccepted: false,
    skipContacts: false,
    skipReview: true,
    contacts: [],
    invitations: [],
    contactCiphertexts: {},
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
  submissions().set(id, draft);
  return draft;
}

export function getSubmission(id: string) {
  return submissions().get(id) ?? null;
}

export function getSubmissionByIdempotencyKey(key: string) {
  for (const item of submissions().values()) {
    if (item.idempotencyKey === key) return item;
  }
  return null;
}

export function saveSubmission(draft: ListingSubmissionDraft) {
  const existing = submissions().get(draft.id);
  const stored: StoredSubmission = {
    invitations: existing?.invitations ?? [],
    contactCiphertexts: existing?.contactCiphertexts ?? {},
    ...draft,
    updatedAt: new Date().toISOString(),
  };
  for (const contact of draft.contacts) {
    if (contact.email) {
      stored.contactCiphertexts[contact.id] = encryptEmailDemo(contact.email);
    }
  }
  submissions().set(draft.id, stored);
  return stored;
}

export function getClaimByToken(token: string) {
  const ref = claimTokens().get(token);
  if (!ref) return null;
  const submission = getSubmission(ref.submissionId);
  if (!submission) return null;
  const invitation = submission.invitations.find((i) => i.id === ref.invitationId);
  if (!invitation) return null;
  return { submission, invitation };
}

export function publishSubmission(submissionId: string) {
  const existing = getSubmission(submissionId);
  if (!existing) {
    return { ok: false as const, message: "Submission not found." };
  }

  if (existing.status === "published" && existing.publishedCompanySlug) {
    return {
      ok: true as const,
      submission: existing,
      companySlug: existing.publishedCompanySlug,
      duplicated: true,
    };
  }

  const name = existing.companyName?.trim();
  if (!name) {
    return { ok: false as const, message: "Company name is required." };
  }
  if (!existing.countryCode) {
    return { ok: false as const, message: "Country is required." };
  }
  if (!existing.locality) {
    return { ok: false as const, message: "Locality is required." };
  }
  if (existing.companyTypes.length === 0) {
    return { ok: false as const, message: "Select at least one company type." };
  }
  if (existing.categories.length === 0) {
    return { ok: false as const, message: "Select at least one category." };
  }
  if (!existing.declarationsAccepted) {
    return { ok: false as const, message: "Accept the declarations to publish." };
  }

  let slug = slugify(name);
  const taken = new Set(demoCompanies.map((c) => c.slug));
  if (taken.has(slug)) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const company: DemoCompany = {
    id: `co-og-${existing.id}`,
    name,
    slug,
    headline: `${existing.companyTypes[0]} listed by a RateQuip contributor`,
    description:
      existing.privateNotes?.trim() ||
      `${name} was added by a RateQuip user. This profile is unclaimed until a company representative verifies authority.`,
    country: existing.countryCode,
    city: existing.locality,
    website: existing.websiteUrl?.startsWith("http")
      ? existing.websiteUrl
      : existing.websiteUrl
        ? `https://${existing.websiteUrl}`
        : "https://example.com",
    verified: false,
    claimed: false,
    trustScore: 0,
    reviewCount: 0,
    employeeRange: "Unknown",
    yearFounded: new Date().getFullYear(),
    categories: existing.categories,
  };

  demoCompanies.unshift(company);

  const sendContacts = existing.skipContacts
    ? []
    : existing.contacts.filter(
        (c) => c.email && c.sendAfterPublish && c.sendEligibility === "eligible",
      );

  const invitations: PublishedInvitation[] = sendContacts.map((contact) => {
    const { token } = createClaimToken();
    const invitation: PublishedInvitation = {
      id: `inv-${contact.id}`,
      emailMasked: contact.emailMasked || maskEmail(contact.email!),
      role: contact.role,
      state: "queued",
      claimToken: token,
    };
    claimTokens().set(token, {
      submissionId: existing.id,
      invitationId: invitation.id,
    });
    existing.contactCiphertexts[contact.id] = encryptEmailDemo(
      normalizeEmail(contact.email!),
    );
    return invitation;
  });

  const published: StoredSubmission = {
    ...existing,
    status: "published",
    publishedCompanyId: company.id,
    publishedCompanySlug: company.slug,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    registrableDomain:
      existing.registrableDomain ?? registrableDomainFromUrl(existing.websiteUrl),
    invitations,
    contacts: existing.contacts.map((c) => ({
      ...c,
      email: undefined,
      emailMasked: c.emailMasked || (c.email ? maskEmail(c.email) : "***"),
    })),
  };

  submissions().set(existing.id, published);

  return {
    ok: true as const,
    submission: published,
    companySlug: company.slug,
    duplicated: false,
    plaintextEmails: sendContacts.map((c) => ({
      invitationId: `inv-${c.id}`,
      email: normalizeEmail(c.email!),
      contactName: c.contactName,
      personalNote: c.personalNote,
      hash: emailNormalizedHash(c.email!),
    })),
  };
}

export function markInvitationsSent(submissionId: string) {
  const submission = getSubmission(submissionId);
  if (!submission) return null;
  submission.invitations = submission.invitations.map((inv) =>
    inv.state === "queued" ? { ...inv, state: "sent" } : inv,
  );
  submissions().set(submissionId, submission);
  return submission;
}

export function publicSafeSubmission(submission: StoredSubmission) {
  const { contactCiphertexts: _cipher, ...rest } = submission;
  return {
    ...rest,
    contacts: submission.contacts.map(({ email: _email, ...contact }) => contact),
  };
}
