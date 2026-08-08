import Link from "next/link";
import { Suspense } from "react";
import { ClerkSignInForm } from "@/components/auth/clerk-auth-forms";
import { Button } from "@/components/ui/button";
import { hasClerkPublishableKey } from "@/lib/config";

export const metadata = { title: "Sign in" };

function ClerkLoading() {
  return (
    <div className="w-full max-w-md rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-8 text-center">
      <p className="text-sm font-medium text-[var(--rq-ink)]">Loading sign-in…</p>
    </div>
  );
}

export default function SignInPage() {
  if (!hasClerkPublishableKey()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-[var(--rq-ink)]">
          Demo sign in
        </h1>
        <p className="mt-3 text-[var(--rq-slate)]">
          Clerk keys are not configured. Explore role dashboards in demo mode.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild>
            <Link href="/dashboard/buyer">Continue as buyer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/supplier">Continue as supplier</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin">Continue as admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-16">
      <Suspense fallback={<ClerkLoading />}>
        <ClerkSignInForm />
      </Suspense>
    </div>
  );
}
