"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { hasClerk, isDemoMode } from "@/lib/config";
import { looksLikeEmail } from "@/lib/email";
import {
  confirmUsagePreview,
  createCatalogImportFromUrl,
  listCatalogFactory,
  previewCatalogImportUsage,
  processCatalogImport,
  publishCatalogJob,
  reviewCatalogDraft,
} from "@/lib/v12/services";

async function requireMutationActor(): Promise<
  { ok: true; actor: string } | { ok: false; message: string }
> {
  if (hasClerk()) {
    try {
      const session = await auth();
      if (!session.userId) {
        return {
          ok: false,
          message: "Sign in required to import products.",
        };
      }
    } catch {
      return { ok: false, message: "Sign in required to import products." };
    }
  } else if (!isDemoMode()) {
    return { ok: false, message: "Sign in required to import products." };
  } else {
    const jar = await cookies();
    if (
      jar.get("rq_onboarded")?.value !== "1" &&
      !jar.get("rq_email")?.value
    ) {
      return {
        ok: false,
        message: "Sign in or complete demo onboarding first.",
      };
    }
  }
  return { ok: true, actor: await actorFromCookies() };
}

async function actorFromCookies() {
  if (hasClerk()) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      const clerkEmail = user?.primaryEmailAddress?.emailAddress;
      if (looksLikeEmail(clerkEmail)) return clerkEmail;
    } catch {
      // Fall through
    }
  }
  const jar = await cookies();
  return (
    jar.get("rq_email")?.value ??
    jar.get("rq_contact_name")?.value ??
    "demo-supplier"
  );
}

async function companySlugFromCookies(fallback?: string) {
  const jar = await cookies();
  return jar.get("rq_org_slug")?.value ?? fallback ?? "nordicfill-systems";
}

/** Fetch marketplace URL → drafts ready for review. */
export async function importMarketplaceCatalogue(input: {
  sourceUrl: string;
  rightsAttested: boolean;
  companySlug?: string;
}) {
  const gate = await requireMutationActor();
  if (!gate.ok) return { ok: false as const, message: gate.message };

  const companySlug = input.companySlug ?? (await companySlugFromCookies());
  const created = await createCatalogImportFromUrl({
    sourceUrl: input.sourceUrl,
    createdBy: gate.actor,
    rightsAttested: input.rightsAttested,
    companySlug,
  });
  if (!created.ok) return created;

  const previewRes = previewCatalogImportUsage(created.job.id);
  if (!previewRes.ok) return previewRes;

  confirmUsagePreview({
    previewId: previewRes.preview.id,
    confirmedBy: gate.actor,
  });

  const processed = processCatalogImport({
    jobId: created.job.id,
    previewId: previewRes.preview.id,
    confirmUsage: true,
    usePackagingFixture: false,
  });
  if (!processed.ok) return processed;

  return {
    ok: true as const,
    job: processed.job,
    drafts: processed.drafts,
    entitlementRemaining: processed.entitlementRemaining,
    estimatedCredits: created.job.estimatedCredits,
    sourceUrl: created.job.sourceUrl,
    adapter: created.job.marketplaceAdapter,
    message: `Found ${processed.drafts.length} listing${processed.drafts.length === 1 ? "" : "s"} to review.`,
  };
}

export async function reviewMarketplaceDraft(input: {
  draftId: string;
  decision: "accepted" | "rejected";
}) {
  const gate = await requireMutationActor();
  if (!gate.ok) return { ok: false as const, message: gate.message };

  return reviewCatalogDraft({
    draftId: input.draftId,
    decision: input.decision,
    reviewerId: gate.actor,
  });
}

export async function publishMarketplaceImport(input: {
  jobId: string;
  companySlug?: string;
}) {
  const gate = await requireMutationActor();
  if (!gate.ok) return { ok: false as const, message: gate.message };

  const companySlug = input.companySlug ?? (await companySlugFromCookies());
  const res = await publishCatalogJob({
    jobId: input.jobId,
    publisherId: gate.actor,
    companySlug,
  });
  if (!res.ok) return res;

  return {
    ...res,
    message: res.companySlug
      ? `Published ${res.publishedCount} product${res.publishedCount === 1 ? "" : "s"} to your catalogue.`
      : `Published ${res.publishedCount} product drafts.`,
  };
}

export async function listMarketplaceImportState(companySlug?: string) {
  const slug = companySlug ?? (await companySlugFromCookies());
  const data = listCatalogFactory();
  const jobs = data.jobs.filter(
    (j) =>
      j.sourceKind === "marketplace_url" &&
      (!j.companySlug || j.companySlug === slug),
  );
  const jobIds = new Set(jobs.map((j) => j.id));
  const drafts = data.drafts.filter((d) => jobIds.has(d.jobId));
  return {
    companySlug: slug,
    jobs,
    drafts,
    entitlementRemaining: data.entitlementRemaining,
  };
}
