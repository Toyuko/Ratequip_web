import { brand } from "@/lib/config";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        About {brand.name}
      </h1>
      <p className="mt-4 leading-relaxed text-[var(--rq-slate)]">
        {brand.name}.com is an independent B2B trust, procurement, supplier
        intelligence, marketplace and equipment-lifecycle platform. It connects
        buyers, suppliers, manufacturers, contractors, inspectors, freight
        providers, finance partners and enterprise procurement teams.
      </p>
      <p className="mt-4 leading-relaxed text-[var(--rq-slate)]">
        Our north star: a buyer can move from need identification to supplier
        selection, verification, quotation, contracting, installation, lifecycle
        support and resale without leaving the platform — and every completed
        workflow improves the trust graph for everyone.
      </p>
      <p className="mt-6 text-sm uppercase tracking-[0.2em] text-orange-600">
        {brand.tagline}
      </p>
    </div>
  );
}
