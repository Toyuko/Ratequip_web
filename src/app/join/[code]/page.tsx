import Link from "next/link";
import { InviteReplyPanel } from "@/components/referrals/invite-reply-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveReferralCode } from "@/lib/actions/referrals";
import {
  invitationReasonExplanation,
  INVITATION_REASON_LABELS,
} from "@/lib/referrals/invitation-reasons";
import { referralCopy } from "@/lib/referrals/share";
import type { ReferralKind } from "@/lib/referrals/types";

export const metadata = { title: "Your RateQuip invitation" };

const KIND_CTAS: Record<
  ReferralKind,
  {
    primaryHref: (code: string) => string;
    primaryLabel: (org: string) => string;
    secondaryHref: string;
    secondaryLabel: string;
  }
> = {
  join_platform: {
    primaryHref: (code) => `/sign-up?ref=${code}`,
    primaryLabel: (org) => `Accept ${org}'s invitation & explore RateQuip`,
    secondaryHref: "/sign-in",
    secondaryLabel: "Already on RateQuip? Sign in",
  },
  join_company: {
    primaryHref: (code) => `/sign-up?ref=${code}&intent=join_company`,
    primaryLabel: (org) => `Join ${org} on RateQuip`,
    secondaryHref: "/onboarding",
    secondaryLabel: "Continue onboarding",
  },
  refer_company: {
    primaryHref: (code) => `/companies/search?ref=${code}`,
    primaryLabel: () => "Claim your free company profile",
    secondaryHref: "/companies/claim",
    secondaryLabel: "Open claim form",
  },
  refer_contractor: {
    primaryHref: (code) => `/sign-up?ref=${code}&role=contractor`,
    primaryLabel: () => "Join as a service provider",
    secondaryHref: "/onboarding",
    secondaryLabel: "Start onboarding",
  },
};

export default async function JoinReferralPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const { code: rawCode } = await params;
  const sp = await searchParams;
  const result = await resolveReferralCode(rawCode);

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--rq-ink)]">
          Invite not found
        </h1>
        <p className="mt-2 text-[var(--rq-slate)]">{result.message}</p>
        <Button asChild className="mt-6">
          <Link href="/sign-up">Create an account</Link>
        </Button>
      </div>
    );
  }

  const invite = result.invite;
  const kind =
    (sp.kind as ReferralKind | undefined) &&
    ["join_platform", "join_company", "refer_company", "refer_contractor"].includes(
      sp.kind!,
    )
      ? (sp.kind as ReferralKind)
      : invite.kind;

  const fromOrg = invite.companyName || invite.inviterOrg || "your partner";
  const fromPerson =
    invite.inviterName && !invite.inviterName.includes("@")
      ? invite.inviterName
      : fromOrg;

  const copy = referralCopy(kind, {
    inviterName: invite.inviterName,
    inviterOrg: invite.inviterOrg,
    companyName: invite.companyName,
    invitationReason: invite.invitationReason,
  });
  const cta = KIND_CTAS[kind];
  const reasonLabel = invite.invitationReason
    ? INVITATION_REASON_LABELS[invite.invitationReason]
    : null;
  const belief = invitationReasonExplanation(
    invite.invitationReason,
    fromOrg,
  );
  const joinKey = invite.token || invite.code;
  const canReply = Boolean(invite.canReplyToInviter);

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <Badge variant="orange">Opportunity invitation</Badge>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--rq-ink)]">
        {copy.title}
      </h1>
      <p className="mt-3 text-[var(--rq-slate)]">{belief}</p>

      <div
        id="why"
        className="mt-6 rounded-lg border border-[var(--rq-border)] border-l-4 border-l-[var(--rq-orange)] bg-[var(--rq-card)] px-4 py-4"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--rq-orange)]">
          {reasonLabel
            ? `Why ${fromOrg} invited you · ${reasonLabel}`
            : `Why ${fromOrg} invited you`}
        </p>
        {invite.personalNote ? (
          <>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
              Personal message from {fromPerson}
            </p>
            <p className="mt-2 text-base italic text-[var(--rq-ink)]">
              “{invite.personalNote}”
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-[var(--rq-slate)]">{belief}</p>
        )}
        <p className="mt-3 text-sm text-[var(--rq-slate)]">
          This is a business introduction from {fromOrg} — not a random account
          activation. They want to connect with you through RateQuip.
        </p>
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
          What is RateQuip?
        </h2>
        <p className="text-sm leading-relaxed text-[var(--rq-slate)]">
          RateQuip is a B2B equipment and industry platform designed to connect
          buyers, suppliers, manufacturers and industry partners — helping
          businesses discover equipment, receive relevant opportunities, respond
          to enquiries/RFQs, build industry connections and generate new
          business.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-[var(--rq-ink)]">Why join?</h2>
        <ul className="space-y-2 text-sm text-[var(--rq-slate)]">
          <li>✓ Claim and manage your company profile</li>
          <li>✓ Showcase your products, equipment and capabilities</li>
          <li>✓ Connect with {fromOrg} and other industry businesses</li>
          <li>✓ Receive relevant customer enquiries and RFQs</li>
          <li>✓ Discover potential referral and partnership opportunities</li>
          <li>✓ Build visibility with buyers looking for equipment and solutions</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg">
          <Link href={cta.primaryHref(joinKey)}>
            {cta.primaryLabel(fromOrg)}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={cta.secondaryHref}>{cta.secondaryLabel}</Link>
        </Button>
      </div>

      <div className="mt-8">
        <InviteReplyPanel
          inviteCode={joinKey}
          orgLabel={fromOrg}
          canReply={canReply}
        />
      </div>

      <p className="mt-6 text-xs text-[var(--rq-muted)]">
        Valid invite
        {invite.emailMasked ? ` for ${invite.emailMasked}` : ""}. No sign-up is
        required to read why you were invited or to send {fromOrg} a quick
        question.
      </p>
    </div>
  );
}
