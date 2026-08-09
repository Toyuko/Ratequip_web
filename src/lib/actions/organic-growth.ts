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
  ensureSubmission,
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
import { publicAppUrl } from "@/lib/config";
import { sendTransactionalEmail } from "@/lib/email";
import {
  discoverCompaniesFromWeb,
  enrichCompanyFromWeb,
  enrichmentToListingFields,
  type CompanyEnrichment,
} from "@/lib/ai/company-web-enrich";
import { demoCategories } from "@/lib/db/demo-data";
import { allowAiRequest } from "@/lib/ai/assist-guard";

function mapCategoryHints(hints: string[] | undefined) {
  if (!hints?.length) return [] as string[];
  const cats = demoCategories;
  const matched: string[] = [];
  for (const hint of hints) {
    const needle = hint.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const hit =
      cats.find((c) => c.slug === needle) ||
      cats.find((c) => c.slug.includes(needle) || needle.includes(c.slug)) ||
      cats.find(
        (c) =>
          c.name.toLowerCase().includes(hint.toLowerCase()) ||
          hint.toLowerCase().includes(c.name.toLowerCase()),
      );
    if (hit && !matched.includes(hit.slug)) matched.push(hit.slug);
  }
  return matched;
}

function serializeEnrichment(enrichment: CompanyEnrichment) {
  const fields = enrichmentToListingFields(enrichment);
  const categories = mapCategoryHints(enrichment.categoryHints);
  return {
    ...fields,
    categories,
    enrichmentMeta: {
      source: enrichment.source,
      usedAi: enrichment.usedAi,
      confidence: enrichment.confidence,
      matchReasons: enrichment.matchReasons,
      abnOrRegistry: enrichment.abnOrRegistry,
      fetchedUrl: enrichment.fetchedUrl,
      phones: fields.phoneNumbers ?? [],
      emails: fields.emailCandidates ?? [],
      addresses: enrichment.addresses ?? [],
      publicProfiles: enrichment.publicProfiles ?? [],
      registryMeta: enrichment.registryMeta,
    },
  };
}

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
  includeWeb?: boolean;
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

  let web: Awaited<ReturnType<typeof discoverCompaniesFromWeb>> | null = null;
  if (input.includeWeb !== false) {
    if (!allowAiRequest(`og-web-search:${q.slice(0, 40).toLowerCase()}`, 8, 60_000)) {
      return {
        ok: true as const,
        candidates,
        webEnrichments: [] as ReturnType<typeof serializeEnrichment>[],
        webMessage:
          "Web enrichment rate-limited — RateQuip directory results only. Try again shortly.",
        webSearchHits: [] as Array<{ title: string; url: string; snippet: string }>,
      };
    }
    try {
      web = await discoverCompaniesFromWeb({
        query: q,
        country: input.country,
        limit: 4,
      });
    } catch (error) {
      console.warn("[organic-growth] web discovery failed", error);
    }
  }

  return {
    ok: true as const,
    candidates,
    webEnrichments: (web?.enrichments ?? []).map(serializeEnrichment),
    webMessage: web?.message,
    webSearchHits: web?.searchHits ?? [],
  };
}

export async function enrichCompanyListingFromWeb(input: {
  query: string;
  websiteUrl?: string;
  country?: string;
}) {
  if (!allowAiRequest(`og-enrich:${(input.websiteUrl || input.query).slice(0, 48)}`, 12)) {
    return {
      ok: false as const,
      message: "Too many enrichment requests. Wait a minute and try again.",
    };
  }

  const result = await enrichCompanyFromWeb(input);
  if (!result.ok) return result;

  return {
    ok: true as const,
    enrichment: serializeEnrichment(result.enrichment),
    searchHits: result.searchHits,
    message: result.enrichment.usedAi
      ? "Details extracted from the public website with AI."
      : "Details filled from the public website.",
  };
}

export async function startListingSubmission(input: {
  searchQuery: string;
  idempotencyKey?: string;
  enrichment?: Partial<ReturnType<typeof serializeEnrichment>> & {
    companyName?: string;
    websiteUrl?: string;
    companyTypes?: ListingSubmissionDraft["companyTypes"];
    countryCode?: string;
    locality?: string;
    region?: string;
    addressLine?: string;
    postalCode?: string;
    phoneDisplay?: string;
    phoneNumbers?: string[];
    emailCandidates?: string[];
    abnOrRegistry?: string;
    publicSourceUrl?: string;
    privateNotes?: string;
    categories?: string[];
  };
}) {
  if (input.idempotencyKey) {
    const existing = getSubmissionByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return { ok: true as const, submission: publicSafeSubmission(existing) };
    }
  }

  const enrichment = input.enrichment;
  const domain = registrableDomainFromUrl(enrichment?.websiteUrl);
  const seededContacts = sanitizeContacts(
    (enrichment?.emailCandidates ?? []).slice(0, 5).map((email, index) => ({
      id: `web-email-${index + 1}`,
      email,
      emailMasked: maskEmail(email),
      role: index === 0 ? "General enquiries" : undefined,
      sourceType: "company_website" as const,
      sourceUrl: enrichment?.websiteUrl || enrichment?.publicSourceUrl,
      sourceNote: "Discovered from public company website",
      sendAfterPublish: true,
      domainMatchCategory: "unknown" as const,
      sendEligibility: "pending" as const,
    })),
    domain,
  );

  const submission = createEmptySubmission({
    searchQuery: input.searchQuery,
    companyName: enrichment?.companyName || input.searchQuery,
    websiteUrl: enrichment?.websiteUrl,
    companyTypes: enrichment?.companyTypes ?? [],
    countryCode: enrichment?.countryCode,
    locality: enrichment?.locality,
    region: enrichment?.region,
    addressLine: enrichment?.addressLine,
    postalCode: enrichment?.postalCode,
    phoneDisplay: enrichment?.phoneDisplay,
    phoneNumbers: enrichment?.phoneNumbers,
    emailCandidates: enrichment?.emailCandidates,
    abnOrRegistry: enrichment?.abnOrRegistry,
    publicSourceUrl: enrichment?.publicSourceUrl,
    privateNotes: enrichment?.privateNotes,
    categories: enrichment?.categories ?? [],
    contacts: seededContacts,
    skipContacts: seededContacts.length === 0,
    idempotencyKey: input.idempotencyKey,
    status: "draft",
  });

  return { ok: true as const, submission: publicSafeSubmission(submission) };
}

export async function updateListingSubmission(
  input: Partial<ListingSubmissionDraft> & { id: string },
) {
  // Upsert: recover drafts when the in-memory map was lost (serverless cold start).
  const existing = ensureSubmission(input);
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
  draft?: Partial<ListingSubmissionDraft>;
}) {
  const existing = input.draft
    ? ensureSubmission({ ...input.draft, id: input.id })
    : getSubmission(input.id);
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

  const baseUrl = publicAppUrl();
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

    const sent = await sendTransactionalEmail({
      to: recipient.email,
      subject: email.subject,
      html: email.html,
      tags: [
        { name: "category", value: "claim_invite" },
        { name: "company", value: (result.companySlug ?? "unknown").slice(0, 256) },
      ],
    });
    if (!sent.ok) {
      console.error("[organic-growth] claim invite email failed", {
        invitationId: invitation.id,
        error: sent.error,
        demo: sent.demo,
      });
    }
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
  if (hit) {
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

  // Signed tokens work across serverless instances without in-memory state.
  const { verifyClaimInviteToken } = await import(
    "@/lib/organic-growth/claim-token"
  );
  const signed = verifyClaimInviteToken(token);
  if (!signed) {
    return { ok: false as const, message: "Invitation not found or expired." };
  }

  return {
    ok: true as const,
    companyName: signed.companyName,
    companySlug: signed.companySlug,
    locality: signed.locality,
    countryCode: signed.countryCode,
    domain: signed.domain,
    invitationState: signed.invitationState,
    emailMasked: signed.emailMasked,
    inviterDisplay: signed.inviterDisplay,
  };
}
