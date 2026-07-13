"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getClaimInvitation } from "@/lib/actions/organic-growth";

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

  useEffect(() => {
    void (async () => {
      const result = await getClaimInvitation(params.token);
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Badge variant="warning">Claim invitation</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Claim {data.companyName}
      </h1>
      <p className="mt-3 text-[var(--rq-slate)]">
        {data.inviterDisplay} added this company to RateQuip. The profile is
        currently unclaimed. Possession of this link proves invitation access —
        not company authority.
      </p>

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
          <dt className="w-28 text-[var(--rq-muted)]">Status</dt>
          <dd>
            <Badge variant="muted">{data.invitationState}</Badge>
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link
            href={`/companies/claim?company=${data.companySlug ?? ""}&token=${params.token}`}
          >
            Claim this company
          </Link>
        </Button>
        {data.companySlug ? (
          <Button asChild variant="outline">
            <Link href={`/companies/${data.companySlug}`}>View public profile</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href={`/email/preferences/${params.token}`}>
            This is not my company
          </Link>
        </Button>
      </div>
    </div>
  );
}
