import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingHero({
  eyebrow,
  title,
  lead,
  crumbs,
  actions,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  crumbs?: { label: string; href: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <header className="border-b border-[var(--rq-border)] bg-[var(--rq-card)]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {crumbs ? (
          <nav className="mb-4 text-sm text-[var(--rq-muted)]" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.href}>
                {i > 0 ? <span className="mx-2">/</span> : null}
                <Link href={c.href} className="hover:text-orange-600">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--rq-slate)]">
          {lead}
        </p>
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

export function MarketingSection({
  children,
  alt = false,
}: {
  children: React.ReactNode;
  alt?: boolean;
}) {
  return (
    <section
      className={`px-4 py-12 sm:px-6 ${alt ? "bg-[var(--rq-card)]" : ""}`}
    >
      <div className="mx-auto max-w-4xl">{children}</div>
    </section>
  );
}

export function MarketingCta({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="border-t border-[var(--rq-border)] bg-[var(--rq-navy)] px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-3 max-w-2xl text-slate-300">{body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary ? (
            <Button asChild variant="secondary">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function StatusPill({
  status,
}: {
  status: "live" | "partial" | "specified" | "v12" | "later";
}) {
  const label =
    status === "live"
      ? "Live"
      : status === "partial"
        ? "Partial"
        : status === "v12"
          ? "V12 slice"
          : status === "later"
            ? "Later wave"
            : "Specified";
  const className =
    status === "live"
      ? "bg-emerald-100 text-emerald-800"
      : status === "partial" || status === "v12"
        ? "bg-orange-100 text-orange-800"
        : "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
