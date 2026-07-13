"use client";

import { useT } from "@/components/i18n/locale-provider";
import { SupplierCard } from "@/components/suppliers/supplier-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DemoCategory, DemoCompany } from "@/lib/db/demo-data";

export function SuppliersDirectory({
  companies,
  categories,
  params,
}: {
  companies: DemoCompany[];
  categories: DemoCategory[];
  params: { q?: string; category?: string; country?: string };
}) {
  const t = useT();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        {t.suppliers.title}
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">{t.suppliers.body}</p>

      <form className="mt-8 grid gap-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 md:grid-cols-4">
        <Input
          name="q"
          placeholder={t.suppliers.searchPlaceholder}
          defaultValue={params.q}
        />
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="h-11 rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
        >
          <option value="">{t.nav.categories}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Input
          name="country"
          placeholder={t.suppliers.countryPlaceholder}
          defaultValue={params.country}
        />
        <Button type="submit">{t.suppliers.filter}</Button>
      </form>

      <div className="rq-stagger mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <SupplierCard key={company.id} company={company} />
        ))}
      </div>
      {companies.length === 0 ? (
        <p className="mt-10 text-center text-[var(--rq-muted)]">
          No suppliers matched.
        </p>
      ) : null}
    </div>
  );
}
