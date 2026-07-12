import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 py-2 text-sm text-[var(--rq-ink)] placeholder:text-[var(--rq-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rq-orange)]",
        className,
      )}
      {...props}
    />
  );
}
