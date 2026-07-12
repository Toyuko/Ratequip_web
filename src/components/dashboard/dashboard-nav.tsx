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
    <aside className="w-full shrink-0 border-b border-[var(--rq-border)] bg-[var(--rq-card)] md:w-56 md:border-b-0 md:border-r">
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
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
                  : "text-[var(--rq-slate)] hover:bg-[var(--rq-hover)]",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 hidden md:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
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
                className="block rounded-md px-3 py-1.5 text-[var(--rq-muted)] hover:bg-[var(--rq-hover)]"
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
