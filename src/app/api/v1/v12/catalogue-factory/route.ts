import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  createCatalogImport,
  listCatalogFactory,
  previewCatalogImportUsage,
  processCatalogImport,
  publishCatalogJob,
  reviewCatalogDraft,
} from "@/lib/v12/services";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  return apiResponse(req, ok(listCatalogFactory()));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    title?: string;
    sourceText?: string;
    createdBy?: string;
    rightsAttested?: boolean;
    jobId?: string;
    previewId?: string;
    confirmUsage?: boolean;
    draftId?: string;
    decision?: "accepted" | "rejected";
    reviewerId?: string;
    publisherId?: string;
  };

  if (body.action === "create") {
    if (!body.title || !body.sourceText) {
      return apiResponse(req, err("title and sourceText required"));
    }
    const res = createCatalogImport({
      title: body.title,
      sourceText: body.sourceText,
      createdBy: body.createdBy ?? "api",
      rightsAttested: Boolean(body.rightsAttested),
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  if (body.action === "preview" && body.jobId) {
    const res = previewCatalogImportUsage(body.jobId);
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  if (body.action === "process" && body.jobId) {
    const res = processCatalogImport({
      jobId: body.jobId,
      previewId: body.previewId ?? "",
      confirmUsage: Boolean(body.confirmUsage),
    });
    if (!res.ok) {
      const code = "code" in res ? res.code : undefined;
      return apiResponse(req, err(res.message, 402, code));
    }
    return apiResponse(req, ok(res));
  }

  if (
    body.action === "review" &&
    body.draftId &&
    body.decision &&
    body.reviewerId
  ) {
    const res = reviewCatalogDraft({
      draftId: body.draftId,
      decision: body.decision,
      reviewerId: body.reviewerId,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  if (body.action === "publish" && body.jobId && body.publisherId) {
    const res = publishCatalogJob({
      jobId: body.jobId,
      publisherId: body.publisherId,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  return apiResponse(req, err("Unknown catalogue-factory action"));
}
