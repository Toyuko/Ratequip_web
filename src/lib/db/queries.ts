import {
  demoCategories,
  type DemoCompany,
} from "./demo-data";
import {
  getCompanyBySlugAsync,
  getCompanyProductsAsync,
  getCompanyReviewsAsync,
  getQuotesForRequestAsync,
  getRequestByIdAsync,
  getRuntimeProjects,
  listCategoriesAsync,
  listCompaniesAsync,
  listCompanyMediaAsync,
  listPendingClaimsAsync,
  listPendingReviewsAsync,
  listRequestsAsync,
} from "./phase2";
import { getStore } from "./runtime-store";

export async function listCategories() {
  return listCategoriesAsync();
}

export async function listTopCategories() {
  const cats = await listCategoriesAsync();
  return cats.filter((c) => !c.parentId);
}

export async function listChildCategories(parentId: string) {
  const cats = await listCategoriesAsync();
  return cats.filter((c) => c.parentId === parentId);
}

export async function getCategoryBySlug(slug: string) {
  const cats = await listCategoriesAsync();
  return cats.find((c) => c.slug === slug) ?? null;
}

/** Slugs that match a category filter: the slug itself plus all descendants. */
export async function categoryMatchSlugs(slug: string): Promise<string[]> {
  const cats = await listCategoriesAsync();
  const category = cats.find((c) => c.slug === slug);
  if (!category) return [slug];
  const children = cats
    .filter((c) => c.parentId === category.id)
    .map((c) => c.slug);
  return [category.slug, ...children];
}

export async function listCompanies(opts?: {
  q?: string;
  category?: string;
  country?: string;
  limit?: number;
}) {
  return listCompaniesAsync(opts);
}

export async function getCompanyBySlug(
  slug: string,
): Promise<DemoCompany | null> {
  return getCompanyBySlugAsync(slug);
}

export async function getCompanyProducts(slug: string) {
  return getCompanyProductsAsync(slug);
}

export async function getCompanyReviews(slug: string) {
  return getCompanyReviewsAsync(slug);
}

export async function getCompanyMedia(slug: string) {
  return listCompanyMediaAsync(slug);
}

export async function listRequests() {
  return listRequestsAsync();
}

export async function getRequestById(id: string) {
  return getRequestByIdAsync(id);
}

export async function getQuotesForRequest(requestId: string) {
  return getQuotesForRequestAsync(requestId);
}

export async function listProjects() {
  return getRuntimeProjects();
}

export async function getProjectById(id: string) {
  return getRuntimeProjects().find((p) => p.id === id || p.slug === id) ?? null;
}

export async function listPendingReviews() {
  return listPendingReviewsAsync();
}

export async function listPendingClaims() {
  return listPendingClaimsAsync();
}

export async function searchAll(q: string) {
  const query = q.trim().toLowerCase();
  if (!query) {
    return {
      companies: await listCompanies(),
      requests: await listRequests(),
    };
  }
  return {
    companies: await listCompanies({ q: query }),
    requests: (await listRequests()).filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query),
    ),
  };
}

// Async Neon-aware variants for server routes that prefer DB when available
export {
  listCompaniesAsync,
  listPendingClaimsAsync,
  listPendingReviewsAsync,
};

/** Sync fallback for rare client-side demo reads — prefer async server queries. */
export function listCategoriesSync() {
  return demoCategories;
}

export function listCompaniesSync(opts?: {
  q?: string;
  category?: string;
  country?: string;
}) {
  let items = [...getStore().companies];
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }
  if (opts?.country) {
    items = items.filter(
      (c) => c.country.toLowerCase() === opts.country!.toLowerCase(),
    );
  }
  return items.sort((a, b) => b.trustScore - a.trustScore);
}
