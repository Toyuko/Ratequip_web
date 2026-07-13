"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useT } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

type ThemeValue = keyof typeof themeIcons;

export function ThemeToggle({ className }: { className?: string }) {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const options = [
    { value: "light" as const, label: t.theme.light },
    { value: "dark" as const, label: t.theme.dark },
    { value: "system" as const, label: t.theme.auto },
  ];

  const currentValue: ThemeValue =
    mounted && theme && theme in themeIcons
      ? (theme as ThemeValue)
      : "system";
  const CurrentIcon = themeIcons[currentValue];
  const currentLabel =
    options.find((option) => option.value === currentValue)?.label ??
    t.theme.auto;

  const selectTheme = (value: ThemeValue) => {
    setTheme(value);
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
        aria-label={t.theme.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <CurrentIcon className="h-3.5 w-3.5 text-[var(--rq-muted)]" />
        <span>{currentLabel}</span>
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
          aria-label={t.theme.label}
          className="absolute right-0 z-50 mt-1 min-w-[9.5rem] overflow-hidden rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] py-1 shadow-lg"
        >
          {options.map(({ value, label }) => {
            const active = mounted && theme === value;
            const Icon = themeIcons[value];
            return (
              <li key={value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => selectTheme(value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-[var(--rq-navy)] text-white"
                      : "text-[var(--rq-ink)] hover:bg-[var(--rq-hover)]",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
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
