"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCompanyProfile } from "@/lib/actions/marketplace";
import type { DemoCompany } from "@/lib/db/demo-data";

export function SupplierProfileForm({ company }: { company: DemoCompany }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="max-w-xl space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateCompanyProfile({
            companySlug: company.slug,
            name: String(fd.get("name")),
            headline: String(fd.get("headline")),
            description: String(fd.get("description")),
            city: String(fd.get("city")),
            country: String(fd.get("country")),
          });
          setMessage(result.message);
        });
      }}
    >
      <div>
        <Label htmlFor="name">Company name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={company.name}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          name="headline"
          defaultValue={company.headline}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={company.description}
          className="mt-1"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            defaultValue={company.city}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            defaultValue={company.country}
            className="mt-1"
          />
        </div>
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
