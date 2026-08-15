import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OperatorPoolForm } from "@/components/talent/operator-pool-form";

export const metadata: Metadata = { title: "Operator pool" };

export default function OperatorPoolPage() {
  return (
    <DashboardShell role="contractor" title="Operator talent pool">
      <p className="max-w-2xl text-[var(--rq-slate)]">
        RateQuip publishes operator gigs to Indeed and keeps verified tickets in
        a pool we own. SEEK and LinkedIn adapters come after this path proves
        cost per usable operator.{" "}
        <Link href="/legal/operator-pool-notice" className="text-orange-600 underline">
          Collection notice
        </Link>
        .
      </p>
      <div className="mt-6">
        <OperatorPoolForm />
      </div>
    </DashboardShell>
  );
}
