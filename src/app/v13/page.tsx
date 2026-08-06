import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { enterpriseFlagSnapshot } from "@/lib/v13/flags";

export const metadata = {
  title: "RateQuip V13 Enterprise Overlay",
  description: "Enterprise archive integration index — Phase 2 compatible",
};

const waves = [
  {
    title: "Wave 1 — Part 7 Business DNA",
    href: "/v12/activation",
    body: "Intelligent onboarding with inferred vs confirmed facts on company setup.",
  },
  {
    title: "Wave 2 — Taxonomy / graph / builders",
    href: "/v12/taxonomy",
    body: "Universal taxonomy, capability graph proximity, opportunity & contractor builders.",
  },
  {
    title: "Wave 3 — Catalogue factory",
    href: "/v12/catalogue-factory",
    body: "Module 68 pricing, credit reservation ledger, publishability rules.",
  },
  {
    title: "Compatibility contract",
    href: "/v12",
    body: "Phase 2 MVP surfaces stay frozen. Enterprise work is additive overlays.",
  },
];

export default function V13IndexPage() {
  const flags = enterpriseFlagSnapshot();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Badge variant="orange">V13 Enterprise Overlay</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Enterprise archive integration
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Full V13 archive is integrated as feature-flagged overlays on top of the
        Phase 2 MVP. Flags default off so acceptance UAT never depends on them.
      </p>

      <div className="mt-6 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 text-sm">
        <div className="font-medium text-[var(--rq-ink)]">Runtime flags</div>
        <ul className="mt-2 space-y-1 text-[var(--rq-slate)]">
          <li>ENTERPRISE_PART7_ENABLED: {flags.part7 ? "on" : "off"}</li>
          <li>
            ENTERPRISE_GRAPH_MATCH_ENABLED: {flags.graphMatch ? "on" : "off"}
          </li>
          <li>
            ENTERPRISE_CATALOGUE_LEDGER_ENABLED:{" "}
            {flags.catalogueLedger ? "on" : "off"}
          </li>
        </ul>
      </div>

      <ul className="mt-8 space-y-4">
        {waves.map((w) => (
          <li
            key={w.title}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
          >
            <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
              {w.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--rq-slate)]">{w.body}</p>
            <Button asChild className="mt-3" size="sm" variant="outline">
              <Link href={w.href}>Open</Link>
            </Button>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs text-[var(--rq-muted)]">
        Spec index: docs/enterprise/v13/README.md
      </p>
    </div>
  );
}
