"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/actions/marketplace";

function ReviewForm() {
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
          const result = await submitReview({
            companySlug: String(fd.get("companySlug")),
            rating: Number(fd.get("rating")),
            title: String(fd.get("title")),
            body: String(fd.get("body")),
            evidenceName: file?.name,
            evidenceFile: file && file.size > 0 ? file : null,
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
        <Label htmlFor="rating">Rating (1–5)</Label>
        <Input
          id="rating"
          name="rating"
          type="number"
          min={1}
          max={5}
          defaultValue={5}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="body">Review</Label>
        <Textarea id="body" name="body" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="evidence">Purchase evidence (optional)</Label>
        <Input id="evidence" name="evidence" type="file" className="mt-1" />
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit for moderation"}
      </Button>
    </form>
  );
}

export default function NewReviewPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">Write a review</h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Verified reviews require purchase evidence and admin approval before
        they affect Trust Score.
      </p>
      <Suspense>
        <ReviewForm />
      </Suspense>
    </div>
  );
}
