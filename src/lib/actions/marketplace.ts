"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { uploadEvidence } from "@/lib/blob";
import { hasClerk } from "@/lib/config";
import {
  persistClaim,
  persistCompanyProfile,
  persistProject,
  persistQuote,
  persistRequest,
  persistReview,
  updateRequestStatus,
} from "@/lib/db/phase2";
import { sendTransactionalEmail } from "@/lib/email";

async function actorFromCookies() {
  const jar = await cookies();
  return (
    jar.get("rq_email")?.value ??
    jar.get("rq_contact_name")?.value ??
    "demo-user"
  );
}

async function orgIdFromCookies() {
  const jar = await cookies();
  return jar.get("rq_org_id")?.value;
}

export async function submitQuote(input: {
  requestId: string;
  amount: number;
  leadTimeDays: number;
  notes: string;
  companySlug?: string;
}) {
  if (!input.amount || input.amount <= 0) {
    return { ok: false as const, message: "Enter a valid quote amount." };
  }

  const actor = await actorFromCookies();
  const jar = await cookies();
  const result = await persistQuote({
    ...input,
    companySlug:
      input.companySlug ?? jar.get("rq_org_slug")?.value ?? "nordicfill-systems",
    actor,
  });

  if (result.ok) {
    const buyerEmail = jar.get("rq_email")?.value ?? "buyer@example.com";
    await sendTransactionalEmail({
      to: buyerEmail,
      subject: `New quote on RFQ ${input.requestId}`,
      html: `<p>A supplier submitted a quote of ${input.amount} USD (${input.leadTimeDays} days).</p><p>${input.notes}</p>`,
    });
  }

  return result;
}

export async function createRequest(input: {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deliveryCountry: string;
}) {
  if (!input.title.trim() || !input.description.trim()) {
    return { ok: false as const, message: "Title and description are required." };
  }

  const actor = await actorFromCookies();
  const organisationId = await orgIdFromCookies();
  return persistRequest({ ...input, actor, organisationId });
}

export async function submitReview(input: {
  companySlug: string;
  rating: number;
  title: string;
  body: string;
  evidenceName?: string;
  evidenceFile?: File | null;
}) {
  if (input.rating < 1 || input.rating > 5) {
    return { ok: false as const, message: "Rating must be 1–5." };
  }

  const actor = await actorFromCookies();
  let evidenceUrl: string | undefined;
  let evidenceName = input.evidenceName;
  if (input.evidenceFile && input.evidenceFile.size > 0) {
    const uploaded = await uploadEvidence(
      input.evidenceFile,
      `reviews/${input.companySlug}`,
    );
    evidenceUrl = uploaded.url;
    evidenceName = input.evidenceFile.name;
  }

  return persistReview({
    companySlug: input.companySlug,
    rating: input.rating,
    title: input.title,
    body: input.body,
    author: actor,
    evidenceName,
    evidenceUrl,
  });
}

export async function submitClaim(input: {
  companySlug: string;
  notes: string;
  evidenceName?: string;
  evidenceFile?: File | null;
}) {
  const actor = await actorFromCookies();
  let evidenceUrl: string | undefined;
  if (input.evidenceFile && input.evidenceFile.size > 0) {
    const uploaded = await uploadEvidence(
      input.evidenceFile,
      `claims/${input.companySlug}`,
    );
    evidenceUrl = uploaded.url;
  } else if (input.evidenceName) {
    evidenceUrl = `demo://evidence/${input.evidenceName}`;
  }

  return persistClaim({
    companySlug: input.companySlug,
    notes: input.notes,
    claimant: actor,
    evidenceUrl,
  });
}

export async function createProject(input: {
  name: string;
  summary: string;
}) {
  if (!input.name.trim()) {
    return { ok: false as const, message: "Project name is required." };
  }
  const actor = await actorFromCookies();
  const organisationId = await orgIdFromCookies();
  return persistProject({ ...input, actor, organisationId });
}

export async function closeOrAwardRequest(input: {
  requestId: string;
  status: "closed" | "awarded";
}) {
  const actor = await actorFromCookies();
  return updateRequestStatus({
    requestId: input.requestId,
    status: input.status,
    actor,
  });
}

export async function updateCompanyProfile(input: {
  companySlug: string;
  name: string;
  headline: string;
  description: string;
  city: string;
  country: string;
}) {
  if (!input.name.trim()) {
    return { ok: false as const, message: "Company name is required." };
  }
  const actor = await actorFromCookies();
  return persistCompanyProfile({ ...input, actor });
}

export async function getSessionClerkId() {
  if (!hasClerk()) return null;
  try {
    const session = await auth();
    return session.userId;
  } catch {
    return null;
  }
}
