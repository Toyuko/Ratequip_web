import {
  demoCategories,
  type DemoCompany,
} from "./demo-data";
import {
  getRuntimeProjects,
  getRuntimeQuotes,
  getRuntimeRequests,
  getRuntimeReviews,
  listCompaniesAsync,
  listPendingClaimsAsync,
  listPendingReviewsAsync,
} from "./phase2";
import { getStore } from "./runtime-store";

export function listCategories() {
  return demoCategories;
}

export function listTopCategories() {
  return demoCategories.filter((c) => !c.parentId);
}

export function listChildCategories(parentId: string) {
  return demoCategories.filter((c) => c.parentId === parentId);
}

export function getCategoryBySlug(slug: string) {
  return demoCategories.find((c) => c.slug === slug) ?? null;
}

/** Slugs that match a category filter: the slug itself plus all descendants. */
export function categoryMatchSlugs(slug: string): string[] {
  const category = getCategoryBySlug(slug);
  if (!category) return [slug];
  const children = listChildCategories(category.id).map((c) => c.slug);
  return [category.slug, ...children];
}

export function listCompanies(opts?: {
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
  if (opts?.category) {
    const match = new Set(categoryMatchSlugs(opts.category));
    items = items.filter((c) => c.categories.some((slug) => match.has(slug)));
  }
  if (opts?.country) {
    items = items.filter(
      (c) => c.country.toLowerCase() === opts.country!.toLowerCase(),
    );
  }
  return items.sort((a, b) => b.trustScore - a.trustScore);
}

export function getCompanyBySlug(slug: string): DemoCompany | null {
  return getStore().companies.find((c) => c.slug === slug) ?? null;
}

export function getCompanyProducts(slug: string) {
  return getStore().products.filter((p) => p.companySlug === slug);
}

export function getCompanyReviews(slug: string) {
  return getRuntimeReviews(slug).filter((r) => r.status === "approved");
}

export function listRequests() {
  return getRuntimeRequests();
}

export function getRequestById(id: string) {
  return getRuntimeRequests().find((r) => r.id === id || r.slug === id) ?? null;
}

export function getQuotesForRequest(requestId: string) {
  return getRuntimeQuotes().filter((q) => q.requestId === requestId);
}

export function listProjects() {
  return getRuntimeProjects();
}

export function getProjectById(id: string) {
  return getRuntimeProjects().find((p) => p.id === id || p.slug === id) ?? null;
}

export function listPendingReviews() {
  return getStore().reviews.filter((r) => r.status === "pending");
}

export function listPendingClaims() {
  return getStore().claims.filter((c) => c.status === "pending");
}

export function searchAll(q: string) {
  const query = q.trim().toLowerCase();
  if (!query) {
    return { companies: listCompanies(), requests: listRequests() };
  }
  return {
    companies: listCompanies({ q: query }),
    requests: listRequests().filter(
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
