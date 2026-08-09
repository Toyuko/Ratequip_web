import Link from "next/link";
import { upcomingModules } from "@/lib/db/demo-data";

export const metadata = { title: "Coming modules" };

export default function ModulesIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
        Roadmap
      </p>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Coming modules
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--rq-slate)]">
        RateQuip ships on a shared identity, billing and company graph so each
        module can land without a platform rewrite. Explore what is planned next.
      </p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {upcomingModules.map((mod) => (
          <li key={mod.slug}>
            <Link
              href={`/modules/${mod.slug}`}
              className="block rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 transition hover:border-orange-300"
            >
              <div className="font-semibold text-[var(--rq-ink)]">{mod.name}</div>
              <div className="mt-1 text-sm text-[var(--rq-muted)]">
                {mod.summary}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
