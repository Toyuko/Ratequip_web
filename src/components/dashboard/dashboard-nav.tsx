import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard/buyer", label: "Buyer" },
  { href: "/dashboard/supplier", label: "Supplier" },
  { href: "/dashboard/contractor", label: "Contractor" },
  { href: "/dashboard/admin", label: "Admin" },
];

export function DashboardNav({ active }: { active: string }) {
  return (
    <aside className="w-full shrink-0 border-b border-[var(--rq-border)] bg-white md:w-56 md:border-b-0 md:border-r">
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Dashboards
        </p>
        <nav className="mt-3 flex gap-2 overflow-x-auto md:flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap",
                active === l.label.toLowerCase()
                  ? "bg-[var(--rq-navy)] text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 hidden md:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Coming soon
          </p>
          <nav className="mt-2 space-y-1 text-sm">
            {[
              ["intelligence", "Intelligence"],
              ["srm", "SRM"],
              ["asset-register", "Assets"],
              ["academy", "Academy"],
            ].map(([slug, label]) => (
              <Link
                key={slug}
                href={`/modules/${slug}`}
                className="block rounded-md px-3 py-1.5 text-slate-500 hover:bg-slate-50"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
