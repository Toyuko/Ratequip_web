import type { ReferralKind, ReferralShareBundle } from "./types";

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
  const who = opts?.inviterName?.trim() || "A RateQuip user";
  const org = opts?.inviterOrg?.trim();
  const company = opts?.companyName?.trim();

  switch (kind) {
    case "join_company":
      return {
        title: `Join ${org || company || "our team"} on RateQuip`,
        text: `${who} invited you to join ${org || company || "their organisation"} on RateQuip — industrial procurement, supplier reputation and RFQs in one place.`,
        emailSubject: `You're invited to join ${org || company || "a team"} on RateQuip`,
      };
    case "refer_company":
      return {
        title: company
          ? `Claim ${company} on RateQuip`
          : "Add your company on RateQuip",
        text: company
          ? `${who} referred ${company} to RateQuip. Claim the profile free and start winning RFQs from verified buyers.`
          : `${who} thinks your company should be on RateQuip — claim a profile free and get discovered by industrial buyers.`,
        emailSubject: company
          ? `${company} was referred to RateQuip`
          : "Your company was referred to RateQuip",
      };
    case "refer_contractor":
      return {
        title: "Join RateQuip as a service provider",
        text: `${who} referred you as a contractor / service provider on RateQuip. Create your profile and get matched to installation, maintenance and project work.`,
        emailSubject: "You're invited to join RateQuip as a contractor",
      };
    case "join_platform":
    default:
      return {
        title: "Join me on RateQuip",
        text: `${who}${org ? ` at ${org}` : ""} invited you to RateQuip — trusted industrial company reputation, RFQs and supplier matching.`,
        emailSubject: "You're invited to join RateQuip",
      };
  }
}

export function buildShareBundle(input: {
  code: string;
  kind: ReferralKind;
  inviterName?: string;
  inviterOrg?: string;
  companyName?: string;
  personalNote?: string;
}): ReferralShareBundle {
  const joinUrl = buildJoinUrl(input.code, input.kind);
  const signUpUrl = buildSignUpUrl(input.code);
  const copy = referralCopy(input.kind, input);
  const note = input.personalNote?.trim()
    ? `\n\n“${input.personalNote.trim()}”`
    : "";
  const text = `${copy.text}${note}\n\n${joinUrl}`;
  const emailBody = `${copy.text}${note}\n\nAccept the invite:\n${joinUrl}\n\nOr create an account:\n${signUpUrl}\n\n— RateQuip`;

  return {
    code: input.code,
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
