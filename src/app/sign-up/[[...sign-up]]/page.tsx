import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { hasClerkPublishableKey } from "@/lib/config";

export const metadata = { title: "Sign up" };

function ClerkLoading() {
  return (
    <div className="w-full max-w-md rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-8 text-center">
      <p className="text-sm font-medium text-[var(--rq-ink)]">Loading sign-up…</p>
      <p className="mt-2 text-xs text-[var(--rq-muted)]">
        Secure registration is loading. If this stays blank, refresh or check
        network access to Clerk.
      </p>
    </div>
  );
}

export default function SignUpPage() {
  if (!hasClerkPublishableKey()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-[var(--rq-ink)]">
          Demo sign up
        </h1>
        <p className="mt-3 text-[var(--rq-slate)]">
          Add Clerk keys to enable real registration. For now, start onboarding
          in demo mode.
        </p>
        <Button asChild className="mt-8">
          <Link href="/onboarding">Continue to onboarding</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-16">
      <Suspense fallback={<ClerkLoading />}>
        <SignUp />
      </Suspense>
    </div>
  );
}
