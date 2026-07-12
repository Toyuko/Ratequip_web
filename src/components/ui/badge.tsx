import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "orange" | "success" | "warning" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
        variant === "default" && "bg-[var(--rq-navy)] text-white",
        variant === "orange" &&
          "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
        variant === "success" &&
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
        variant === "warning" &&
          "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
        variant === "muted" &&
          "bg-[var(--rq-hover)] text-[var(--rq-slate)]",
        className,
      )}
      {...props}
    />
  );
}
