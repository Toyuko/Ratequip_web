import Link from "next/link";
import { InviteReplyPanel } from "@/components/referrals/invite-reply-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveReferralCode } from "@/lib/actions/referrals";
import {
  hasAttachedOpportunity,
  invitationReasonExplanation,
  INVITATION_REASON_LABELS,
} from "@/lib/referrals/invitation-reasons";
import { CaptureReferralRef } from "@/components/referrals/capture-referral-ref";
import {
  getInviteRewardSettings,
  potentialWelcomeCredits,
  WELCOME_CREDIT_USES,
  WELCOME_CREDIT_USES_INTRO,
  welcomeRewardCtaLabel,
} from "@/lib/referrals/invite-rewards";
import { rewardLadderSummaryLines } from "@/lib/referrals/reward-ladder";
import { referralCopy } from "@/lib/referrals/share";
import type { ReferralKind } from "@/lib/referrals/types";
import { Suspense } from "react";

export const metadata = { title: "Your RateQuip invitation" };

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

  const defaults = getInviteRewardSettings();
  const welcomeCredits = invite.welcomeCredits ?? defaults.welcomeCredits;
  const inviterRewardCredits =
    invite.inviterRewardCredits ?? defaults.inviterRewardCredits;
  const potentialCredits = Math.max(
    welcomeCredits,
    potentialWelcomeCredits(defaults),
  );
  const ladderLines = rewardLadderSummaryLines(defaults.ladder);
  const founding =
    (invite.foundingMemberEligible ?? defaults.foundingMemberEnabled) &&
    welcomeCredits > 0;

  const fromOrg = invite.companyName || invite.inviterOrg || "your partner";
  const fromPerson =
    invite.inviterName && !invite.inviterName.includes("@")
      ? invite.inviterName
      : undefined;
  const whoLabel = fromPerson ? `${fromPerson} at ${fromOrg}` : fromOrg;

  const copy = referralCopy(kind, {
    inviterName: invite.inviterName,
    inviterOrg: invite.inviterOrg,
    companyName: invite.companyName,
    invitationReason: invite.invitationReason,
  });
  const reasonLabel = invite.invitationReason
    ? INVITATION_REASON_LABELS[invite.invitationReason]
    : null;
  const belief = invitationReasonExplanation(
    invite.invitationReason,
    fromOrg,
    fromPerson,
  );
  const attachedOpportunity = hasAttachedOpportunity({
    invitationReason: invite.invitationReason,
    opportunitySummary: invite.opportunitySummary,
  });
  const joinKey = invite.token || invite.code;
  const canReply = Boolean(invite.canReplyToInviter);
  const acceptHref =
    kind === "join_company"
      ? `/sign-up?ref=${joinKey}&intent=join_company`
      : kind === "refer_company"
        ? `/companies/search?ref=${joinKey}`
        : kind === "refer_contractor"
          ? `/sign-up?ref=${joinKey}&role=contractor`
          : `/sign-up?ref=${joinKey}`;

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <Suspense fallback={null}>
        <CaptureReferralRef code={joinKey} />
      </Suspense>
      <div className="flex flex-wrap gap-2">
        <Badge variant="orange">Industry network invitation</Badge>
        {founding ? <Badge variant="success">Founding Member</Badge> : null}
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--rq-ink)]">
        {copy.title}
      </h1>
      <p className="mt-3 text-[var(--rq-slate)]">
        <strong className="text-[var(--rq-ink)]">{whoLabel}</strong> wants to
        connect with you on RateQuip — a personal industry introduction from{" "}
        <strong className="text-[var(--rq-ink)]">{fromOrg}</strong>, not a
        platform marketing blast.
      </p>

      <div
        id="why"
        className="mt-6 rounded-lg border border-[var(--rq-border)] border-l-4 border-l-[var(--rq-orange)] bg-[var(--rq-card)] px-4 py-4"
      >
        {attachedOpportunity ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--rq-orange)]">
              Why {fromOrg} reached out · opportunity
            </p>
            <p className="mt-2 text-sm text-[var(--rq-ink)]">
              {invite.opportunitySummary?.trim() || belief}
            </p>
            <p className="mt-2 text-sm text-[var(--rq-slate)]">
              Accept the invite and you’ll immediately see the opportunity they
              opened for you.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--rq-orange)]">
              {reasonLabel
                ? `Why ${fromOrg} invited you · ${reasonLabel}`
                : `Why ${fromOrg} invited you`}
            </p>
            {invite.personalNote ? (
              <>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
                  Personal message from {whoLabel}
                </p>
                <p className="mt-2 text-base italic text-[var(--rq-ink)]">
                  “{invite.personalNote}”
                </p>
              </>
            ) : null}
            <p className="mt-2 text-sm text-[var(--rq-slate)]">{belief}</p>
          </>
        )}
      </div>

      {attachedOpportunity && invite.personalNote ? (
        <blockquote className="mt-4 rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-3 text-sm italic text-[var(--rq-ink)]">
          “{invite.personalNote}”
          <footer className="mt-1 text-xs not-italic text-[var(--rq-muted)]">
            — {whoLabel}
          </footer>
        </blockquote>
      ) : null}

      <div className="mt-6">
        <InviteReplyPanel
          inviteCode={joinKey}
          orgLabel={fromPerson || fromOrg}
          canReply={canReply}
        />
      </div>

      {welcomeCredits > 0 ? (
        <div className="mt-6 rounded-xl border-2 border-[var(--rq-orange-deep)] bg-gradient-to-br from-orange-50 to-amber-50 px-5 py-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--rq-orange-deep)]">
            {fromOrg} unlocked your RateQuip Welcome Reward
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-[var(--rq-ink)]">
            Accept this invitation and unlock {welcomeCredits} RateQuip Credits
          </p>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            A real platform benefit because {whoLabel} invited you — spend
            credits on visibility and growth tools once you’re in.
            {inviterRewardCredits > 0
              ? ` ${fromOrg} also earns ${inviterRewardCredits} credits when you claim and participate.`
              : ""}
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--rq-ink)]">
            {WELCOME_CREDIT_USES_INTRO}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-[var(--rq-slate)]">
            {WELCOME_CREDIT_USES.map((use) => (
              <li key={use}>✓ {use}</li>
            ))}
          </ul>
          {potentialCredits > welcomeCredits ? (
            <>
              <p className="mt-3 text-sm font-semibold text-[var(--rq-ink)]">
                Keep earning — up to {potentialCredits} credits as you verify
                and participate:
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--rq-slate)]">
                {ladderLines.map((line) => (
                  <li key={line}>✓ {line}</li>
                ))}
              </ul>
            </>
          ) : null}
          {founding ? (
            <p className="mt-3 text-sm font-semibold text-[var(--rq-ink)]">
              Early Member / Founding Member badge included for invited launch
              users.
            </p>
          ) : null}
        </div>
      ) : null}

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

      {welcomeCredits > 0 ? (
        <section className="mt-8 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-4">
          <h2 className="text-base font-semibold text-[var(--rq-ink)]">
            Grow with RateQuip
          </h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            Invite businesses you work with → they get a welcome benefit → you
            earn RateQuip Credits when they join and participate.
            {inviterRewardCredits > 0
              ? ` ${fromOrg} earns too (e.g. ${inviterRewardCredits} after you claim).`
              : ""}
          </p>
        </section>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg">
          <Link href={acceptHref}>
            {welcomeCredits > 0
              ? `Accept invite + claim ${welcomeCredits} free credits`
              : welcomeRewardCtaLabel(potentialCredits)}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="#ask-inviter">Ask {fromPerson || fromOrg} a question</Link>
        </Button>
      </div>

      <p className="mt-6 text-xs text-[var(--rq-muted)]">
        Valid invite
        {invite.emailMasked ? ` for ${invite.emailMasked}` : ""}. No sign-up is
        required to read why you were invited or to send {whoLabel} a quick
        question.
      </p>
    </div>
  );
}
