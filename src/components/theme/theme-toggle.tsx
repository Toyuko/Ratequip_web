"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useT } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = [
    { value: "light", label: t.theme.light, icon: Sun },
    { value: "dark", label: t.theme.dark, icon: Moon },
    { value: "system", label: t.theme.auto, icon: Monitor },
  ] as const;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] p-0.5",
        className,
      )}
      role="group"
      aria-label={t.theme.label}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-[5px] transition-colors",
              active
                ? "bg-[var(--rq-navy)] text-white"
                : "text-[var(--rq-muted)] hover:text-[var(--rq-ink)]",
            )}
            aria-label={label}
            aria-pressed={active}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
