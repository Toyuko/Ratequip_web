import {
  demoCategories,
  demoClaims,
  demoCompanies,
  demoProducts,
  demoProjects,
  demoQuotes,
  demoRequests,
  demoReviews,
  type DemoCompany,
} from "./demo-data";

export function listCategories() {
  return demoCategories;
}

export function getCategoryBySlug(slug: string) {
  return demoCategories.find((c) => c.slug === slug) ?? null;
}

export function listCompanies(opts?: {
  q?: string;
  category?: string;
  country?: string;
}) {
  let items = [...demoCompanies];
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
    items = items.filter((c) => c.categories.includes(opts.category!));
  }
  if (opts?.country) {
    items = items.filter(
      (c) => c.country.toLowerCase() === opts.country!.toLowerCase(),
    );
  }
  return items.sort((a, b) => b.trustScore - a.trustScore);
}

export function getCompanyBySlug(slug: string): DemoCompany | null {
  return demoCompanies.find((c) => c.slug === slug) ?? null;
}

export function getCompanyProducts(slug: string) {
  return demoProducts.filter((p) => p.companySlug === slug);
}

export function getCompanyReviews(slug: string) {
  return demoReviews.filter(
    (r) => r.companySlug === slug && r.status === "approved",
  );
}

export function listRequests() {
  return demoRequests;
}

export function getRequestById(id: string) {
  return demoRequests.find((r) => r.id === id || r.slug === id) ?? null;
}

export function getQuotesForRequest(requestId: string) {
  return demoQuotes.filter((q) => q.requestId === requestId);
}

export function listProjects() {
  return demoProjects;
}

export function getProjectById(id: string) {
  return demoProjects.find((p) => p.id === id || p.slug === id) ?? null;
}

export function listPendingReviews() {
  return demoReviews.filter((r) => r.status === "pending");
}

export function listPendingClaims() {
  return demoClaims.filter((c) => c.status === "pending");
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
