"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Coins,
  Factory,
  FileText,
  Globe2,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useT } from "@/components/i18n/locale-provider";
import { SupplierCard } from "@/components/suppliers/supplier-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DemoCompany, DemoRequest } from "@/lib/db/demo-data";
import {
  COMPARE_MACHINES,
  COMPARE_ROWS,
  CREDIT_USES,
  EVIDENCE_PILLARS,
  FEATURED_EQUIPMENT,
  HERO_MONTAGE,
  HERO_QUICK_LINKS,
  INDUSTRY_TILES,
  NETWORK_COUNTRIES,
} from "@/lib/home/showcase";
import { formatCurrency } from "@/lib/utils";

type SearchFilter = "equipment" | "supplier" | "category" | "country";

function daysUntil(dateIso?: string) {
  if (!dateIso) return null;
  const due = new Date(`${dateIso}T00:00:00Z`).getTime();
  if (Number.isNaN(due)) return null;
  const diff = Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

function searchActionFor(filter: SearchFilter) {
  if (filter === "country") return "/suppliers";
  return "/search";
}

export function HomePageClient({
  featured,
  requests,
}: {
  featured: DemoCompany[];
  requests: DemoRequest[];
}) {
  const t = useT();
  const [filter, setFilter] = useState<SearchFilter>("equipment");
  const spotlight = requests[0];
  const latest = requests.slice(0, 4);
  const evidenceCompany = featured[0];

  const filters: { id: SearchFilter; label: string }[] = [
    { id: "equipment", label: t.home.filterEquipment },
    { id: "supplier", label: t.home.filterSupplier },
    { id: "category", label: t.home.filterCategory },
    { id: "country", label: t.home.filterCountry },
  ];

  const explore = [
    {
      href: "/search?type=equipment",
      title: t.home.exploreEquipment,
      body: t.home.exploreEquipmentBody,
      icon: Factory,
    },
    {
      href: "/suppliers",
      title: t.home.exploreSuppliers,
      body: t.home.exploreSuppliersBody,
      icon: Building2,
    },
    {
      href: "/requests",
      title: t.home.exploreRfqs,
      body: t.home.exploreRfqsBody,
      icon: FileText,
    },
    {
      href: "/referrals",
      title: t.home.exploreNetwork,
      body: t.home.exploreNetworkBody,
      icon: Network,
    },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="rq-hero-grid relative overflow-hidden text-white">
        <div className="rq-hero-montage" aria-hidden>
          {HERO_MONTAGE.map((slide, index) => (
            <div
              key={slide.src}
              className="rq-hero-montage__slide"
              style={{ animationDelay: `${index * 6}s` }}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
          <div className="rq-hero-montage__overlay" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6">
          <div className="rq-fade-up max-w-4xl">
            <Logo size="hero" variant="onDark" priority className="mb-8" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">
              {t.home.heroEyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-200 sm:text-xl">
              {t.home.heroBody}
            </p>

            <form
              action={searchActionFor(filter)}
              className="mt-10 rounded-2xl border border-white/15 bg-black/35 p-3 shadow-2xl backdrop-blur-md sm:p-4"
            >
              <div className="mb-3 flex flex-wrap gap-2">
                {filters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                      filter === item.id
                        ? "bg-orange-500 text-white"
                        : "bg-white/10 text-slate-200 hover:bg-white/15"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    name={filter === "country" ? "country" : "q"}
                    placeholder={t.home.heroSearchPlaceholder}
                    className="h-12 border-white/20 bg-white/95 pl-10 text-[var(--rq-ink)]"
                  />
                  <input type="hidden" name="type" value={filter} />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" size="lg" className="h-12">
                    {t.home.searchRateQuip}
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 border-white/35 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Link href="/requests/new">{t.home.postRfq}</Link>
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300">
              {HERO_QUICK_LINKS.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="transition hover:text-orange-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="border-b border-[var(--rq-border)] bg-[var(--rq-card)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-[var(--rq-ink)] sm:text-3xl">
            {t.home.exploreTitle}
          </h2>
          <div className="rq-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {explore.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-xl border border-[var(--rq-border)] bg-[var(--rq-surface)] p-5 transition hover:border-orange-400"
              >
                <item.icon className="mb-4 h-7 w-7 text-orange-500 transition group-hover:scale-110" />
                <h3 className="text-lg font-semibold text-[var(--rq-ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--rq-slate)]">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orange-600">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EQUIPMENT */}
      <section className="bg-[var(--rq-surface)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--rq-ink)] sm:text-3xl">
                {t.home.featuredEquipment}
              </h2>
              <p className="mt-2 max-w-2xl text-[var(--rq-slate)]">
                {t.home.featuredEquipmentBody}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/search?type=equipment">{t.home.viewEquipment}</Link>
            </Button>
          </div>
          <div className="rq-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_EQUIPMENT.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-[var(--rq-border)] bg-[var(--rq-card)] shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--rq-navy)]">
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                    {item.category}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-[var(--rq-ink)]">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--rq-muted)]">
                    {item.manufacturer} · {item.location}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {item.specs.map((spec) => (
                      <li key={spec}>
                        <Badge variant="muted">{spec}</Badge>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/companies/${item.companySlug}`}>
                        {t.home.viewEquipment}
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/quotes/compare?request=req-1">
                        {t.home.compareAction}
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPLIERS + REPUTATION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--rq-ink)] sm:text-3xl">
              {t.home.topSuppliers}
            </h2>
            <p className="mt-2 max-w-2xl text-[var(--rq-slate)]">
              {t.home.topSuppliersBody}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/suppliers">{t.home.viewDirectory}</Link>
          </Button>
        </div>

        {evidenceCompany ? (
          <div className="mb-8 grid gap-6 overflow-hidden rounded-2xl border border-[var(--rq-border)] bg-[var(--rq-card)] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-[var(--rq-navy)] p-6 text-white sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-300">
                    Verified profile
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">
                    {evidenceCompany.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {evidenceCompany.city}, {evidenceCompany.country}
                  </p>
                </div>
                <div className="rounded-lg bg-white/10 px-4 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-orange-300">
                    Trust
                  </div>
                  <div className="text-3xl font-extrabold">
                    {evidenceCompany.trustScore.toFixed(0)}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-slate-200">{evidenceCompany.headline}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {evidenceCompany.verified ? (
                  <Badge variant="success">Verified</Badge>
                ) : null}
                <Badge variant="orange">
                  {evidenceCompany.reviewCount} reviews
                </Badge>
                <Badge variant="muted">
                  Est. {evidenceCompany.yearFounded}
                </Badge>
              </div>
              <Button asChild className="mt-6">
                <Link href={`/companies/${evidenceCompany.slug}`}>
                  View company profile <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
              {EVIDENCE_PILLARS.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-surface)] p-4"
                >
                  <ShieldCheck className="mb-2 h-5 w-5 text-orange-500" />
                  <h4 className="font-semibold text-[var(--rq-ink)]">
                    {pillar.title}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--rq-slate)]">
                    {pillar.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rq-stagger grid gap-5 md:grid-cols-3">
          {featured.map((company) => (
            <SupplierCard key={company.id} company={company} />
          ))}
        </div>
      </section>

      {/* REPUTATION DIFFERENTIATOR */}
      <section
        id="how-it-works"
        className="border-y border-[var(--rq-border)] bg-[var(--rq-navy)] py-16 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
              RateQuip differentiator
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              {t.home.reputationTitle}
            </h2>
            <p className="mt-4 text-lg text-slate-300">{t.home.reputationBody}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
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
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <step.icon className="mb-4 h-8 w-8 text-orange-400" />
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild>
              <Link href="/about">{t.home.reputationCta}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* LATEST RFQs */}
      <section className="bg-[var(--rq-surface)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--rq-ink)] sm:text-3xl">
                {t.home.latestRfqs}
              </h2>
              <p className="mt-2 text-[var(--rq-slate)]">{t.home.latestRfqsBody}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/requests">{t.home.browseRfqs}</Link>
              </Button>
              <Button asChild>
                <Link href="/requests/new">{t.home.createRfq}</Link>
              </Button>
            </div>
          </div>

          {spotlight ? (
            <div className="mb-6 overflow-hidden rounded-2xl border border-orange-200 bg-[var(--rq-card)] shadow-sm dark:border-orange-900/50">
              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="p-6 sm:p-8">
                  <Badge variant="orange">Live RFQ</Badge>
                  <h3 className="mt-3 text-2xl font-bold text-[var(--rq-ink)]">
                    {spotlight.title}
                  </h3>
                  <p className="mt-2 text-[var(--rq-slate)]">
                    {spotlight.description}
                  </p>
                  <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
                        Location
                      </dt>
                      <dd className="font-semibold text-[var(--rq-ink)]">
                        {spotlight.deliveryCountry}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
                        Budget
                      </dt>
                      <dd className="font-semibold text-[var(--rq-ink)]">
                        {formatCurrency(spotlight.budgetMin, spotlight.currency)}{" "}
                        –{" "}
                        {formatCurrency(spotlight.budgetMax, spotlight.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
                        Closing
                      </dt>
                      <dd className="font-semibold text-[var(--rq-ink)]">
                        {(() => {
                          const days = daysUntil(spotlight.dueDate);
                          if (days == null) return "Open";
                          if (days < 0) return "Closed";
                          return `${days} days`;
                        })()}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-col justify-center gap-3 border-t border-[var(--rq-border)] bg-[var(--rq-navy)] p-6 text-white lg:border-l lg:border-t-0">
                  <p className="text-sm text-slate-300">
                    {t.home.rfqSpotlightBody}
                  </p>
                  <Button asChild>
                    <Link href={`/requests/${spotlight.id}`}>
                      {t.home.browseRfqs}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Link href="/requests/new">{t.home.createRfq}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {latest.map((request) => {
              const days = daysUntil(request.dueDate);
              return (
                <Link
                  key={request.id}
                  href={`/requests/${request.id}`}
                  className="rounded-xl border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 transition hover:border-orange-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[var(--rq-ink)]">
                      {request.title}
                    </h3>
                    <Badge variant="muted">{request.quoteCount} quotes</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--rq-slate)]">
                    {request.description}
                  </p>
                  <p className="mt-3 text-xs text-[var(--rq-muted)]">
                    {request.deliveryCountry}
                    {days != null && days >= 0
                      ? ` · closes in ${days} days`
                      : null}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-2xl font-bold text-[var(--rq-ink)] sm:text-3xl">
            {t.home.compareTitle}
          </h2>
          <p className="mt-2 text-[var(--rq-slate)]">{t.home.compareBody}</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-[var(--rq-border)] bg-[var(--rq-card)] shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rq-border)] bg-[var(--rq-navy)] text-left text-white">
                <th className="px-4 py-4 font-medium text-slate-300">Spec</th>
                {COMPARE_MACHINES.map((name) => (
                  <th key={name} className="px-4 py-4 font-semibold">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-[var(--rq-border)] last:border-0"
                >
                  <th className="px-4 py-3 text-left font-medium text-[var(--rq-muted)]">
                    {row.label}
                  </th>
                  {row.values.map((value) => (
                    <td
                      key={`${row.label}-${value}`}
                      className="px-4 py-3 text-[var(--rq-ink)]"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6">
          <Button asChild>
            <Link href="/quotes/compare?request=req-1">
              {t.home.openCompare} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="bg-[var(--rq-surface)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-[var(--rq-ink)] sm:text-3xl">
              {t.home.industriesTitle}
            </h2>
            <p className="mt-2 text-[var(--rq-slate)]">{t.home.industriesBody}</p>
          </div>
          <div className="rq-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {INDUSTRY_TILES.map((tile) => (
              <Link
                key={tile.name}
                href={`/categories/${tile.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl"
              >
                <Image
                  src={tile.imageSrc}
                  alt={tile.imageAlt}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-base font-bold text-white">{tile.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BUYER / SUPPLIER JOURNEYS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-2xl font-bold text-[var(--rq-ink)] sm:text-3xl">
            {t.home.journeysTitle}
          </h2>
          <p className="mt-2 text-[var(--rq-slate)]">{t.home.journeysBody}</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--rq-border)] bg-[var(--rq-card)] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Buyers
            </p>
            <h3 className="mt-2 text-2xl font-bold text-[var(--rq-ink)]">
              {t.home.buyerTitle}
            </h3>
            <p className="mt-3 text-[var(--rq-slate)]">{t.home.buyerBody}</p>
            <p className="mt-5 text-sm font-semibold text-[var(--rq-ink)]">
              Find → Compare → RFQ → Connect → Procure
            </p>
            <Button asChild className="mt-6">
              <Link href="/sign-up">{t.home.buyerCta}</Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-[var(--rq-border)] bg-[var(--rq-navy)] p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
              Suppliers
            </p>
            <h3 className="mt-2 text-2xl font-bold">{t.home.supplierTitle}</h3>
            <p className="mt-3 text-slate-300">{t.home.supplierBody}</p>
            <p className="mt-5 text-sm font-semibold text-orange-200">
              Join → Build Profile → List Equipment → Receive Opportunities →
              Grow
            </p>
            <Button asChild className="mt-6">
              <Link href="/sign-up">{t.home.supplierCta}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CREDITS */}
      <section className="border-y border-[var(--rq-border)] bg-[var(--rq-card)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600">
              <Coins className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--rq-ink)] sm:text-3xl">
              {t.home.creditsTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--rq-slate)]">
              {t.home.creditsBody}
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {CREDIT_USES.map((use) => (
                <li
                  key={use}
                  className="flex items-start gap-2 text-sm text-[var(--rq-ink)]"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  {use}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/referrals">{t.home.creditsCta}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing">{t.home.creditsInvite}</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 dark:border-orange-900/40 dark:from-orange-950/40 dark:to-[var(--rq-card)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
              Invite example
            </p>
            <p className="mt-4 text-lg font-semibold text-[var(--rq-ink)]">
              Alex Bergman at NordicFill Systems invited you — claim{" "}
              <span className="text-orange-600">250 free RateQuip Credits</span>
            </p>
            <p className="mt-3 text-sm text-[var(--rq-slate)]">
              Welcome benefits for invited businesses. Inviter rewards unlock
              when partners join and participate — not for spam invites.
            </p>
          </div>
        </div>
      </section>

      {/* GLOBAL NETWORK MAP */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 text-orange-600">
              <Globe2 className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                {t.home.networkCountries}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--rq-ink)] sm:text-3xl">
              {t.home.networkTitle}
            </h2>
            <p className="mt-2 text-[var(--rq-slate)]">{t.home.networkBody}</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[var(--rq-border)] bg-[var(--rq-navy)] p-4 sm:p-6">
          <svg
            viewBox="0 0 1000 500"
            className="h-auto w-full"
            role="img"
            aria-label={t.home.networkTitle}
          >
            <rect width="1000" height="500" fill="#0b1220" />
            <path
              d="M120 140c40-30 90-40 140-20 55 22 70 18 120-10 45-25 95-20 130 10 30 25 70 35 110 20 50-18 95 5 130 35 40 35 85 40 130 15 35-20 75-15 100 15v40c-45 10-85-5-120-25-40-22-85-15-120 10-45 30-95 25-140-5-40-25-85-20-120 8-45 35-100 30-150-5-35-25-80-20-110 10-20 20-55 25-80 5z"
              fill="#1e293b"
              opacity="0.9"
            />
            <path
              d="M180 280c55-15 100 5 140 35 35 25 80 30 120 10 50-25 100-10 140 20 30 22 75 25 110 5 40-22 90-10 120 25v35c-55 5-100-20-145-35-40-12-85 0-120 25-45 30-100 20-145-5-40-22-90-15-125 15-25 20-65 18-95-5z"
              fill="#1e293b"
              opacity="0.75"
            />
            {NETWORK_COUNTRIES.map((country) => (
              <g key={country.code} className="rq-map-pin">
                <circle
                  cx={country.x}
                  cy={country.y}
                  r="10"
                  fill="rgba(249,115,22,0.2)"
                />
                <circle cx={country.x} cy={country.y} r="4.5" fill="#f97316" />
                <title>{country.name}</title>
              </g>
            ))}
          </svg>
          <div className="mt-4 flex flex-wrap gap-2">
            {NETWORK_COUNTRIES.map((country) => (
              <Badge key={country.code} variant="muted">
                {country.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-[var(--rq-navy)] py-20 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(249,115,22,0.35), transparent 35%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.08), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t.home.finalTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {t.home.finalBody}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/search">{t.home.exploreCta}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/sign-up">{t.home.join}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/requests/new">{t.home.postRfq}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
