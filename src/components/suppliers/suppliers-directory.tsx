"use client";

import Link from "next/link";
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
  const parents = categories.filter((c) => !c.parentId);
  const childrenByParent = new Map<string, DemoCategory[]>();
  for (const cat of categories) {
    if (!cat.parentId) continue;
    const list = childrenByParent.get(cat.parentId) ?? [];
    list.push(cat);
    childrenByParent.set(cat.parentId, list);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
            {t.suppliers.title}
          </h1>
          <p className="mt-2 text-[var(--rq-slate)]">{t.suppliers.body}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/companies/search">Add a company</Link>
        </Button>
      </div>

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
          {parents.map((parent) => {
            const children = childrenByParent.get(parent.id) ?? [];
            if (children.length === 0) {
              return (
                <option key={parent.id} value={parent.slug}>
                  {parent.name}
                </option>
              );
            }
            return (
              <optgroup key={parent.id} label={parent.name}>
                <option value={parent.slug}>All {parent.name}</option>
                {children.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
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
        <div className="mt-10 space-y-4 text-center">
          <p className="text-[var(--rq-muted)]">No suppliers matched.</p>
          <Button asChild>
            <Link
              href={`/companies/search${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`}
            >
              Add a company
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
