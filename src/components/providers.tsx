"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/components/i18n/locale-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const tree = (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );

  if (!publishableKey) {
    return tree;
  }

  return <ClerkProvider publishableKey={publishableKey}>{tree}</ClerkProvider>;
}
