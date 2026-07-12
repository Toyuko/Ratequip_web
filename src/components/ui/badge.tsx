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
        variant === "default" && "bg-slate-900 text-white",
        variant === "orange" && "bg-orange-100 text-orange-800",
        variant === "success" && "bg-emerald-100 text-emerald-800",
        variant === "warning" && "bg-amber-100 text-amber-900",
        variant === "muted" && "bg-slate-100 text-slate-600",
        className,
      )}
      {...props}
    />
  );
}
