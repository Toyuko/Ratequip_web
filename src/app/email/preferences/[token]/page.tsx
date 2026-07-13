"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function EmailPreferencesPage() {
  const params = useParams<{ token: string }>();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Email preferences
      </h1>
      <p className="mt-3 text-[var(--rq-slate)]">
        Manage purpose-level opt-out for RateQuip invitation emails. Full
        suppression and abuse reporting ships in Organic Growth Phase 2.
      </p>
      <div className="mt-8 space-y-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 text-sm">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" defaultChecked />
          <span>Company claim invitations</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" defaultChecked />
          <span>Review invitations</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" defaultChecked />
          <span>Business / project invitations</span>
        </label>
        <p className="text-xs text-[var(--rq-muted)]">
          Preference token: {params.token.slice(0, 8)}…
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled>Save preferences (Phase 2)</Button>
        <Button asChild variant="outline">
          <Link href="/contact">Report abuse</Link>
        </Button>
      </div>
    </div>
  );
}
