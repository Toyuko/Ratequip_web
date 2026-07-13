"use client";

import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, FileText } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useT } from "@/components/i18n/locale-provider";
import { SupplierCard } from "@/components/suppliers/supplier-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brand } from "@/lib/config";
import { listCategories, listCompanies } from "@/lib/db/queries";

export default function HomePage() {
  const t = useT();
  const featured = listCompanies().slice(0, 3);
  const categories = listCategories().slice(0, 6);

  const steps = [
    {
      icon: Search,
      title: t.home.discoverTitle,
      body: t.home.discoverBody,
    },
    {
      icon: FileText,
      title: t.home.requestTitle,
      body: t.home.requestBody,
    },
    {
      icon: ShieldCheck,
      title: t.home.verifyTitle,
      body: t.home.verifyBody,
    },
  ];

  return (
    <div>
      <section className="rq-hero-grid relative overflow-hidden text-white">
        <div className="mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
          <div className="rq-fade-up max-w-3xl">
            <Logo size="hero" variant="onDark" priority className="mb-8" />
            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-200 sm:text-xl">
              {t.home.heroBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/suppliers">
                  {t.home.findSuppliers} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/sign-up">{t.home.join}</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-orange-300">
              {brand.tagline}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--rq-border)] bg-[var(--rq-card)]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <form action="/search" className="rq-fade-in flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rq-muted)]" />
              <Input
                name="q"
                placeholder={t.home.searchPlaceholder}
                className="pl-10"
              />
            </div>
            <Button type="submit">{t.common.search}</Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--rq-ink)]">
              {t.home.topSuppliers}
            </h2>
            <p className="mt-1 text-[var(--rq-slate)]">
              {t.home.topSuppliersBody}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/suppliers">{t.home.viewDirectory}</Link>
          </Button>
        </div>
        <div className="rq-stagger grid gap-5 md:grid-cols-3">
          {featured.map((company) => (
            <SupplierCard key={company.id} company={company} />
          ))}
        </div>
      </section>

      <section className="bg-[var(--rq-navy)] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold">{t.home.howTitle}</h2>
          <p className="mt-2 max-w-2xl text-slate-300">{t.home.howBody}</p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title}>
                <step.icon className="mb-4 h-8 w-8 text-orange-400" />
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-[var(--rq-ink)]">
          {t.home.browseCategories}
        </h2>
        <div className="rq-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 transition hover:border-orange-300"
            >
              <h3 className="font-semibold text-[var(--rq-ink)]">{cat.name}</h3>
              <p className="mt-1 text-sm text-[var(--rq-slate)]">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
