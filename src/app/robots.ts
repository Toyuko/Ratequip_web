import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const origin = publicAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/sign-in",
          "/sign-up",
          "/onboarding",
          "/v12/",
          "/v13",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
