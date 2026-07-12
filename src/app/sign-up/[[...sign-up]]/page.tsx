import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasClerkPublishableKey } from "@/lib/config";

export const metadata = { title: "Sign up" };

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
      <SignUp />
    </div>
  );
}
