"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

/** Only allow same-origin relative redirects (open-redirect safe). */
function safeAppRedirect(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (
      typeof window !== "undefined" &&
      url.origin === window.location.origin
    ) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function useSafeRedirect() {
  const params = useSearchParams();
  return (
    safeAppRedirect(params.get("redirect_url")) ??
    safeAppRedirect(params.get("redirectUrl"))
  );
}

export function ClerkSignInForm() {
  const redirect = useSafeRedirect();

  return (
    <SignIn
      forceRedirectUrl={redirect}
      fallbackRedirectUrl="/onboarding"
      signUpUrl="/sign-up"
    />
  );
}

export function ClerkSignUpForm() {
  const redirect = useSafeRedirect();

  return (
    <SignUp
      forceRedirectUrl={redirect ?? "/onboarding"}
      fallbackRedirectUrl="/onboarding"
      signInUrl="/sign-in"
    />
  );
}
