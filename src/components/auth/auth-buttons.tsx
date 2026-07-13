"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useT } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";

function DemoAuthButtons() {
  const t = useT();
  return (
    <>
      <Button asChild variant="outline">
        <Link href="/sign-in">{t.auth.signIn}</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">{t.auth.getStarted}</Link>
      </Button>
    </>
  );
}

function ClerkAuthButtons() {
  const t = useT();
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <>
        <Button asChild variant="outline">
          <Link href="/sign-in">{t.auth.signIn}</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">{t.auth.getStarted}</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button asChild variant="outline">
        <Link href="/dashboard/buyer">{t.auth.dashboard}</Link>
      </Button>
      <UserButton />
    </>
  );
}

export function AuthButtons() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <DemoAuthButtons />;
  }
  return <ClerkAuthButtons />;
}
