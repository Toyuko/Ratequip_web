"use server";

import { calculateTrustScore } from "@/lib/trust-score";
import { sendTransactionalEmail } from "@/lib/email";

export async function submitQuote(input: {
  requestId: string;
  amount: number;
  leadTimeDays: number;
  notes: string;
}) {
  if (!input.amount || input.amount <= 0) {
    return { ok: false, message: "Enter a valid quote amount." };
  }

  await sendTransactionalEmail({
    to: "buyer@example.com",
    subject: `New quote on RFQ ${input.requestId}`,
    html: `<p>A supplier submitted a quote of ${input.amount} USD (${input.leadTimeDays} days).</p><p>${input.notes}</p>`,
  });

  return {
    ok: true,
    message: `Quote of $${input.amount} submitted for ${input.requestId} (demo ledger + email logged).`,
  };
}

export async function createRequest(input: {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deliveryCountry: string;
}) {
  if (!input.title.trim() || !input.description.trim()) {
    return { ok: false, message: "Title and description are required." };
  }

  return {
    ok: true,
    message: `RFQ “${input.title}” created. 25 credits reserved for lead distribution (demo).`,
    id: `req-demo-${Date.now()}`,
  };
}

export async function submitReview(input: {
  companySlug: string;
  rating: number;
  title: string;
  body: string;
  evidenceName?: string;
}) {
  if (input.rating < 1 || input.rating > 5) {
    return { ok: false, message: "Rating must be 1–5." };
  }

  const score = calculateTrustScore({
    avgRating: input.rating,
    reviewCount: 1,
    verifiedReviewShare: input.evidenceName ? 1 : 0,
    verifiedCompany: true,
    claimedCompany: true,
    responseRate: 0.8,
  });

  return {
    ok: true,
    message: `Review submitted for moderation. Provisional Trust Score impact: ${score.score}.`,
  };
}

export async function submitClaim(input: {
  companySlug: string;
  notes: string;
  evidenceName?: string;
}) {
  return {
    ok: true,
    message: `Claim for ${input.companySlug} queued for admin review${
      input.evidenceName ? ` with evidence ${input.evidenceName}` : ""
    }.`,
  };
}

export async function createProject(input: {
  name: string;
  summary: string;
}) {
  if (!input.name.trim()) {
    return { ok: false, message: "Project name is required." };
  }
  return {
    ok: true,
    message: `Project “${input.name}” created.`,
    id: `proj-demo-${Date.now()}`,
  };
}
