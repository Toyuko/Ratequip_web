"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { forwardRef, type ComponentProps } from "react";
import { signUpWithRedirect } from "@/lib/utils";

type AuthGateLinkProps = ComponentProps<typeof Link> & {
  href: string;
  /** Where guests go instead of the protected href. Defaults to sign-up with return path. */
  guestHref?: string;
};

const ClerkAuthGateLink = forwardRef<HTMLAnchorElement, AuthGateLinkProps>(
  function ClerkAuthGateLink({ href, guestHref, ...props }, ref) {
    const { isLoaded, isSignedIn } = useAuth();
    const target =
      !isLoaded || isSignedIn
        ? href
        : (guestHref ?? signUpWithRedirect(href));
    return <Link ref={ref} href={target} {...props} />;
  },
);

/** Links to protected routes; guests are sent to sign-up (or guestHref) instead of a silent auth bounce. */
export const AuthGateLink = forwardRef<HTMLAnchorElement, AuthGateLinkProps>(
  function AuthGateLink(props, ref) {
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      return <Link ref={ref} {...props} />;
    }
    return <ClerkAuthGateLink ref={ref} {...props} />;
  },
);
