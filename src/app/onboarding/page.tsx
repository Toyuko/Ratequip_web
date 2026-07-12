"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Welcome to RateQuip
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Choose your account type and create or join an organisation.
      </p>

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

      <div className="mt-6">
        <Label htmlFor="org">Organisation name</Label>
        <Input
          id="org"
          className="mt-1"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Acme Procurement Ltd"
        />
      </div>

      {message ? (
        <p className="mt-4 text-sm text-emerald-700">{message}</p>
      ) : null}

      <Button
        className="mt-6"
        disabled={pending || !orgName.trim()}
        onClick={() => {
          startTransition(async () => {
            const result = await completeOnboarding({ role, orgName });
            setMessage(result.message);
            router.push(result.redirectTo);
          });
        }}
      >
        {pending ? "Saving…" : "Continue to dashboard"}
      </Button>
    </div>
  );
}
