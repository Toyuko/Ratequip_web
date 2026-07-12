import { cn } from "@/lib/utils";

export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        interactive
          ? "rounded-lg border border-[var(--rq-border)] bg-white p-5 shadow-sm transition hover:border-orange-300"
          : "rounded-lg border border-transparent bg-transparent p-0",
        className,
      )}
      {...props}
    />
  );
}
