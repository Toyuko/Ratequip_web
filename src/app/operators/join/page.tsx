import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/page-shell";
import { OperatorPoolForm } from "@/components/talent/operator-pool-form";
import { PRIVACY_NOTICE_VERSION } from "@/lib/talent/types";

export const metadata: Metadata = {
  title: "Join the operator pool",
  description:
    "Ticketed plant operators can join the RateQuip talent pool. Indeed applications land here.",
};

export default function OperatorJoinPage() {
  return (
    <>
      <MarketingHero
        eyebrow="Operators"
        title="Join the RateQuip operator pool"
        lead="Licensed plant operators apply once. RateQuip verifies tickets and matches you to wet-hire gigs — including roles advertised on Indeed."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Operator pool", href: "/operators/join" },
        ]}
      />
      <MarketingSection>
        <p className="text-sm text-[var(--rq-muted)]">
          Notice version {PRIVACY_NOTICE_VERSION}.{" "}
          <Link href="/legal/operator-pool-notice" className="text-orange-600 underline">
            Read the collection notice
          </Link>
          .
        </p>
        <div className="mt-8">
          <OperatorPoolForm />
        </div>
      </MarketingSection>
      <MarketingCta
        title="Hiring a ticketed operator?"
        body="Add operator supply on your RFQ and RateQuip will publish the gig to Indeed."
        primary={{ label: "Post an RFQ", href: "/requests/new" }}
      />
    </>
  );
}
