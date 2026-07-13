"use client";

import { useT } from "@/components/i18n/locale-provider";
import { brand } from "@/lib/config";

export default function AboutPage() {
  const t = useT();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        {t.about.title} {brand.name}
      </h1>
      <p className="mt-4 leading-relaxed text-[var(--rq-slate)]">{t.about.p1}</p>
      <p className="mt-4 leading-relaxed text-[var(--rq-slate)]">{t.about.p2}</p>
      <p className="mt-6 text-sm uppercase tracking-[0.2em] text-orange-600">
        {brand.tagline}
      </p>
    </div>
  );
}
