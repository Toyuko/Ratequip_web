"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { hasClerk } from "@/lib/config";
import {
  persistClaim,
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

export async function submitQuote(input: {
  requestId: string;
  amount: number;
  leadTimeDays: number;
  notes: string;
}) {
  if (!input.amount || input.amount <= 0) {
    return { ok: false as const, message: "Enter a valid quote amount." };
  }

  const actor = await actorFromCookies();
  const result = await persistQuote({
    ...input,
    actor,
  });

  if (result.ok) {
    await sendTransactionalEmail({
      to: "buyer@example.com",
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
  return persistRequest({ ...input, actor });
}

export async function submitReview(input: {
  companySlug: string;
  rating: number;
  title: string;
  body: string;
  evidenceName?: string;
}) {
  if (input.rating < 1 || input.rating > 5) {
    return { ok: false as const, message: "Rating must be 1–5." };
  }

  const actor = await actorFromCookies();
  return persistReview({
    ...input,
    author: actor,
  });
}

export async function submitClaim(input: {
  companySlug: string;
  notes: string;
  evidenceName?: string;
}) {
  const actor = await actorFromCookies();
  return persistClaim({
    companySlug: input.companySlug,
    notes: input.notes,
    claimant: actor,
    evidenceUrl: input.evidenceName
      ? `demo://evidence/${input.evidenceName}`
      : undefined,
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
  return persistProject({ ...input, actor });
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

export async function getSessionClerkId() {
  if (!hasClerk()) return null;
  try {
    const session = await auth();
    return session.userId;
  } catch {
    return null;
  }
}
