"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { hasClerkPublishableKey } from "@/lib/config";

/**
 * Sign In with LinkedIn via Clerk OIDC (`oauth_linkedin_oidc`).
 * Enable LinkedIn in the Clerk dashboard before using in production.
 */
export function LinkedInSignInButton({
  redirectComplete = "/operators/join",
}: {
  redirectComplete?: string;
}) {
  if (!hasClerkPublishableKey()) {
    return (
      <p className="rounded-md border border-dashed border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-3 text-sm text-[var(--rq-muted)]">
        Sign in with LinkedIn needs Clerk + LinkedIn OIDC enabled. You can still
        join the pool with the form below.
      </p>
    );
  }

  return <ClerkLinkedInButton redirectComplete={redirectComplete} />;
}

function ClerkLinkedInButton({ redirectComplete }: { redirectComplete: string }) {
  const { signIn, fetchStatus } = useSignIn();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const ready = Boolean(signIn) && fetchStatus !== "fetching";

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        disabled={!ready || pending}
        onClick={() => {
          if (!signIn) return;
          setError(null);
          setPending(true);
          void signIn
            .sso({
              strategy: "oauth_linkedin_oidc",
              redirectUrl: redirectComplete,
              redirectCallbackUrl: "/sso-callback",
            })
            .catch((err: unknown) => {
              setPending(false);
              setError(
                err instanceof Error
                  ? err.message
                  : "LinkedIn sign-in failed. Enable oauth_linkedin_oidc in Clerk.",
              );
            });
        }}
      >
        {pending ? "Redirecting…" : "Continue with LinkedIn"}
      </Button>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
