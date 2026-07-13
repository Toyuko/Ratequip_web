"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] p-0.5",
        className,
      )}
      role="group"
      aria-label={t.language.label}
    >
      {locales.map((code: Locale) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center rounded-[5px] px-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-[var(--rq-navy)] text-white"
                : "text-[var(--rq-muted)] hover:text-[var(--rq-ink)]",
            )}
            aria-label={localeLabels[code]}
            aria-pressed={active}
            title={localeLabels[code]}
          >
            {localeLabels[code]}
          </button>
        );
      })}
    </div>
  );
}
