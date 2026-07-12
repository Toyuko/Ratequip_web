import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { brand } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--rq-border)] bg-[var(--rq-navy)] text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size="md" className="mb-4" />
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            Independent B2B trust, procurement and equipment-lifecycle platform.
            Rate suppliers. Compare quotes. Connect with verified partners.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-orange-400">
            {brand.tagline}
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/suppliers" className="hover:text-white">
                Suppliers
              </Link>
            </li>
            <li>
              <Link href="/requests" className="hover:text-white">
                RFQ marketplace
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/modules/intelligence" className="hover:text-white">
                Coming modules
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/dashboard/buyer" className="hover:text-white">
                Buyer dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/supplier" className="hover:text-white">
                Supplier dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}
