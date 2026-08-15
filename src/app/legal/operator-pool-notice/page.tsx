import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/page-shell";
import { PRIVACY_NOTICE_VERSION } from "@/lib/talent/types";

export const metadata: Metadata = {
  title: "Operator pool collection notice",
  description:
    "Why RateQuip collects operator information, how it is used for placement, and how to access or correct it.",
};

export default function OperatorPoolNoticePage() {
  return (
    <>
      <MarketingHero
        eyebrow="Privacy"
        title="Operator talent pool collection notice"
        lead="This notice is shown before an application or signup is stored in the RateQuip operator pool (APP 5 / NZ IPP 3)."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Operator pool notice", href: "/legal/operator-pool-notice" },
        ]}
      />
      <MarketingSection>
        <p className="text-sm text-[var(--rq-muted)]">Version {PRIVACY_NOTICE_VERSION}</p>
        <div className="mt-6 max-w-3xl space-y-5 text-[var(--rq-slate)]">
          <p>
            RateQuip Pty Ltd collects your name, contact details, work rights,
            licences and application answers so we can verify tickets and
            match you to plant-operator gigs for equipment hire customers.
          </p>
          <p>
            If you applied via Indeed (or later SEEK / LinkedIn), those boards
            send us your application. We copy it into RateQuip’s own store. We
            do not treat the job board as the record of your profile.
          </p>
          <p>
            Under this Model B pool you applied to RateQuip, not to a single
            rental company. We may reuse your profile across bookings that
            match your tickets and availability. We will not sell your resume.
          </p>
          <p>
            Credential documents are identity documents. Access is role-restricted
            and logged. You can request a copy or a correction via{" "}
            <Link href="/contact" className="text-orange-600 underline">
              contact
            </Link>
            . Inactive profiles are reviewed after 24 months.
          </p>
          <p>
            This is not legal advice. Labour-hire licensing and worker
            classification for paid placements are still subject to counsel.
          </p>
        </div>
      </MarketingSection>
    </>
  );
}
