"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { CaptureReferralRef } from "@/components/referrals/capture-referral-ref";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { localeNames } from "@/lib/i18n/config";

const roles = [
  {
    id: "buyer",
    title: "Buyer",
    description: "Source equipment, post RFQs, compare quotes.",
  },
  {
    id: "supplier",
    title: "Supplier / Manufacturer",
    description: "Claim profile, publish products, respond to RFQs.",
  },
  {
    id: "contractor",
    title: "Service provider",
    description: "Installation, maintenance, inspection or logistics.",
  },
] as const;

const LOCAL_NAME_LOCALES = ["th", "zh"] as const;
type LocalNameLocale = (typeof LOCAL_NAME_LOCALES)[number];

const selectClassName =
  "mt-1 h-11 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm text-[var(--rq-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rq-orange)]";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("buyer");
  const [orgName, setOrgName] = useState("");
  const [showLocalName, setShowLocalName] = useState(false);
  const [orgNameLocal, setOrgNameLocal] = useState("");
  const [orgNameLocalLocale, setOrgNameLocalLocale] =
    useState<LocalNameLocale>("th");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const localNameReady =
    !showLocalName || !orgNameLocal.trim() || Boolean(orgNameLocalLocale);
  const canContinue =
    orgName.trim() && contactName.trim() && email.trim() && localNameReady;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Suspense fallback={null}>
        <CaptureReferralRef />
      </Suspense>
      <Badge variant="orange">Account setup</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Welcome to RateQuip
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Choose your account type and create your organisation. You will land on
        your dashboard when you continue.
      </p>

      <div className="mt-8 grid gap-3">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={`rounded-lg border p-4 text-left transition ${
              role === r.id
                ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/50"
                : "border-[var(--rq-border)] bg-[var(--rq-card)] hover:bg-[var(--rq-hover)]"
            }`}
          >
            <div className="font-semibold text-[var(--rq-ink)]">{r.title}</div>
            <div className="mt-1 text-sm text-[var(--rq-slate)]">{r.description}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        <div>
          <Label htmlFor="org">
            Organisation name <span className="text-orange-600">*</span>
          </Label>
          <p className="mt-0.5 text-xs text-[var(--rq-slate)]">
            English / Latin script (used for search and profiles).
          </p>
          <Input
            id="org"
            className="mt-1"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme Procurement Ltd"
            required
            aria-required="true"
          />

          {!showLocalName ? (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-orange-700 hover:underline dark:text-orange-400"
              onClick={() => setShowLocalName(true)}
            >
              + Add name in another language
            </button>
          ) : (
            <div className="mt-3 grid gap-3 rounded-md border border-[var(--rq-border)] bg-[var(--rq-hover)]/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--rq-ink)]">
                  Name in another language
                </p>
                <button
                  type="button"
                  className="text-xs text-[var(--rq-slate)] hover:underline"
                  onClick={() => {
                    setShowLocalName(false);
                    setOrgNameLocal("");
                  }}
                >
                  Remove
                </button>
              </div>
              <div>
                <Label htmlFor="org-local-locale">Language</Label>
                <select
                  id="org-local-locale"
                  className={selectClassName}
                  value={orgNameLocalLocale}
                  onChange={(e) =>
                    setOrgNameLocalLocale(e.target.value as LocalNameLocale)
                  }
                >
                  {LOCAL_NAME_LOCALES.map((code) => (
                    <option key={code} value={code}>
                      {localeNames[code]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="org-local">
                  Organisation name ({localeNames[orgNameLocalLocale]})
                </Label>
                <Input
                  id="org-local"
                  className="mt-1"
                  value={orgNameLocal}
                  onChange={(e) => setOrgNameLocal(e.target.value)}
                  placeholder={
                    orgNameLocalLocale === "th"
                      ? "บริษัท แอคมี โปรเคียวเมนต์ จำกัด"
                      : "艾克米采购有限公司"
                  }
                  lang={orgNameLocalLocale}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="contact-name">
            Contact name <span className="text-orange-600">*</span>
          </Label>
          <Input
            id="contact-name"
            className="mt-1"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
            aria-required="true"
          />
        </div>

        <div>
          <Label htmlFor="email">
            Email <span className="text-orange-600">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            className="mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@acme.com"
            autoComplete="email"
            required
            aria-required="true"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            className="mt-1"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+66 2 123 4567"
            autoComplete="tel"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            className="mt-1"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Industrial Road, Bangkok"
            autoComplete="street-address"
          />
        </div>
      </div>

      {message ? (
        <p className="mt-4 text-sm text-emerald-700">{message}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          disabled={pending || !canContinue}
          onClick={() => {
            if (!canContinue) return;
            startTransition(async () => {
              const result = await completeOnboarding({
                role,
                orgName: orgName.trim(),
                orgNameLocal: showLocalName
                  ? orgNameLocal.trim() || undefined
                  : undefined,
                orgNameLocalLocale: showLocalName
                  ? orgNameLocalLocale
                  : undefined,
                phone: phone.trim(),
                email: email.trim(),
                address: address.trim(),
                contactName: contactName.trim(),
              });
              setMessage(result.message);
              router.push(result.redirectTo);
            });
          }}
        >
          {pending ? "Saving…" : "Continue to dashboard"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/referrals">Invite a colleague instead</Link>
        </Button>
      </div>
    </div>
  );
}
