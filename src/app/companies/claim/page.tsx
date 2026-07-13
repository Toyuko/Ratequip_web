"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitClaim } from "@/lib/actions/marketplace";

function ClaimForm() {
  const params = useSearchParams();
  const company = params.get("company") ?? "";
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="mt-8 max-w-xl space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const file = fd.get("evidence") as File | null;
        startTransition(async () => {
          const result = await submitClaim({
            companySlug: String(fd.get("companySlug")),
            notes: String(fd.get("notes")),
            evidenceName: file?.name,
          });
          setMessage(result.message);
        });
      }}
    >
      <div>
        <Label htmlFor="companySlug">Company slug</Label>
        <Input
          id="companySlug"
          name="companySlug"
          defaultValue={company}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="notes">Evidence notes</Label>
        <Textarea id="notes" name="notes" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="evidence">Proof document</Label>
        <Input id="evidence" name="evidence" type="file" className="mt-1" />
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit claim"}
      </Button>
    </form>
  );
}

export default function ClaimCompanyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Claim a company profile
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Upload registration evidence. Invitation possession alone does not prove
        authority — admins verify before granting company access. Tokenized claim
        links use <code className="text-xs">/claim/:token</code> (v10.1 OG-010+).
      </p>
      <Suspense>
        <ClaimForm />
      </Suspense>
    </div>
  );
}
