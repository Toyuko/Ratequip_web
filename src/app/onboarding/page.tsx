"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/lib/actions/onboarding";

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

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("buyer");
  const [orgName, setOrgName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const canContinue =
    orgName.trim() && contactName.trim() && email.trim();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Step 1 of 2</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Welcome to RateQuip
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Choose your account type and create your organisation. Next, an AI
        assistant will run a short questionnaire to build your operating profile
        and suggest relevant companies.
      </p>

      <ol className="mt-4 grid gap-2 text-sm text-[var(--rq-slate)] sm:grid-cols-2">
        <li className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2">
          <span className="font-semibold text-orange-800">1. Account</span>
          {" — "}role & organisation
        </li>
        <li className="rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 py-2">
          <span className="font-semibold text-[var(--rq-ink)]">2. AI setup</span>
          {" — "}profile suggestions & relevance
        </li>
      </ol>

      <div className="mt-8 grid gap-3">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={`rounded-lg border p-4 text-left transition ${
              role === r.id
                ? "border-orange-400 bg-orange-50"
                : "border-[var(--rq-border)] bg-[var(--rq-card)]"
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
          <Input
            id="org"
            className="mt-1"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme Procurement Ltd"
            required
            aria-required="true"
          />
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
          {pending ? "Saving…" : "Continue to AI company questionnaire"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/referrals">Invite a colleague instead</Link>
        </Button>
      </div>
    </div>
  );
}
