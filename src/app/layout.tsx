import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteJsonLd } from "@/components/seo/json-ld";
import { brand } from "@/lib/config";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  // Avoid build failures when Google Fonts is unreachable (common in CI/offline).
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description:
    "B2B trust, procurement, supplier intelligence and equipment-lifecycle platform. Rate. Compare. Connect. Grow.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://ratequip-web.vercel.app",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <SiteJsonLd />
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--rq-orange)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
