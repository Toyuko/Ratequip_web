"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

function DemoAuthButtons() {
  return (
    <>
      <Button asChild variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">Get started</Link>
      </Button>
    </>
  );
}

function ClerkAuthButtons() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <>
        <Button asChild variant="outline">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Get started</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button asChild variant="outline">
        <Link href="/dashboard/buyer">Dashboard</Link>
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
