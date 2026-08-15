import Link from "next/link";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/dashboard/buyer", label: "Buyer" },
  { href: "/dashboard/supplier", label: "Supplier" },
  { href: "/dashboard/contractor", label: "Contractor" },
] as const;

export function DashboardNav({
  active,
  showAdmin = false,
}: {
  active: string;
  /** Platform admin only — never shown for newly onboarded product roles. */
  showAdmin?: boolean;
}) {
  const links = showAdmin
    ? [...baseLinks, { href: "/dashboard/admin", label: "Admin" }]
    : [...baseLinks];

  return (
    <aside
      className="w-full shrink-0 border-b border-[var(--rq-border)] bg-[var(--rq-card)] md:w-56 md:border-b-0 md:border-r"
      data-tour="dash-nav"
    >
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
            Grow network
          </p>
          <nav className="mt-2 space-y-1 text-sm">
            <Link
              href="/referrals"
              className="block rounded-md px-3 py-1.5 text-[var(--rq-slate)] hover:bg-[var(--rq-hover)]"
            >
              Referrals & invites
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
