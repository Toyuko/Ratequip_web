"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { signUpWithRedirect } from "@/lib/utils";

function PromptBody({ returnPath }: { returnPath: string }) {
  return (
    <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/30">
      <p className="text-sm font-semibold text-[var(--rq-ink)]">
        Join RateQuip to save progress and claim your company
      </p>
      <p className="mt-1 text-sm text-[var(--rq-slate)]">
        Create a free account so we can verify you and keep company access on
        your dashboard.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={signUpWithRedirect(returnPath)}>Join RateQuip</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`}
          >
            Sign in
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ClerkWizardSignUpPrompt({ returnPath }: { returnPath: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded || isSignedIn) return null;
  return <PromptBody returnPath={returnPath} />;
}

/** Shown to guests in company add/claim wizards when Clerk auth is enabled. */
export function WizardSignUpPrompt() {
  const pathname = usePathname();
  const returnPath = pathname || "/companies/search";

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return null;
  }

  return <ClerkWizardSignUpPrompt returnPath={returnPath} />;
}
