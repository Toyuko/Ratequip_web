import { publicAppUrl } from "@/lib/config";
import {
  invitationReasonExplanation,
  INVITATION_REASON_LABELS,
  type InvitationReason,
} from "./invitation-reasons";
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

export function referralCopy(
  kind: ReferralKind,
  opts?: {
    inviterName?: string;
    inviterOrg?: string;
    companyName?: string;
    invitationReason?: InvitationReason;
  },
) {
  const who = opts?.inviterName?.trim() || "A RateQuip partner";
  const org = opts?.inviterOrg?.trim();
  const company = opts?.companyName?.trim();
  const orgOrCompany = company || org;
  const fromLabel = orgOrCompany || who;
  const reasonLine = opts?.invitationReason
    ? ` Reason: ${INVITATION_REASON_LABELS[opts.invitationReason]}.`
    : "";

  switch (kind) {
    case "join_company":
      return {
        title: `Join ${orgOrCompany || "our team"} on RateQuip`,
        text: `${who} invited you to join ${orgOrCompany || "their organisation"} on RateQuip — a B2B equipment and industry platform for discovering partners, receiving enquiries, building connections and growing business together.${reasonLine}`,
        emailSubject: `${fromLabel} invited you to join their team on RateQuip`,
      };
    case "refer_company":
      return {
        title: company
          ? `${company} was referred to RateQuip — claim it free`
          : "Your company was referred to RateQuip",
        text: company
          ? `${who} referred ${company} to RateQuip so you can claim the profile free, showcase capabilities, get discovered by buyers, and open partnership opportunities.${reasonLine}`
          : `${who} thinks your company belongs on RateQuip — claim a free profile, get discovered by buyers, and grow with trusted industry partners.${reasonLine}`,
        emailSubject: company
          ? `${who} referred ${company} to RateQuip — claim your free profile`
          : `${who} referred your company to RateQuip — claim your free profile`,
      };
    case "refer_contractor":
      return {
        title: "You're invited to join RateQuip as a service provider",
        text: `${who} referred you as a contractor / service provider on RateQuip. Create your profile, get matched to installation, maintenance and project work, and grow alongside industrial buyers.${reasonLine}`,
        emailSubject: `${fromLabel} invited you to RateQuip as a contractor`,
      };
    case "join_platform":
    default: {
      const belief = invitationReasonExplanation(
        opts?.invitationReason,
        orgOrCompany || who,
      );
      return {
        title: orgOrCompany
          ? `${orgOrCompany} has invited you to connect on RateQuip`
          : `${who} has invited you to connect on RateQuip`,
        text: belief,
        emailSubject: orgOrCompany
          ? `${orgOrCompany} has invited you to connect on RateQuip`
          : `${who} has invited you to connect on RateQuip`,
      };
    }
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
  invitationReason?: InvitationReason;
}): ReferralShareBundle {
  const joinKey = input.token || input.code;
  const joinUrl = buildJoinUrl(joinKey, input.kind);
  const signUpUrl = buildSignUpUrl(input.code);
  const copy = referralCopy(input.kind, input);
  const orgLabel =
    input.companyName?.trim() ||
    input.inviterOrg?.trim() ||
    input.inviterName?.trim() ||
    "your partner";
  const reason =
    input.invitationReason &&
    `\n\nInvitation reason: ${INVITATION_REASON_LABELS[input.invitationReason]}`;
  const note = input.personalNote?.trim()
    ? `\n\nPersonal message from ${orgLabel}:\n“${input.personalNote.trim()}”`
    : "";
  const text = `${copy.text}${reason || ""}${note}\n\nView why they invited you:\n${joinUrl}`;
  const emailBody = `${copy.text}${reason || ""}${note}\n\nAccept ${orgLabel}'s invitation:\n${signUpUrl}\n\nOr view why they invited you (no sign-up required):\n${joinUrl}\n\n— RateQuip · Rate · Compare · Connect · Grow`;

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
