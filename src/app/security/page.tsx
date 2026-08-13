import type { Metadata } from "next";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Security",
  description:
    "RateQuip security posture: authentication, tenant data, payments, headers and disclosure.",
};

export default function SecurityPage() {
  return (
    <>
      <MarketingHero
        eyebrow="Platform security"
        title="Security"
        lead="Controls sit in the product — Clerk sessions, Neon row data, Stripe for cards, and edge headers on every response."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Security", href: "/security" },
        ]}
      />

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Architecture posture
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--rq-slate)]">
          <li>Next.js on Vercel. Region and image optimisation stay on the live contract.</li>
          <li>Authentication is Clerk. Dashboards redirect when signed out.</li>
          <li>Company, RFQ, review and wallet writes go to Neon Postgres via Drizzle.</li>
          <li>Card details never touch RateQuip infrastructure — Stripe Checkout and webhooks do.</li>
          <li>Secrets stay in Vercel environment variables, not in source.</li>
        </ul>
      </MarketingSection>

      <MarketingSection alt>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Access and confidentiality
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--rq-slate)]">
          <li>Role-aware onboarding (buyer, supplier, contractor, admin).</li>
          <li>Admin moderation for claims and reviews.</li>
          <li>Buyer contact is not a public field on RFQs; quotes attach to the request.</li>
          <li>V12 document vault is the overlay for confidential project files.</li>
        </ul>
      </MarketingSection>

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Edge headers
        </h2>
        <p className="mt-3 text-[var(--rq-slate)]">
          Every response sets <code className="text-sm">X-Content-Type-Options</code>,{" "}
          <code className="text-sm">X-Frame-Options</code>,{" "}
          <code className="text-sm">Referrer-Policy</code>,{" "}
          <code className="text-sm">Permissions-Policy</code> and HSTS.
        </p>
      </MarketingSection>

      <MarketingSection alt>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Responsible disclosure
        </h2>
        <p className="mt-3 text-[var(--rq-slate)]">
          If you believe you have found a vulnerability, email{" "}
          <a className="text-orange-600 hover:underline" href="mailto:security@ratequip.com">
            security@ratequip.com
          </a>{" "}
          with enough detail to reproduce it. Good-faith research that avoids
          privacy violations, service degradation and data destruction will not
          be pursued as an attack.
        </p>
      </MarketingSection>

      <MarketingCta
        title="Questions about a live incident?"
        body="Use the contact form for operational issues. Use security@ratequip.com for vulnerabilities."
        primary={{ label: "Contact", href: "/contact" }}
      />
    </>
  );
}
