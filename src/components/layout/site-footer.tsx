"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useT } from "@/components/i18n/locale-provider";
import { brand } from "@/lib/config";

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="mt-auto border-t border-[var(--rq-border)] bg-[var(--rq-navy)] text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size="md" variant="onDark" className="mb-4" />
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            {t.footer.blurb}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-orange-400">
            {brand.tagline}
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">
            {t.footer.platform}
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/suppliers" className="hover:text-white">
                {t.nav.suppliers}
              </Link>
            </li>
            <li>
              <Link href="/requests" className="hover:text-white">
                {t.footer.rfqMarketplace}
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white">
                {t.nav.pricing}
              </Link>
            </li>
            <li>
              <Link href="/modules/intelligence" className="hover:text-white">
                {t.footer.comingModules}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">
            {t.footer.company}
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                {t.footer.about}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                {t.footer.contact}
              </Link>
            </li>
            <li>
              <Link href="/dashboard/buyer" className="hover:text-white">
                {t.footer.buyerDashboard}
              </Link>
            </li>
            <li>
              <Link href="/dashboard/supplier" className="hover:text-white">
                {t.footer.supplierDashboard}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {brand.name}. {t.common.allRightsReserved}
      </div>
    </footer>
  );
}
