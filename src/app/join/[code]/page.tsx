import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveReferralCode } from "@/lib/actions/referrals";
import { referralCopy } from "@/lib/referrals/share";
import type { ReferralKind } from "@/lib/referrals/types";

export const metadata = { title: "Join RateQuip" };

const KIND_CTAS: Record<
  ReferralKind,
  {
    primaryHref: (code: string) => string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
  }
> = {
  join_platform: {
    primaryHref: (code) => `/sign-up?ref=${code}`,
    primaryLabel: "Accept invite — join free",
    secondaryHref: "/sign-in",
    secondaryLabel: "Sign in",
  },
  join_company: {
    primaryHref: (code) => `/sign-up?ref=${code}&intent=join_company`,
    primaryLabel: "Join organisation",
    secondaryHref: "/onboarding",
    secondaryLabel: "Continue onboarding",
  },
  refer_company: {
    primaryHref: (code) => `/companies/search?ref=${code}`,
    primaryLabel: "Find or add company",
    secondaryHref: "/companies/claim",
    secondaryLabel: "Claim a profile",
  },
  refer_contractor: {
    primaryHref: (code) => `/sign-up?ref=${code}&role=contractor`,
    primaryLabel: "Join as contractor",
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
  // Path params are decoded once by Next; keep raw for signed tokens (case-sensitive).
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

  const copy = referralCopy(kind, {
    inviterName: invite.inviterName,
    inviterOrg: invite.inviterOrg,
    companyName: invite.companyName,
  });
  const cta = KIND_CTAS[kind];

  const fromOrg = invite.companyName || invite.inviterOrg;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Badge variant="orange">Partner invite</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        {copy.title}
      </h1>
      <p className="mt-3 text-[var(--rq-slate)]">{copy.text}</p>

      <div className="mt-5 rounded-lg border border-[var(--rq-border)] border-l-4 border-l-[var(--rq-orange)] bg-[var(--rq-card)] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--rq-orange)]">
          Why {fromOrg || "they"} invited you
        </p>
        {invite.personalNote ? (
          <p className="mt-2 text-sm italic text-[var(--rq-ink)]">
            “{invite.personalNote}”
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            This is a deliberate invite to connect on RateQuip — claim your free
            profile, get discovered by industrial buyers, and grow opportunities
            with partners who already trust the network.
          </p>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-[var(--rq-slate)]">
        <li>✓ Free company profile you control</li>
        <li>✓ Get discovered by verified buyers and partners</li>
        <li>✓ Rate, compare and connect with trusted suppliers</li>
        <li>✓ Win more work through introductions and RFQs</li>
      </ul>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--rq-muted)]">
        {invite.inviterName ? <span>From {invite.inviterName}</span> : null}
        {invite.inviterOrg ? <span>· {invite.inviterOrg}</span> : null}
        {invite.companyName ? <span>· {invite.companyName}</span> : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={cta.primaryHref(invite.code)}>{cta.primaryLabel}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={cta.secondaryHref}>{cta.secondaryLabel}</Link>
        </Button>
      </div>

      <p className="mt-6 text-xs text-[var(--rq-muted)]">
        Valid invite
        {invite.emailMasked ? ` for ${invite.emailMasked}` : ""}. After you
        join, complete the AI company questionnaire so RateQuip can suggest
        relevant suppliers and partners.
      </p>
    </div>
  );
}
