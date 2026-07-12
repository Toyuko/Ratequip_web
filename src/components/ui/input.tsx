import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 py-2 text-sm text-[var(--rq-ink)] placeholder:text-[var(--rq-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rq-orange)]",
        className,
      )}
      {...props}
    />
  );
}
