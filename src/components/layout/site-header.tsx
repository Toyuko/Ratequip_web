"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Logo } from "@/components/brand/logo";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useT } from "@/components/i18n/locale-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { AuthButtons } from "@/components/auth/auth-buttons";

export function SiteHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoVariant =
    mounted && resolvedTheme === "dark" ? "onDark" : "default";

  const nav = [
    { href: "/suppliers", label: t.nav.suppliers },
    { href: "/requests", label: t.nav.rfqs },
    { href: "/categories/packaging-machinery", label: t.nav.categories },
    { href: "/pricing", label: t.nav.pricing },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 text-ink backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo size="sm" variant={logoVariant} />
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--rq-slate)] transition hover:text-[var(--rq-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <ThemeToggle />
          <AuthButtons />
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((v) => !v)}
            aria-label={t.common.menu}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--rq-border)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-[var(--rq-slate)]"
              >
                {item.label}
              </Link>
            ))}
            <AuthButtons />
          </div>
        </div>
      ) : null}
    </header>
  );
}
