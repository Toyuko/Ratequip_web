"use server";

import { renderClaimInviteEmail } from "@/lib/organic-growth/claim-invite-email";
import {
  classifyEmailDomain,
  isDisposableEmail,
  isValidEmail,
  maskEmail,
  normalizeEmail,
  registrableDomainFromUrl,
} from "@/lib/organic-growth/privacy";
import { findDuplicateCandidates } from "@/lib/organic-growth/search";
import {
  createEmptySubmission,
  getClaimByToken,
  getSubmission,
  getSubmissionByIdempotencyKey,
  markInvitationsSent,
  publishSubmission,
  publicSafeSubmission,
  saveSubmission,
} from "@/lib/organic-growth/store";
import type {
  ContactCandidateDraft,
  ListingSubmissionDraft,
} from "@/lib/organic-growth/types";
import { sendTransactionalEmail } from "@/lib/email";

function sanitizeContacts(
  contacts: ContactCandidateDraft[],
  companyDomain?: string,
): ContactCandidateDraft[] {
  const seen = new Set<string>();
  const result: ContactCandidateDraft[] = [];

  for (const raw of contacts.slice(0, 5)) {
    const email = normalizeEmail(raw.email ?? "");
    if (!email) continue;
    if (!isValidEmail(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);

    const domainMatchCategory = classifyEmailDomain(email, companyDomain);
    let sendEligibility: ContactCandidateDraft["sendEligibility"] = "eligible";
    if (isDisposableEmail(email)) sendEligibility = "blocked";
    else if (domainMatchCategory === "consumer_domain") {
      sendEligibility =
        raw.sourceType === "business_relationship" ? "eligible" : "manual_review";
    }

    result.push({
      ...raw,
      id: raw.id || `contact-${result.length + 1}`,
      email,
      emailMasked: maskEmail(email),
      domainMatchCategory,
      sendEligibility,
      sendAfterPublish: raw.sendAfterPublish !== false && sendEligibility === "eligible",
    });
  }

  return result;
}

export async function searchCompaniesForAdd(input: {
  q: string;
  country?: string;
  websiteUrl?: string;
}) {
  const q = input.q.trim();
  if (q.length < 2) {
    return { ok: false as const, message: "Enter at least 2 characters to search." };
  }

  const candidates = await findDuplicateCandidates({
    query: q,
    websiteUrl: input.websiteUrl,
    country: input.country,
  });

  return { ok: true as const, candidates };
}

export async function startListingSubmission(input: {
  searchQuery: string;
  idempotencyKey?: string;
}) {
  if (input.idempotencyKey) {
    const existing = getSubmissionByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return { ok: true as const, submission: publicSafeSubmission(existing) };
    }
  }

  const submission = createEmptySubmission({
    searchQuery: input.searchQuery,
    companyName: input.searchQuery,
    idempotencyKey: input.idempotencyKey,
    status: "draft",
  });

  return { ok: true as const, submission: publicSafeSubmission(submission) };
}

export async function updateListingSubmission(
  input: Partial<ListingSubmissionDraft> & { id: string },
) {
  const existing = getSubmission(input.id);
  if (!existing) {
    return { ok: false as const, message: "Submission not found." };
  }
  if (existing.status === "published") {
    return {
      ok: true as const,
      submission: publicSafeSubmission(existing),
      message: "Already published.",
    };
  }

  const domain =
    registrableDomainFromUrl(input.websiteUrl ?? existing.websiteUrl) ??
    existing.registrableDomain;

  const contacts = input.contacts
    ? sanitizeContacts(input.contacts, domain)
    : existing.contacts;

  const next = saveSubmission({
    ...existing,
    ...input,
    contacts,
    registrableDomain: domain,
    id: existing.id,
    idempotencyKey: existing.idempotencyKey,
    createdAt: existing.createdAt,
  });

  return { ok: true as const, submission: publicSafeSubmission(next) };
}

export async function publishListingSubmission(input: {
  id: string;
  declarationsAccepted: boolean;
  disclosurePreference?: ListingSubmissionDraft["disclosurePreference"];
}) {
  const existing = getSubmission(input.id);
  if (!existing) {
    return { ok: false as const, message: "Submission not found." };
  }

  if (existing.status === "published") {
    return {
      ok: true as const,
      submission: publicSafeSubmission(existing),
      companySlug: existing.publishedCompanySlug!,
      invitationsQueued: existing.invitations.length,
      duplicated: true,
    };
  }

  saveSubmission({
    ...existing,
    declarationsAccepted: input.declarationsAccepted,
    disclosurePreference:
      input.disclosurePreference ?? existing.disclosurePreference,
    status: "publishing",
  });

  const result = publishSubmission(input.id);
  if (!result.ok) return result;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const inviterDisplay =
    result.submission.disclosurePreference === "anonymous_ratequip_user"
      ? undefined
      : result.submission.disclosurePreference === "verified_business_name"
        ? "A verified RateQuip business"
        : "A RateQuip user";

  for (const recipient of result.plaintextEmails ?? []) {
    const invitation = result.submission.invitations.find(
      (i) => i.id === recipient.invitationId,
    );
    if (!invitation) continue;

    const email = renderClaimInviteEmail({
      companyName: result.submission.companyName!,
      companyContext: [
        result.submission.locality,
        result.submission.countryCode,
        result.submission.registrableDomain,
      ]
        .filter(Boolean)
        .join(" · "),
      profileUrl: `${baseUrl}/companies/${result.companySlug}`,
      claimUrl: `${baseUrl}/claim/${invitation.claimToken}`,
      expiresDate: expires,
      reportOrCorrectUrl: `${baseUrl}/email/preferences/${invitation.claimToken}`,
      emailPreferencesUrl: `${baseUrl}/email/preferences/${invitation.claimToken}`,
      supportUrl: `${baseUrl}/contact`,
      recipientName: recipient.contactName,
      inviterDisplay,
      personalNote: recipient.personalNote,
    });

    await sendTransactionalEmail({
      to: recipient.email,
      subject: email.subject,
      html: email.html,
    });
  }

  const sent = markInvitationsSent(input.id) ?? result.submission;

  return {
    ok: true as const,
    submission: publicSafeSubmission(sent),
    companySlug: result.companySlug,
    invitationsQueued: sent.invitations.length,
    duplicated: result.duplicated,
  };
}

export async function getListingSubmission(id: string) {
  const submission = getSubmission(id);
  if (!submission) return { ok: false as const, message: "Not found." };
  return { ok: true as const, submission: publicSafeSubmission(submission) };
}

export async function getClaimInvitation(token: string) {
  const hit = getClaimByToken(token);
  if (!hit) {
    return { ok: false as const, message: "Invitation not found or expired." };
  }

  return {
    ok: true as const,
    companyName: hit.submission.companyName,
    companySlug: hit.submission.publishedCompanySlug,
    locality: hit.submission.locality,
    countryCode: hit.submission.countryCode,
    domain: hit.submission.registrableDomain,
    invitationState: hit.invitation.state,
    emailMasked: hit.invitation.emailMasked,
    inviterDisplay:
      hit.submission.disclosurePreference === "anonymous_ratequip_user"
        ? "A RateQuip user"
        : "A RateQuip contributor",
  };
}
