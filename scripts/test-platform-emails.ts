/**
 * Send one test email for each platform transactional function,
 * using real signed invite tokens and live production deep-links.
 *
 * Usage:
 *   npm run email:test:platform
 *   npm run email:test:platform -- you@example.com
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { mintClaimInviteToken } from "../src/lib/organic-growth/claim-token";
import { renderClaimInviteEmail } from "../src/lib/organic-growth/claim-invite-email";
import {
  renderClaimDecisionEmail,
  renderClaimOpsAlertEmail,
  renderClaimSubmittedEmail,
} from "../src/lib/organic-growth/claim-lifecycle-emails";
import { renderQuoteSubmittedEmail } from "../src/lib/marketplace/quote-email";
import { createEmailInvite, markInviteSent } from "../src/lib/referrals/store";
import { renderJoinInviteEmail } from "../src/lib/referrals/join-invite-email";
import { sendTransactionalEmail } from "../src/lib/email";
import {
  emailParagraph,
  renderEmailDocument,
} from "../src/lib/email-template";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const to =
  process.argv[2]?.trim() ||
  process.env.EMAIL_TEST_TO?.trim() ||
  "delivered@resend.dev";

// Prefer a public host so email CTAs open the deployed app (not localhost).
const configuredBase =
  process.env.EMAIL_TEST_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "";
const baseUrl = (
  !configuredBase ||
  configuredBase.includes("localhost") ||
  configuredBase.includes("127.0.0.1")
    ? "https://ratequip-web.vercel.app"
    : configuredBase
).replace(/\/$/, "");

const companySlug = "nordicfill-systems";
const companyName = "NordicFill Systems";
const claimId = "claim-test-001";
const requestId = "rfq-test-001";

type Case = {
  name: string;
  subject: string;
  html: string;
  tag: string;
};

function cases(): Case[] {
  const claimToken = mintClaimInviteToken({
    invitationId: "inv-email-test",
    submissionId: "sub-email-test",
    companyName,
    companySlug,
    locality: "Malmö",
    countryCode: "SE",
    domain: "nordicfill.example",
    emailMasked: "te***@example.com",
    inviterDisplay: "A RateQuip user",
    invitationState: "sent",
  });

  const claimInvite = renderClaimInviteEmail({
    companyName,
    companyContext: "Malmö · SE · nordicfill.example",
    profileUrl: `${baseUrl}/companies/${companySlug}`,
    claimUrl: `${baseUrl}/claim/${claimToken}`,
    expiresDate: "7 Sep 2026",
    reportOrCorrectUrl: `${baseUrl}/email/preferences/${encodeURIComponent(claimToken)}`,
    emailPreferencesUrl: `${baseUrl}/email/preferences/${encodeURIComponent(claimToken)}`,
    supportUrl: `${baseUrl}/contact`,
    recipientName: "Alex Supplier",
    inviterDisplay: "Jordan Lee at PackLine Nordic",
    personalNote:
      "Hi Alex — we added NordicFill so buyers in our network can find you on RateQuip. Claim the free profile and take a look at the opportunities.",
  });

  const invite = createEmailInvite({
    kind: "join_platform",
    email: to.includes("@") ? to : "delivered@resend.dev",
    recipientName: "Email Tester",
    companyName,
    invitationReason: "industry_connection",
    personalNote:
      "Hi — we thought your business would be a good fit for the RateQuip network and we’d like to connect with you there. We’ve sent this invitation so you can take a look at the platform and the opportunities available.",
    inviterName: "Alex Bergman",
    inviterOrg: companyName,
    inviterEmail: "ops@ratequip.com",
    welcomeCredits: 250,
    inviterRewardCredits: 50,
    foundingMemberEligible: true,
  });
  const sentInvite = markInviteSent(invite.id) ?? invite;

  // Force production host so the signed token opens on the deployed app.
  const joinUrl = `${baseUrl}/join/${encodeURIComponent(sentInvite.token)}`;
  const signUpUrl = `${baseUrl}/sign-up?ref=${encodeURIComponent(sentInvite.token)}`;

  const referral = renderJoinInviteEmail({
    kindLabel: "Partner invite",
    title: `${companyName} has invited you to connect on RateQuip`,
    joinUrl,
    signUpUrl,
    inviterName: "Alex Bergman",
    inviterOrg: companyName,
    companyName,
    invitationReason: "industry_connection",
    personalNote:
      "Hi — we thought your business would be a good fit for the RateQuip network and we’d like to connect with you there. We’ve sent this invitation so you can take a look at the platform and the opportunities available.",
    recipientName: "Email Tester",
    welcomeCredits: 250,
    inviterRewardCredits: 50,
    foundingMemberEligible: true,
    supportUrl: `${baseUrl}/contact`,
  });

  const profileUrl = `${baseUrl}/companies/${companySlug}`;
  const adminUrl = `${baseUrl}/dashboard/admin`;

  const claimSubmitted = renderClaimSubmittedEmail({
    companyName,
    profileUrl,
    claimFormUrl: `${baseUrl}/companies/claim`,
  });
  const claimOps = renderClaimOpsAlertEmail({
    companyName,
    claimant: "tester@example.com",
    claimId,
    notes: "Platform email test evidence notes.",
    adminUrl,
    profileUrl,
  });
  const claimApproved = renderClaimDecisionEmail({
    companyName,
    approved: true,
    profileUrl,
    supportUrl: `${baseUrl}/contact`,
  });
  const claimRejected = renderClaimDecisionEmail({
    companyName,
    approved: false,
    profileUrl,
    supportUrl: `${baseUrl}/contact`,
  });
  const quoteEmail = renderQuoteSubmittedEmail({
    requestId,
    amount: 12500,
    leadTimeDays: 14,
    notes: "Includes commissioning support.",
    requestUrl: `${baseUrl}/requests/${requestId}`,
    supplierLabel: "NordicFill Systems",
  });

  return [
    {
      name: "claim_invite",
      subject: `[TEST] ${claimInvite.subject}`,
      html: claimInvite.html,
      tag: "claim_invite",
    },
    {
      name: "claim_submitted_claimer",
      subject: `[TEST] ${claimSubmitted.subject}`,
      html: claimSubmitted.html,
      tag: "claim_submitted",
    },
    {
      name: "claim_ops_alert",
      subject: `[TEST] ${claimOps.subject}`,
      html: claimOps.html,
      tag: "claim_ops_alert",
    },
    {
      name: "claim_approved",
      subject: `[TEST] ${claimApproved.subject}`,
      html: claimApproved.html,
      tag: "claim_decision",
    },
    {
      name: "claim_rejected",
      subject: `[TEST] ${claimRejected.subject}`,
      html: claimRejected.html,
      tag: "claim_decision",
    },
    {
      name: "moderation_ops",
      subject: `[TEST] Moderation approved: claim · ${companyName}`,
      html: renderEmailDocument({
        preheader: `claim for ${companyName} was approved`,
        heading: "Moderation approved",
        bodyHtml: `
          ${emailParagraph(
            `<strong style="color:#0F172A">claim</strong> ${claimId} (<strong style="color:#0F172A">${companyName}</strong>) was <strong style="color:#0F172A">approved</strong> by admin@ratequip.com.`,
          )}
          ${emailParagraph(
            "If this was a company claim, the business can now manage their profile and get discovered on RateQuip.",
          )}
        `.trim(),
        cta: { label: "Open admin", href: adminUrl },
      }),
      tag: "moderation_ops",
    },
    {
      name: "quote_submitted",
      subject: `[TEST] ${quoteEmail.subject}`,
      html: quoteEmail.html,
      tag: "quote_submitted",
    },
    {
      name: "referral_invite",
      subject: `[TEST] ${referral.subject}`,
      html: referral.html,
      tag: "referral_invite",
    },
  ];
}

async function main() {
  console.log("RateQuip platform email function tests");
  console.log("--------------------------------------");
  console.log(`To: ${to}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`From: ${process.env.RESEND_FROM_EMAIL ?? "(default)"}`);
  console.log(`API key: ${process.env.RESEND_API_KEY ? "set" : "MISSING"}`);
  console.log("");

  if (!process.env.RESEND_API_KEY?.trim()) {
    console.error("FAIL: RESEND_API_KEY missing");
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;

  for (const c of cases()) {
    const result = await sendTransactionalEmail({
      to,
      subject: c.subject,
      html: c.html,
      tags: [
        { name: "category", value: c.tag.slice(0, 256) },
        { name: "suite", value: "platform_email_test" },
      ],
    });

    if (result.ok) {
      ok += 1;
      console.log(`OK  ${c.name.padEnd(24)} id=${result.id}${result.demo ? " (demo)" : ""}`);
    } else {
      fail += 1;
      console.error(`FAIL ${c.name.padEnd(23)} ${result.error}`);
    }
  }

  console.log("");
  console.log(`Done: ${ok} sent, ${fail} failed`);
  console.log("Claim and join links in this batch use signed tokens that work on production.");
  if (fail > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
