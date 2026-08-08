"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getClaimInvitation } from "@/lib/actions/organic-growth";
import { getInviteRewardConfig } from "@/lib/actions/referrals";
import {
  claimRewardCtaLabel,
  WELCOME_CREDIT_USES,
  WELCOME_CREDIT_USES_INTRO,
} from "@/lib/referrals/invite-rewards";

type ClaimView = {
  companyName?: string;
  companySlug?: string;
  locality?: string;
  countryCode?: string;
  domain?: string;
  invitationState: string;
  emailMasked: string;
  inviterDisplay: string;
};

export default function ClaimTokenPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<ClaimView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [welcomeCredits, setWelcomeCredits] = useState(250);
  const [founding, setFounding] = useState(true);

  useEffect(() => {
    void (async () => {
      const [result, rewards] = await Promise.all([
        getClaimInvitation(params.token),
        getInviteRewardConfig(),
      ]);
      if (rewards.ok) {
        setWelcomeCredits(rewards.settings.welcomeCredits);
        setFounding(rewards.settings.foundingMemberEnabled);
      }
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setData(result);
    })();
  }, [params.token]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
          Invitation unavailable
        </h1>
        <p className="mt-3 text-[var(--rq-slate)]">{error}</p>
        <p className="mt-2 text-sm text-[var(--rq-muted)]">
          Tokens expire and may be cancelled. Request a new link from the person
          who added the company, or contact support.
        </p>
        <Button asChild className="mt-6">
          <Link href="/contact">Contact support</Link>
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-[var(--rq-muted)]">
        Loading invitation…
      </div>
    );
  }

  const company = data.companyName || "this company";
  const inviter = data.inviterDisplay || "A RateQuip partner";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="warning">Opportunity invitation</Badge>
        {founding && welcomeCredits > 0 ? (
          <Badge variant="success">Founding Member</Badge>
        ) : null}
      </div>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        {company} was introduced on RateQuip
      </h1>
      <p className="mt-3 text-[var(--rq-slate)]">
        {inviter} added {company} so buyers and industry partners can discover
        the business — a deliberate introduction, not a random listing.
      </p>

      {welcomeCredits > 0 ? (
        <div className="mt-6 rounded-xl border-2 border-[var(--rq-orange-deep)] bg-orange-50 px-5 py-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--rq-orange-deep)]">
            Progressive credit path · pending verification
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-[var(--rq-ink)]">
            Claim this profile to unlock {welcomeCredits} RateQuip Credits after
            verification
          </p>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            A real platform benefit once your claim is verified — spend credits
            on visibility and growth tools on RateQuip.
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--rq-ink)]">
            {WELCOME_CREDIT_USES_INTRO}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-[var(--rq-slate)]">
            {WELCOME_CREDIT_USES.map((use) => (
              <li key={use}>✓ {use}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 rounded-lg border border-[var(--rq-border)] border-l-4 border-l-[var(--rq-orange)] bg-[var(--rq-card)] px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--rq-orange)]">
          Why you received this
        </p>
        <p className="mt-2 text-sm text-[var(--rq-slate)]">
          The profile is currently unclaimed. If you represent {company}, claim
          it free, control how buyers see you, and start unlocking opportunities
          on RateQuip.
        </p>
      </div>

      <dl className="mt-8 space-y-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 text-sm">
        <div className="flex gap-3">
          <dt className="w-28 text-[var(--rq-muted)]">Company</dt>
          <dd className="font-medium text-[var(--rq-ink)]">{data.companyName}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-28 text-[var(--rq-muted)]">Location</dt>
          <dd>
            {[data.locality, data.countryCode].filter(Boolean).join(", ") || "—"}
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-28 text-[var(--rq-muted)]">Domain</dt>
          <dd>{data.domain || "—"}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-28 text-[var(--rq-muted)]">Invited as</dt>
          <dd>{data.emailMasked}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-28 text-[var(--rq-muted)]">Added by</dt>
          <dd>{inviter}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-28 text-[var(--rq-muted)]">Status</dt>
          <dd>
            <Badge variant="muted">{data.invitationState}</Badge>
          </dd>
        </div>
      </dl>

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
        <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
          What you gain by claiming
        </h2>
        <ul className="space-y-2 text-sm text-[var(--rq-slate)]">
          <li>✓ Claim and manage your company profile</li>
          <li>✓ Showcase products, equipment and capabilities</li>
          <li>✓ Connect with buyers and industry partners</li>
          <li>✓ Receive relevant customer enquiries and RFQs</li>
          <li>✓ Discover referral and partnership opportunities</li>
          <li>✓ Build visibility with buyers looking for solutions</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link
            href={`/companies/claim?company=${data.companySlug ?? ""}&token=${params.token}`}
          >
            {claimRewardCtaLabel(company, welcomeCredits)}
          </Link>
        </Button>
        {data.companySlug ? (
          <Button asChild variant="outline" size="lg">
            <Link href={`/companies/${data.companySlug}`}>
              View public profile (no claim required)
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href={`/email/preferences/${params.token}`}>
            This is not my company
          </Link>
        </Button>
      </div>

      <p className="mt-6 text-xs text-[var(--rq-muted)]">
        Possession of this link proves invitation access — not company authority.
        RateQuip will verify your email and authority before granting access.
      </p>
    </div>
  );
}
