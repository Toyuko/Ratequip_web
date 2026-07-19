"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import {
  deleteBlobUrl,
  uploadAccountMedia,
  uploadEvidence,
  type AccountMediaKind,
} from "@/lib/blob";
import { hasClerk } from "@/lib/config";
import {
  deleteCompanyMedia,
  persistClaim,
  persistCompanyMedia,
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

const STOCK_AVAILABILITY = new Set(["in_stock", "on_order", "unavailable"]);

export async function submitQuote(input: {
  requestId: string;
  amount: number;
  leadTimeDays: number;
  deliveryPeriodDays?: number;
  stockAvailability?: string;
  meetsRequirements?: boolean;
  deviations?: string;
  notes: string;
  companySlug?: string;
}) {
  if (!input.amount || input.amount <= 0) {
    return { ok: false as const, message: "Enter a valid quote amount." };
  }
  if (
    input.stockAvailability &&
    !STOCK_AVAILABILITY.has(input.stockAvailability)
  ) {
    return { ok: false as const, message: "Select a valid stock availability." };
  }

  const stockAvailability =
    input.stockAvailability && STOCK_AVAILABILITY.has(input.stockAvailability)
      ? (input.stockAvailability as "in_stock" | "on_order" | "unavailable")
      : undefined;

  const meetsRequirements = input.meetsRequirements !== false;
  if (!meetsRequirements && !input.deviations?.trim()) {
    return {
      ok: false as const,
      message: "List deviations where requirements cannot be met.",
    };
  }

  const actor = await actorFromCookies();
  const jar = await cookies();
  const result = await persistQuote({
    requestId: input.requestId,
    amount: input.amount,
    leadTimeDays: input.leadTimeDays,
    deliveryPeriodDays: input.deliveryPeriodDays,
    stockAvailability,
    meetsRequirements,
    deviations: input.deviations,
    notes: input.notes,
    companySlug:
      input.companySlug ?? jar.get("rq_org_slug")?.value ?? "nordicfill-systems",
    actor,
  });

  if (result.ok) {
    const buyerEmail = jar.get("rq_email")?.value ?? "buyer@example.com";
    await sendTransactionalEmail({
      to: buyerEmail,
      subject: `New quote on RFQ ${input.requestId}`,
      html: `<p>A supplier submitted a quote of ${input.amount} (${input.leadTimeDays} days lead time).</p><p>${input.notes}</p>`,
    });
  }

  return result;
}

const RFQ_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
const RFQ_ATTACHMENT_MIME_PREFIXES = ["image/"];
const RFQ_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

function isAllowedRfqAttachment(file: File) {
  if (RFQ_ATTACHMENT_MIME_TYPES.has(file.type)) return true;
  return RFQ_ATTACHMENT_MIME_PREFIXES.some((prefix) =>
    file.type.startsWith(prefix),
  );
}

const SUPPORTED_CURRENCIES = new Set([
  "USD",
  "AUD",
  "EUR",
  "GBP",
  "SGD",
  "THB",
  "VND",
  "CNY",
  "JPY",
]);

export async function createRequest(input: {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  currency?: string;
  taxTreatment?: "inclusive" | "exclusive";
  quoteValidityDays?: number;
  deliveryCountry: string;
  deliveryCity?: string;
  deliveryAddress?: string;
  dueDate?: string;
  referenceModel?: string;
  complianceStandards?: string[];
  materialOfConstruction?: string;
  utilitiesNotes?: string;
  warrantyMonthsRequired?: number;
  deliveryWeeksRequired?: number;
  scopeOfSupply?: string[];
  technicalRequirements?: {
    text: string;
    priority: "must" | "prefer" | "optional";
  }[];
  items?: {
    productName: string;
    productCode?: string;
    quantity: number;
    unit?: string;
    oemOnly?: boolean;
    notes?: string;
  }[];
  attachmentFile?: File | null;
}) {
  if (!input.title.trim() || !input.description.trim()) {
    return { ok: false as const, message: "Title and description are required." };
  }
  if (!input.deliveryCountry.trim()) {
    return { ok: false as const, message: "Delivery country is required." };
  }

  const currency = (input.currency ?? "USD").trim().toUpperCase();
  if (!SUPPORTED_CURRENCIES.has(currency)) {
    return { ok: false as const, message: "Select a supported currency." };
  }

  const taxTreatment = input.taxTreatment ?? "inclusive";
  if (taxTreatment !== "inclusive" && taxTreatment !== "exclusive") {
    return { ok: false as const, message: "Select a valid tax treatment." };
  }

  const quoteValidityDays = Math.max(
    1,
    Math.round(input.quoteValidityDays ?? 30) || 30,
  );

  const items = (input.items ?? [])
    .map((item) => ({
      productName: item.productName.trim(),
      productCode: item.productCode?.trim() || undefined,
      quantity: Math.max(1, Math.round(item.quantity) || 1),
      unit: item.unit?.trim() || undefined,
      oemOnly: Boolean(item.oemOnly),
      notes: item.notes?.trim() || undefined,
    }))
    .filter((item) => item.productName.length > 0);

  let attachmentUrl: string | undefined;
  let attachmentName: string | undefined;
  let attachmentMimeType: string | undefined;

  if (input.attachmentFile && input.attachmentFile.size > 0) {
    if (input.attachmentFile.size > RFQ_ATTACHMENT_MAX_BYTES) {
      return {
        ok: false as const,
        message: "Attachment must be 10 MB or smaller.",
      };
    }
    if (!isAllowedRfqAttachment(input.attachmentFile)) {
      return {
        ok: false as const,
        message: "Attachment must be an image, PDF, Word, Excel, or text file.",
      };
    }

    const uploaded = await uploadEvidence(
      input.attachmentFile,
      `rfqs/${Date.now().toString(36)}`,
      "public",
    );
    attachmentUrl = uploaded.url;
    attachmentName = input.attachmentFile.name;
    attachmentMimeType = input.attachmentFile.type || undefined;
  }

  const actor = await actorFromCookies();
  const organisationId = await orgIdFromCookies();
  return persistRequest({
    title: input.title,
    description: input.description,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    currency,
    taxTreatment,
    quoteValidityDays,
    deliveryCountry: input.deliveryCountry,
    deliveryCity: input.deliveryCity,
    deliveryAddress: input.deliveryAddress,
    dueDate: input.dueDate,
    referenceModel: input.referenceModel,
    complianceStandards: input.complianceStandards,
    materialOfConstruction: input.materialOfConstruction,
    utilitiesNotes: input.utilitiesNotes,
    warrantyMonthsRequired: input.warrantyMonthsRequired,
    deliveryWeeksRequired: input.deliveryWeeksRequired,
    scopeOfSupply: input.scopeOfSupply,
    technicalRequirements: input.technicalRequirements,
    items,
    actor,
    organisationId,
    attachmentUrl,
    attachmentName,
    attachmentMimeType,
  });
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

const ACCOUNT_MEDIA_MAX_BYTES: Record<AccountMediaKind, number> = {
  photo: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  document: 25 * 1024 * 1024,
};

const ACCOUNT_MEDIA_ACCEPT: Record<AccountMediaKind, (file: File) => boolean> = {
  photo: (file) => file.type.startsWith("image/"),
  video: (file) => file.type.startsWith("video/"),
  document: (file) =>
    file.type === "application/pdf" ||
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/vnd.ms-excel" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "text/plain" ||
    file.type.startsWith("image/"),
};

export async function uploadCompanyMedia(input: {
  companySlug: string;
  kind: AccountMediaKind;
  file: File | null;
  title?: string;
}) {
  if (!input.file || input.file.size <= 0) {
    return { ok: false as const, message: "Choose a file to upload." };
  }

  const maxBytes = ACCOUNT_MEDIA_MAX_BYTES[input.kind];
  if (input.file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return {
      ok: false as const,
      message: `${input.kind === "photo" ? "Photos" : input.kind === "video" ? "Videos" : "Documents"} must be ${mb} MB or smaller.`,
    };
  }

  if (!ACCOUNT_MEDIA_ACCEPT[input.kind](input.file)) {
    return {
      ok: false as const,
      message:
        input.kind === "photo"
          ? "Photos must be image files."
          : input.kind === "video"
            ? "Videos must be video files."
            : "Documents must be PDF, Word, Excel, text, or image files.",
    };
  }

  const uploaded = await uploadAccountMedia(input.file, {
    companySlug: input.companySlug,
    kind: input.kind,
    access: "public",
  });

  const actor = await actorFromCookies();
  const organisationId = await orgIdFromCookies();
  return persistCompanyMedia({
    companySlug: input.companySlug,
    kind: input.kind,
    blobUrl: uploaded.url,
    fileName: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
    byteSize: input.file.size,
    title: input.title,
    organisationId,
    actor,
  });
}

export async function removeCompanyMedia(input: {
  mediaId: string;
  companySlug: string;
}) {
  const actor = await actorFromCookies();
  const result = await deleteCompanyMedia({ ...input, actor });
  if (result.ok) {
    await deleteBlobUrl(result.blobUrl);
  }
  return result;
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
