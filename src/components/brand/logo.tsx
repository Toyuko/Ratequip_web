import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  priority = false,
  size = "md",
}: {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg" | "hero";
}) {
  const dims = {
    sm: { w: 120, h: 48 },
    md: { w: 160, h: 64 },
    lg: { w: 220, h: 88 },
    hero: { w: 320, h: 128 },
  }[size];

  return (
    <Link href="/" className={cn("inline-flex items-center", className)}>
      <Image
        src="/brand/ratequip-logo.png"
        alt={brand.name}
        width={dims.w}
        height={dims.h}
        priority={priority}
        className="h-auto w-auto object-contain"
      />
    </Link>
  );
}
