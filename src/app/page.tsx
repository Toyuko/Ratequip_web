import { HomePageClient } from "@/components/home/home-page-client";
import {
  demoCompanies,
  demoRequests,
  type DemoCompany,
  type DemoRequest,
} from "@/lib/db/demo-data";
import { listCompanies, listRequests } from "@/lib/db/queries";

const SHOWCASE_COMPANY_SLUGS = [
  "nordicfill-systems",
  "apex-robotics-asia",
  "sealtech-asia",
  "blendcraft-process",
  "inkjetprint",
  "cleanair-plant-solutions",
] as const;

const SHOWCASE_REQUEST_IDS = ["req-1", "req-2", "req-3"] as const;

function isJunkTitle(title: string) {
  const t = title.toLowerCase();
  return (
    t.includes("smoke") ||
    t.includes("stripe uat") ||
    t.includes("evidence") ||
    t.includes("uat ") ||
    t.length < 8 ||
    /^[a-z0-9]{6,}$/i.test(t.trim()) ||
    /\d{6,}/.test(t)
  );
}

function pickFeatured(companies: DemoCompany[]): DemoCompany[] {
  const bySlug = new Map(companies.map((c) => [c.slug, c]));
  const fromLive = SHOWCASE_COMPANY_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (c): c is DemoCompany => Boolean(c),
  );
  if (fromLive.length >= 3) return fromLive.slice(0, 4);

  const fromDemo = SHOWCASE_COMPANY_SLUGS.map((slug) =>
    demoCompanies.find((c) => c.slug === slug),
  ).filter((c): c is DemoCompany => Boolean(c));

  return fromDemo.slice(0, 4);
}

function pickRequests(requests: DemoRequest[]): DemoRequest[] {
  const byId = new Map(requests.map((r) => [r.id, r]));
  const curated = SHOWCASE_REQUEST_IDS.map((id) => byId.get(id)).filter(
    (r): r is DemoRequest =>
      r !== undefined && r !== null && !isJunkTitle(r.title),
  );
  if (curated.length >= 3) return curated;

  const cleanLive = requests
    .filter((r) => r.status === "open" && !isJunkTitle(r.title))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (cleanLive.length >= 3) return cleanLive.slice(0, 4);

  return demoRequests
    .filter((r) => SHOWCASE_REQUEST_IDS.includes(r.id as (typeof SHOWCASE_REQUEST_IDS)[number]))
    .slice(0, 4);
}

export default async function HomePage() {
  const [companies, requests] = await Promise.all([
    listCompanies(),
    listRequests(),
  ]);

  return (
    <HomePageClient
      featured={pickFeatured(companies)}
      requests={pickRequests(requests)}
    />
  );
}
