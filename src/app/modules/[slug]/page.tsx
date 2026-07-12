import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { upcomingModules } from "@/lib/db/demo-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = upcomingModules.find((m) => m.slug === slug);
  return { title: mod?.name ?? "Module" };
}

export default async function ModuleComingSoonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = upcomingModules.find((m) => m.slug === slug);
  if (!mod) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
        Coming soon
      </p>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        {mod.name}
      </h1>
      <p className="mt-3 text-[var(--rq-slate)]">{mod.summary}</p>
      <p className="mt-6 text-sm text-[var(--rq-muted)]">
        Schema hooks and shared identity/billing primitives are ready so this
        module can land without a platform rewrite.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard/buyer">Back to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/modules/intelligence">Browse modules</Link>
        </Button>
      </div>
      <ul className="mt-12 grid gap-3 text-left sm:grid-cols-2">
        {upcomingModules.map((m) => (
          <li key={m.slug}>
            <Link
              href={`/modules/${m.slug}`}
              className={`block rounded-lg border p-4 text-sm ${
                m.slug === slug
                  ? "border-orange-400 bg-orange-50"
                  : "border-[var(--rq-border)] bg-[var(--rq-card)]"
              }`}
            >
              <div className="font-semibold text-[var(--rq-ink)]">{m.name}</div>
              <div className="mt-1 text-[var(--rq-muted)]">{m.summary}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
