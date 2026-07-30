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
    primaryLabel: "Create account",
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

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Badge variant="orange">Invite</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        {copy.title}
      </h1>
      <p className="mt-3 text-[var(--rq-slate)]">{copy.text}</p>

      {invite.personalNote ? (
        <blockquote className="mt-4 rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-3 text-sm italic text-[var(--rq-slate)]">
          “{invite.personalNote}”
        </blockquote>
      ) : null}

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
