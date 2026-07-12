import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasClerkPublishableKey } from "@/lib/config";

export const metadata = { title: "Sign in" };

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
      <SignIn />
    </div>
  );
}
