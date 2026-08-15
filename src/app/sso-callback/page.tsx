"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { hasClerkPublishableKey } from "@/lib/config";

export default function SsoCallbackPage() {
  if (!hasClerkPublishableKey()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-[var(--rq-slate)]">
          Clerk is not configured for OAuth callbacks.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-16">
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
