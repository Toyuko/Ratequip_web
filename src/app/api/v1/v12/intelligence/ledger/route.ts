import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  answerIntelligenceQuestion,
  confirmRequirement,
  listAnalysisOverview,
  listIndustryPacks,
  rejectRequirement,
  uploadAndAnalyzeUrs,
} from "@/lib/v12/services";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get("runId") ?? undefined;
  if (req.nextUrl.searchParams.get("resource") === "packs") {
    return apiResponse(req, ok({ packs: listIndustryPacks() }));
  }
  return apiResponse(req, ok(listAnalysisOverview(runId)));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    title?: string;
    sourceText?: string;
    industryPack?: string;
    createdBy?: string;
    requirementId?: string;
    reviewerId?: string;
    note?: string;
    questionId?: string;
    answer?: string;
    answeredBy?: string;
  };

  if (body.action === "analyze" || body.action === "upload") {
    if (!body.title || !body.sourceText) {
      return apiResponse(req, err("title and sourceText required"));
    }
    const res = uploadAndAnalyzeUrs({
      title: body.title,
      sourceText: body.sourceText,
      industryPack: body.industryPack ?? "pharma_capping",
      createdBy: body.createdBy ?? "api",
      previewId: (body as { previewId?: string }).previewId,
      confirmUsage: (body as { confirmUsage?: boolean }).confirmUsage,
    });
    if (!res.ok) {
      return apiResponse(
        req,
        err(res.message, 402, res.code),
      );
    }
    return apiResponse(req, ok(res));
  }

  if (body.action === "confirm" && body.requirementId && body.reviewerId) {
    const res = confirmRequirement({
      requirementId: body.requirementId,
      reviewerId: body.reviewerId,
      note: body.note,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  if (body.action === "reject" && body.requirementId && body.reviewerId) {
    const res = rejectRequirement({
      requirementId: body.requirementId,
      reviewerId: body.reviewerId,
      note: body.note,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  if (
    body.action === "answer" &&
    body.questionId &&
    body.answer &&
    body.answeredBy
  ) {
    const res = answerIntelligenceQuestion({
      questionId: body.questionId,
      answer: body.answer,
      answeredBy: body.answeredBy,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  return apiResponse(req, err("Unknown intelligence ledger action"));
}
