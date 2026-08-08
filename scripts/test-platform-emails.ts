/**
 * Send one test email for each platform transactional function.
 *
 * Usage:
 *   npm run email:test:platform
 *   npm run email:test:platform -- you@example.com
 *
 * With onboarding@resend.dev, use delivered@resend.dev or your Resend account email.
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { publicAppUrl } from "../src/lib/config";
import { renderClaimInviteEmail } from "../src/lib/organic-growth/claim-invite-email";
import { renderJoinInviteEmail } from "../src/lib/referrals/join-invite-email";
import { sendTransactionalEmail } from "../src/lib/email";
import {
  emailLink,
  emailParagraph,
  renderEmailDocument,
} from "../src/lib/email-template";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const to =
  process.argv[2]?.trim() ||
  process.env.EMAIL_TEST_TO?.trim() ||
  "delivered@resend.dev";

const baseUrl = publicAppUrl();
const companySlug = "nordicfill-systems";
const companyName = "NordicFill Systems";
const claimId = "claim-test-001";
const requestId = "rfq-test-001";
const profileUrl = `${baseUrl}/companies/${companySlug}`;

type Case = {
  name: string;
  subject: string;
  html: string;
  tag: string;
};

function cases(): Case[] {
  const claimInvite = renderClaimInviteEmail({
    companyName,
    companyContext: "Stockholm · SE · nordicfill.example",
    profileUrl,
    claimUrl: `${baseUrl}/claim/test-token-demo`,
    expiresDate: "7 Sep 2026",
    reportOrCorrectUrl: `${baseUrl}/email/preferences/test-token-demo`,
    emailPreferencesUrl: `${baseUrl}/email/preferences/test-token-demo`,
    supportUrl: `${baseUrl}/contact`,
    recipientName: "Alex Supplier",
    inviterDisplay: "A RateQuip user",
    personalNote: "Platform email test — claim invitation.",
  });

  const referral = renderJoinInviteEmail({
    kindLabel: "Supplier invite",
    title: `${companyName} invited you to RateQuip`,
    body: "Join RateQuip to claim your company profile and respond to RFQs.",
    joinUrl: `${baseUrl}/join/test-code`,
    signUpUrl: `${baseUrl}/sign-up`,
    inviterName: "RateQuip Ops",
    companyName,
    personalNote: "Platform email test — referral invite.",
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
      html: renderEmailDocument({
        preheader: `Your claim for ${companyName} is queued for review.`,
        heading: "Claim received",
        bodyHtml: `
          ${emailParagraph("Thanks — your company profile claim is queued for review.")}
          ${emailParagraph(`Company: <strong style="color:#0F172A">${companyName}</strong>`)}
          ${emailParagraph("We will email you when the claim is approved or rejected.")}
        `.trim(),
        cta: { label: "View the public profile", href: profileUrl },
        footerNote: "Platform email test — claim submitted (claimer).",
      }),
      tag: "claim_submitted",
    },
    {
      name: "claim_ops_alert",
      subject: `[TEST] New company claim: ${companyName}`,
      html: renderEmailDocument({
        preheader: `New claim submitted for ${companyName}`,
        heading: "New company claim",
        bodyHtml: `
          ${emailParagraph("A new company claim was submitted.")}
          ${emailParagraph(`Company: <strong style="color:#0F172A">${companyName}</strong>`)}
          ${emailParagraph("Claimant: tester@example.com")}
          ${emailParagraph(`Claim id: ${claimId}`)}
          ${emailParagraph("Notes: Platform email test evidence notes.")}
          ${emailParagraph(
            `${emailLink(`${baseUrl}/dashboard/admin`, "Open admin")} · ${emailLink(profileUrl, "View profile")}`,
          )}
        `.trim(),
        cta: { label: "Open admin", href: `${baseUrl}/dashboard/admin` },
      }),
      tag: "claim_ops_alert",
    },
    {
      name: "claim_approved",
      subject: `[TEST] Your claim for ${companyName} was approved`,
      html: renderEmailDocument({
        preheader: `Your claim for ${companyName} was approved.`,
        heading: "Claim approved",
        bodyHtml: `
          ${emailParagraph(
            `Your company profile claim for <strong style="color:#0F172A">${companyName}</strong> was <strong style="color:#0F172A">approved</strong>.`,
          )}
          ${emailParagraph(
            `You can manage the profile here: ${emailLink(profileUrl, "Open company profile")}`,
          )}
        `.trim(),
        cta: { label: "Manage profile", href: profileUrl },
        footerNote: "Platform email test — claim approved.",
      }),
      tag: "claim_decision",
    },
    {
      name: "claim_rejected",
      subject: `[TEST] Update on your claim for ${companyName}`,
      html: renderEmailDocument({
        preheader: `Your claim for ${companyName} was rejected.`,
        heading: "Claim update",
        bodyHtml: `
          ${emailParagraph(
            `Your company profile claim for <strong style="color:#0F172A">${companyName}</strong> was <strong style="color:#0F172A">rejected</strong>.`,
          )}
          ${emailParagraph(
            `If you believe this was in error, contact support via ${emailLink(`${baseUrl}/contact`, "Contact")}.`,
          )}
        `.trim(),
        cta: { label: "Contact support", href: `${baseUrl}/contact` },
        footerNote: "Platform email test — claim rejected.",
      }),
      tag: "claim_decision",
    },
    {
      name: "moderation_ops",
      subject: `[TEST] Moderation approved: claim`,
      html: renderEmailDocument({
        preheader: `claim ${claimId} was approved`,
        heading: "Moderation approved",
        bodyHtml: emailParagraph(
          `claim ${claimId} (${companyName}) was approved by admin@ratequip.com.`,
        ),
        cta: { label: "Open admin", href: `${baseUrl}/admin` },
        footerNote: "Platform email test — moderation ops.",
      }),
      tag: "moderation_ops",
    },
    {
      name: "quote_submitted",
      subject: `[TEST] New quote on RFQ ${requestId}`,
      html: renderEmailDocument({
        preheader: `New quote of 12500 on RFQ ${requestId}`,
        heading: "New quote received",
        bodyHtml: `
          ${emailParagraph(
            'A supplier submitted a quote of <strong style="color:#0F172A">12500</strong> (14 days lead time).',
          )}
          ${emailParagraph("Includes commissioning support.")}
        `.trim(),
        cta: { label: "View RFQ", href: `${baseUrl}/requests/${requestId}` },
        footerNote: "Platform email test — quote submitted.",
      }),
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
  if (fail > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
