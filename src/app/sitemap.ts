import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/config";
import { blueprintCapabilities } from "@/data/blueprint/capabilities";
import { blueprintEconomies } from "@/data/blueprint/economies";
import { solutionPages } from "@/data/blueprint/solutions";
import { upcomingModules } from "@/lib/db/demo-data";
import { listCategories, listCompanies, listRequests } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.8 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { path: "/trust", changeFrequency: "monthly", priority: 0.7 },
  { path: "/security", changeFrequency: "monthly", priority: 0.5 },
  { path: "/roadmap", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/search", changeFrequency: "daily", priority: 0.8 },
  { path: "/suppliers", changeFrequency: "daily", priority: 0.8 },
  { path: "/companies/search", changeFrequency: "weekly", priority: 0.6 },
  { path: "/companies/claim", changeFrequency: "monthly", priority: 0.5 },
  { path: "/requests", changeFrequency: "hourly", priority: 0.8 },
  { path: "/requests/new", changeFrequency: "monthly", priority: 0.6 },
  { path: "/quotes/compare", changeFrequency: "monthly", priority: 0.5 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.7 },
  { path: "/economies", changeFrequency: "monthly", priority: 0.7 },
  { path: "/capabilities", changeFrequency: "monthly", priority: 0.7 },
  { path: "/modules", changeFrequency: "monthly", priority: 0.5 },
  { path: "/collaborate", changeFrequency: "weekly", priority: 0.6 },
  { path: "/referrals", changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = publicAppUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${origin}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  for (const economy of blueprintEconomies) {
    entries.push({
      url: `${origin}/economies/${economy.key}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  for (const cap of blueprintCapabilities) {
    entries.push({
      url: `${origin}/capabilities/${cap.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }
  for (const solution of solutionPages) {
    entries.push({
      url: `${origin}/solutions/${solution.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  for (const mod of upcomingModules) {
    entries.push({
      url: `${origin}/modules/${mod.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  const [companies, categories, requests] = await Promise.all([
    listCompanies({ limit: 200 }),
    listCategories(),
    listRequests(),
  ]);

  for (const company of companies) {
    entries.push({
      url: `${origin}/companies/${company.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const category of categories) {
    entries.push({
      url: `${origin}/categories/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }
  for (const request of requests) {
    entries.push({
      url: `${origin}/requests/${request.id}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  return entries;
}
