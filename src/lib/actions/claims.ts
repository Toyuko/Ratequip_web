"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { discoverCompanyClaimSources } from "@/lib/ai/company-claim-discover";
import {
  buildVerificationPayload,
  decideClaimOutcome,
} from "@/lib/claims/decision-engine";
import {
  assertCompanyWorkEmail,
  createClaimEmailOtp,
  verifyClaimEmailOtp,
} from "@/lib/claims/email-otp";
import {
  outcomeCustomerMessage,
  type ClaimMethod,
  type ClaimOutcome,
  type ClaimRelationship,
  type VerificationSignal,
} from "@/lib/claims/types";
import { hasClerk, isDemoMode, publicAppUrl } from "@/lib/config";
import {
  countOpenClaimsForCompanyAsync,
  getCompanyBySlugAsync,
  persistClaim,
} from "@/lib/db/phase2";
import {
  isEmailConfigured,
  looksLikeEmail,
  opsEmail,
  sendTransactionalEmail,
} from "@/lib/email";
import {
  renderClaimConflictOpsEmail,
  renderClaimOutcomeEmail,
} from "@/lib/organic-growth/claim-lifecycle-emails";
import { registrableDomainFromUrl } from "@/lib/organic-growth/privacy";
import {
  bindClaimAttribution,
  processReferralRewardEvent,
  REFERRAL_COOKIE,
  getClaimAttribution,
} from "@/lib/referrals/reward-engine";

async function requireMutationActor(): Promise<
  { ok: true; actor: string } | { ok: false; message: string }
> {
  if (hasClerk()) {
    try {
      const session = await auth();
      if (!session.userId) {
        return {
          ok: false,
          message: "Sign in required to perform this action.",
        };
      }
    } catch {
      return { ok: false, message: "Sign in required to perform this action." };
    }
  } else if (!isDemoMode()) {
    return { ok: false, message: "Sign in required to perform this action." };
  } else {
    const jar = await cookies();
    if (
      jar.get("rq_onboarded")?.value !== "1" &&
      !jar.get("rq_email")?.value
    ) {
      return {
        ok: false,
        message: "Sign in or complete demo onboarding first.",
      };
    }
  }
  return { ok: true, actor: await actorFromCookies() };
}

async function actorFromCookies() {
  if (hasClerk()) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      if (user?.primaryEmailAddress?.emailAddress) {
        return user.primaryEmailAddress.emailAddress;
      }
      if (user?.emailAddresses?.[0]?.emailAddress) {
        return user.emailAddresses[0].emailAddress;
      }
      if (user?.id) return user.id;
    } catch {
      /* fall through */
    }
  }
  const jar = await cookies();
  return (
    jar.get("rq_email")?.value ||
    jar.get("rq_actor")?.value ||
    "demo-user@ratequip.local"
  );
}

export async function resolveClaimCompanyByName(input: {
  query: string;
  country?: string;
}) {
  const query = input.query.trim();
  if (query.length < 2) {
    return {
      ok: false as const,
      message: "Enter a company name to search public sources.",
    };
  }

  const { findDuplicateCandidates } = await import(
    "@/lib/organic-growth/search"
  );
  const candidates = await findDuplicateCandidates({
    query,
    country: input.country,
  });
  const best = candidates[0];
  if (!best) {
    return {
      ok: false as const,
      message:
        "No RateQuip company matched that name yet. Add the company first, then claim it.",
      searchUrl: `/companies/search?q=${encodeURIComponent(query)}`,
    };
  }

  return getClaimCompanyContext(best.companySlug);
}

export async function getClaimCompanyContext(companySlug: string) {
  const company = await getCompanyBySlugAsync(companySlug);
  if (!company) {
    return { ok: false as const, message: "Company not found." };
  }

  const discovery = await discoverCompanyClaimSources({
    name: company.legalName || company.name,
    website: company.website,
    city: company.city,
    country: company.country,
    phone: company.phone,
    abn: company.abn,
    publicProfiles: company.publicProfiles,
    description: company.description,
  });

  const domain =
    company.emailDomain ||
    discovery.emailDomain ||
    registrableDomainFromUrl(company.website);

  return {
    ok: true as const,
    company: {
      id: company.id,
      name: company.name,
      legalName: company.legalName || company.name,
      slug: company.slug,
      website: company.website,
      city: company.city,
      country: company.country,
      phone: company.phone || discovery.phone,
      abn: company.abn || discovery.abnOrRegistry,
      emailDomain: domain,
      logoUrl: company.logoUrl,
      claimed: company.claimed,
      verified: company.verified,
      headline: company.headline,
    },
    sources: discovery.sources,
    usedAi: discovery.usedAi,
  };
}

export async function sendClaimEmailCode(input: {
  companySlug: string;
  email: string;
}) {
  const gate = await requireMutationActor();
  if (!gate.ok) return { ok: false as const, message: gate.message };

  const company = await getCompanyBySlugAsync(input.companySlug);
  if (!company) {
    return { ok: false as const, message: "Company not found." };
  }

  const check = assertCompanyWorkEmail({
    email: input.email,
    companyWebsite: company.website,
  });
  if (!check.ok) {
    return { ok: false as const, message: check.message, riskFlag: check.riskFlag };
  }

  const { code, expiresInSec } = createClaimEmailOtp({
    companySlug: company.slug,
    email: check.email,
  });

  const domain = registrableDomainFromUrl(company.website) || check.domain;
  const sent = await sendTransactionalEmail({
    to: check.email,
    subject: `Your RateQuip verification code for ${company.name}`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in ${Math.floor(expiresInSec / 60)} minutes. If you did not request this, ignore the email.</p>`,
    tags: [
      { name: "category", value: "claim_email_otp" },
      { name: "company", value: company.slug.slice(0, 256) },
    ],
  });

  if (!sent.ok && !sent.demo) {
    return { ok: false as const, message: sent.error };
  }

  return {
    ok: true as const,
    message: `Verification code sent to your @${domain} inbox.`,
    expiresInSec,
    /** Present when Resend is not configured so demos can complete OTP. */
    demoCode: !isEmailConfigured() || sent.demo ? code : undefined,
  };
}

export async function completeAutomatedClaim(input: {
  companySlug: string;
  relationship: ClaimRelationship;
  method: ClaimMethod;
  workEmail?: string;
  emailCode?: string;
  selectedSourceIds?: string[];
  /** Demo/stub methods that the UI marks as completed. */
  stubVerifiedSignals?: VerificationSignal[];
}) {
  const gate = await requireMutationActor();
  if (!gate.ok) return { ok: false as const, message: gate.message };

  const company = await getCompanyBySlugAsync(input.companySlug);
  if (!company) {
    return { ok: false as const, message: "Company not found." };
  }

  const riskFlags: string[] = [];
  const verifiedSignals: VerificationSignal[] = [
    ...(input.stubVerifiedSignals ?? []),
  ];

  if (input.method === "company_email") {
    if (!input.workEmail || !input.emailCode) {
      return {
        ok: false as const,
        message: "Enter your work email and verification code.",
      };
    }
    const check = assertCompanyWorkEmail({
      email: input.workEmail,
      companyWebsite: company.website,
    });
    if (!check.ok) {
      if (check.riskFlag) riskFlags.push(check.riskFlag);
      return { ok: false as const, message: check.message };
    }
    const otp = verifyClaimEmailOtp({
      companySlug: company.slug,
      email: check.email,
      code: input.emailCode,
    });
    if (!otp.ok) {
      return { ok: false as const, message: otp.message };
    }
    verifiedSignals.push("company_domain_email");
    if (company.abn || company.website) {
      verifiedSignals.push("registration_match");
    }
  }

  if (input.method === "website_control") {
    verifiedSignals.push("website_dns_control");
  }
  if (input.method === "company_phone") {
    verifiedSignals.push("published_phone");
    if (company.abn) verifiedSignals.push("registration_match");
    if ((input.selectedSourceIds?.length ?? 0) > 0) {
      verifiedSignals.push("business_profile_match");
    }
  }
  if (input.method === "director_registry") {
    verifiedSignals.push("director_registry");
    if (company.abn) verifiedSignals.push("registration_match");
  }
  if (input.method === "admin_approval") {
    verifiedSignals.push("admin_approval");
  }
  if (input.method === "business_profile" || input.method === "supporting_sources") {
    for (const _ of input.selectedSourceIds ?? []) {
      verifiedSignals.push("supporting_public_source");
    }
    if ((input.selectedSourceIds?.length ?? 0) >= 1) {
      verifiedSignals.push("business_profile_match");
    }
  }

  const competingOpenClaims = await countOpenClaimsForCompanyAsync(company.slug);
  const decision = decideClaimOutcome({
    relationship: input.relationship,
    verifiedSignals: Array.from(new Set(verifiedSignals)),
    selectedSupportingCount: (input.selectedSourceIds ?? []).length,
    riskFlags,
    companyAlreadyClaimed: company.claimed,
    hasExistingAdmins: company.claimed && company.verified,
    competingOpenClaims: company.claimed ? competingOpenClaims : 0,
  });

  const payload = buildVerificationPayload({
    relationship: input.relationship,
    method: input.method,
    verifiedSignals: Array.from(new Set(verifiedSignals)),
    selectedSourceIds: input.selectedSourceIds ?? [],
    workEmail: input.workEmail,
    riskFlags: decision.riskFlags,
    outcome: decision.outcome,
  });

  const result = await persistClaim({
    companySlug: company.slug,
    claimant: gate.actor,
    status: decision.outcome,
    relationship: input.relationship,
    method: input.method,
    notes: decision.reason,
    verificationPayload: payload as unknown as Record<string, unknown>,
  });

  if (!result.ok) return result;

  const jar = await cookies();
  const ref = jar.get(REFERRAL_COOKIE)?.value?.trim();
  const orgId = jar.get("rq_org_id")?.value?.trim();
  if (ref && result.id) {
    bindClaimAttribution(result.id, {
      inviteCode: ref,
      organisationId: orgId,
      claimantEmail: looksLikeEmail(gate.actor) ? gate.actor : input.workEmail,
    });
  }

  const baseUrl = publicAppUrl();
  const profileUrl = `${baseUrl}/companies/${company.slug}`;
  const claimFormUrl = `${baseUrl}/companies/claim?company=${company.slug}`;
  const outcome = decision.outcome as ClaimOutcome;

  const recipient =
    (input.workEmail && looksLikeEmail(input.workEmail) && input.workEmail) ||
    (looksLikeEmail(gate.actor) ? gate.actor : null);

  if (recipient) {
    const mail = renderClaimOutcomeEmail({
      companyName: company.name,
      outcome,
      profileUrl,
      claimFormUrl,
      supportUrl: `${baseUrl}/contact`,
    });
    await sendTransactionalEmail({
      to: recipient,
      subject: mail.subject,
      html: mail.html,
      tags: [
        { name: "category", value: "claim_outcome" },
        { name: "outcome", value: outcome },
      ],
    });
  }

  if (outcome === "blocked_conflict") {
    const ops = renderClaimConflictOpsEmail({
      companyName: company.name,
      claimant: gate.actor,
      claimId: result.id,
      riskFlags: decision.riskFlags,
      adminUrl: `${baseUrl}/dashboard/admin`,
      profileUrl,
    });
    await sendTransactionalEmail({
      to: opsEmail(),
      subject: ops.subject,
      html: ops.html,
      tags: [{ name: "category", value: "claim_conflict_audit" }],
    });
  }

  if (
    outcome === "verified_representative" ||
    outcome === "verified_controller"
  ) {
    const attribution = getClaimAttribution(result.id);
    if (attribution?.inviteCode) {
      try {
        await processReferralRewardEvent({
          event: "profile_claimed",
          inviteCode: attribution.inviteCode,
          inviteeOrganisationId: attribution.organisationId,
          allowDemoFallback: true,
        });
      } catch (error) {
        console.warn("[claims] referral reward failed", error);
      }
    }
  }

  return {
    ok: true as const,
    id: result.id,
    outcome,
    companySlug: company.slug,
    companyName: company.name,
    message: outcomeCustomerMessage(outcome, company.name),
    reason: decision.reason,
    demo: result.demo,
  };
}
