"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { localeNames, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectLocale = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-2.5 text-xs font-semibold text-[var(--rq-ink)] transition-colors",
          "hover:bg-[var(--rq-hover)]",
          open && "bg-[var(--rq-hover)]",
        )}
        aria-label={t.language.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <Languages className="h-3.5 w-3.5 text-[var(--rq-muted)]" />
        <span>{localeNames[locale]}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[var(--rq-muted)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t.language.label}
          className="absolute right-0 z-50 mt-1 min-w-[9.5rem] overflow-hidden rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] py-1 shadow-lg"
        >
          {locales.map((code) => {
            const active = locale === code;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => selectLocale(code)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-[var(--rq-navy)] text-white"
                      : "text-[var(--rq-ink)] hover:bg-[var(--rq-hover)]",
                  )}
                >
                  <span>{localeNames[code]}</span>
                  {active ? <Check className="h-3.5 w-3.5" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
