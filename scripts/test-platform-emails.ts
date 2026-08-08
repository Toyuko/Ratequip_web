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
import { createEmailInvite, markInviteSent } from "../src/lib/referrals/store";
import { buildShareBundle } from "../src/lib/referrals/share";
import { renderJoinInviteEmail } from "../src/lib/referrals/join-invite-email";
import { sendTransactionalEmail } from "../src/lib/email";

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
    inviterDisplay: "A RateQuip user",
    personalNote: "Platform email test — claim invitation with a live claim link.",
  });

  const invite = createEmailInvite({
    kind: "join_platform",
    email: to.includes("@") ? to : "delivered@resend.dev",
    recipientName: "Email Tester",
    companyName,
    personalNote: "Platform email test — referral invite with a live join link.",
    inviterName: "RateQuip Ops",
    inviterOrg: "RateQuip",
  });
  const sentInvite = markInviteSent(invite.id) ?? invite;
  const share = buildShareBundle({
    code: sentInvite.code,
    token: sentInvite.token,
    kind: sentInvite.kind,
    inviterName: "RateQuip Ops",
    inviterOrg: "RateQuip",
    companyName,
    personalNote: "Platform email test — referral invite with a live join link.",
  });

  // Force production host so the signed token opens on the deployed app.
  const joinUrl = `${baseUrl}/join/${encodeURIComponent(sentInvite.token)}`;
  const signUpUrl = `${baseUrl}/sign-up?ref=${encodeURIComponent(sentInvite.token)}`;

  const referral = renderJoinInviteEmail({
    kindLabel: "Platform invite",
    title: `${companyName} invited you to RateQuip`,
    body: "Join RateQuip to claim your company profile and respond to RFQs.",
    joinUrl,
    signUpUrl,
    inviterName: "RateQuip Ops",
    companyName,
    personalNote: "Platform email test — referral invite with a live join link.",
    supportUrl: `${baseUrl}/contact`,
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
      subject: `[TEST] We received your claim for ${companyName}`,
      html: `
        <div style="font-family:Montserrat,Arial,sans-serif;color:#0f172a;line-height:1.5">
          <p>Thanks — your company profile claim is queued for review.</p>
          <p>Company: <strong>${companyName}</strong></p>
          <p><a href="${baseUrl}/companies/${companySlug}">View the public profile</a></p>
          <p><a href="${baseUrl}/companies/claim">Open claim form</a></p>
          <p>We will email you when the claim is approved or rejected.</p>
        </div>
      `.trim(),
      tag: "claim_submitted",
    },
    {
      name: "claim_ops_alert",
      subject: `[TEST] New company claim: ${companyName}`,
      html: `
        <div style="font-family:Montserrat,Arial,sans-serif;color:#0f172a;line-height:1.5">
          <p>A new company claim was submitted.</p>
          <p>Company: <strong>${companyName}</strong></p>
          <p>Claimant: tester@example.com</p>
          <p>Claim id: ${claimId}</p>
          <p>Notes: Platform email test evidence notes.</p>
          <p><a href="${baseUrl}/dashboard/admin">Open admin</a> · <a href="${baseUrl}/companies/${companySlug}">View profile</a></p>
        </div>
      `.trim(),
      tag: "claim_ops_alert",
    },
    {
      name: "claim_approved",
      subject: `[TEST] Your claim for ${companyName} was approved`,
      html: `
        <div style="font-family:Montserrat,Arial,sans-serif;color:#0f172a;line-height:1.5">
          <p>Your company profile claim for <strong>${companyName}</strong> was <strong>approved</strong>.</p>
          <p>You can manage the profile here: <a href="${baseUrl}/companies/${companySlug}">${baseUrl}/companies/${companySlug}</a></p>
        </div>
      `.trim(),
      tag: "claim_decision",
    },
    {
      name: "claim_rejected",
      subject: `[TEST] Update on your claim for ${companyName}`,
      html: `
        <div style="font-family:Montserrat,Arial,sans-serif;color:#0f172a;line-height:1.5">
          <p>Your company profile claim for <strong>${companyName}</strong> was <strong>rejected</strong>.</p>
          <p>If you believe this was in error, contact support via <a href="${baseUrl}/contact">${baseUrl}/contact</a>.</p>
        </div>
      `.trim(),
      tag: "claim_decision",
    },
    {
      name: "moderation_ops",
      subject: `[TEST] Moderation approved: claim`,
      html: `<p>claim ${claimId} (${companyName}) was approved by admin@ratequip.com.</p><p><a href="${baseUrl}/dashboard/admin">Open admin</a></p>`,
      tag: "moderation_ops",
    },
    {
      name: "quote_submitted",
      subject: `[TEST] New quote on RFQ ${requestId}`,
      html: `<p>A supplier submitted a quote of 12500 (14 days lead time).</p><p>Includes commissioning support.</p><p><a href="${baseUrl}/requests">View RFQs</a></p>`,
      tag: "quote_submitted",
    },
    {
      name: "referral_invite",
      subject: `[TEST] ${referral.subject}`,
      html: `${referral.html}<p style="color:#64748b;font-size:12px">Join URL: ${joinUrl}<br/>Share code: ${share.code}</p>`,
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
