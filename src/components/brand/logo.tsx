import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/config";
import { cn } from "@/lib/utils";

const LOGO = {
  default: {
    src: "/brand/ratequip-logo.png",
    width: 921,
    height: 446,
  },
  onDark: {
    src: "/brand/ratequip-logo-on-dark.png",
    width: 921,
    height: 446,
  },
} as const;

const SIZE_HEIGHT = {
  sm: 40,
  md: 56,
  lg: 80,
  hero: 120,
} as const;

export function Logo({
  className,
  priority = false,
  size = "md",
  variant = "default",
}: {
  className?: string;
  priority?: boolean;
  size?: keyof typeof SIZE_HEIGHT;
  /** Use `onDark` on navy/black surfaces so navy wordmark stays readable. */
  variant?: keyof typeof LOGO;
}) {
  const asset = LOGO[variant];
  const height = SIZE_HEIGHT[size];
  const width = Math.round((height * asset.width) / asset.height);

  return (
    <Link href="/" className={cn("inline-flex items-center", className)}>
      <Image
        src={asset.src}
        alt={brand.name}
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-auto max-h-full object-contain"
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}
