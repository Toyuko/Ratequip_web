import { publicAppUrl } from "@/lib/config";
import type { ReferralKind, ReferralShareBundle } from "./types";

function appBaseUrl() {
  return publicAppUrl();
}

export function buildJoinUrl(code: string, kind?: ReferralKind) {
  const base = `${appBaseUrl()}/join/${encodeURIComponent(code)}`;
  return kind ? `${base}?kind=${kind}` : base;
}

export function buildSignUpUrl(code: string) {
  return `${appBaseUrl()}/sign-up?ref=${encodeURIComponent(code)}`;
}

export function referralCopy(kind: ReferralKind, opts?: {
  inviterName?: string;
  inviterOrg?: string;
  companyName?: string;
}) {
  const who = opts?.inviterName?.trim() || "A RateQuip partner";
  const org = opts?.inviterOrg?.trim();
  const company = opts?.companyName?.trim();
  const orgOrCompany = company || org;
  const fromLabel = orgOrCompany || who;

  switch (kind) {
    case "join_company":
      return {
        title: `Join ${orgOrCompany || "our team"} on RateQuip`,
        text: `${who} invited you to join ${orgOrCompany || "their organisation"} on RateQuip — the industrial network where teams rate suppliers, compare options, connect with partners, and grow pipeline together.`,
        emailSubject: `${fromLabel} invited you to join their team on RateQuip`,
      };
    case "refer_company":
      return {
        title: company
          ? `${company} was referred to RateQuip — claim it free`
          : "Your company was referred to RateQuip",
        text: company
          ? `${who} referred ${company} to RateQuip so you can claim the profile free, get discovered by industrial buyers, and turn reputation into real opportunities — not just RFQs.`
          : `${who} thinks your company belongs on RateQuip — claim a free profile, get discovered by buyers, and grow with trusted industrial partners.`,
        emailSubject: company
          ? `${who} referred ${company} to RateQuip — claim your free profile`
          : `${who} referred your company to RateQuip — claim your free profile`,
      };
    case "refer_contractor":
      return {
        title: "You're invited to join RateQuip as a service provider",
        text: `${who} referred you as a contractor / service provider on RateQuip. Create your profile, get matched to installation, maintenance and project work, and grow alongside industrial buyers who already trust the network.`,
        emailSubject: `${fromLabel} invited you to RateQuip as a contractor — see the opportunity`,
      };
    case "join_platform":
    default:
      return {
        title: orgOrCompany
          ? `${orgOrCompany} invited you to RateQuip`
          : `${who} invited you to RateQuip`,
        text: orgOrCompany
          ? `${orgOrCompany} invited you to RateQuip — claim your free company profile, get discovered by industrial buyers, rate and compare suppliers, and grow real opportunities with partners who already trust the network.`
          : `${who}${org ? ` at ${org}` : ""} invited you to RateQuip — claim your free company profile, get discovered by industrial buyers, rate and compare suppliers, and grow real opportunities together.`,
        emailSubject: orgOrCompany
          ? `${orgOrCompany} invited you to RateQuip — see why`
          : `${who} invited you to RateQuip — see why`,
      };
  }
}

export function buildShareBundle(input: {
  code: string;
  /** Prefer signed token so /join works across serverless instances. */
  token?: string;
  kind: ReferralKind;
  inviterName?: string;
  inviterOrg?: string;
  companyName?: string;
  personalNote?: string;
}): ReferralShareBundle {
  const joinKey = input.token || input.code;
  const joinUrl = buildJoinUrl(joinKey, input.kind);
  const signUpUrl = buildSignUpUrl(input.code);
  const copy = referralCopy(input.kind, input);
  const note = input.personalNote?.trim()
    ? `\n\nWhy they invited you:\n“${input.personalNote.trim()}”`
    : "";
  const text = `${copy.text}${note}\n\n${joinUrl}`;
  const emailBody = `${copy.text}${note}\n\nAccept the invite (free):\n${joinUrl}\n\nOr create an account:\n${signUpUrl}\n\n— RateQuip · Rate · Compare · Connect · Grow`;

  return {
    code: input.code,
    token: input.token,
    joinUrl,
    signUpUrl,
    title: copy.title,
    text,
    emailSubject: copy.emailSubject,
    emailBody,
    linkedInUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(joinUrl)}`,
    xUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(copy.text)}&url=${encodeURIComponent(joinUrl)}`,
    whatsAppUrl: `https://wa.me/?text=${encodeURIComponent(text)}`,
    facebookUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(joinUrl)}`,
    mailtoUrl: `mailto:?subject=${encodeURIComponent(copy.emailSubject)}&body=${encodeURIComponent(emailBody)}`,
  };
}
