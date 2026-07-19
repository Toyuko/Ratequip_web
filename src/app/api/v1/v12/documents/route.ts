import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  addDocumentVersion,
  approveDocumentVersion,
  createDocument,
  listDocuments,
} from "@/lib/v12/services";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  return apiResponse(req, ok(listDocuments()));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    title?: string;
    docType?: string;
    body?: string;
    createdBy?: string;
    documentId?: string;
    version?: number;
    approvedBy?: string;
    linkedType?: string;
    linkedId?: string;
  };

  if (body.action === "create" || !body.action) {
    if (!body.title || !body.body) {
      return apiResponse(req, err("title and body required"));
    }
    const res = createDocument({
      title: body.title,
      docType: body.docType ?? "general",
      body: body.body,
      createdBy: body.createdBy ?? "api",
      linkedType: body.linkedType,
      linkedId: body.linkedId,
    });
    return apiResponse(req, ok(res));
  }

  if (body.action === "version" && body.documentId && body.body) {
    const res = addDocumentVersion({
      documentId: body.documentId,
      body: body.body,
      createdBy: body.createdBy ?? "api",
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  if (
    body.action === "approve" &&
    body.documentId &&
    body.version != null &&
    body.approvedBy
  ) {
    const res = approveDocumentVersion({
      documentId: body.documentId,
      version: body.version,
      approvedBy: body.approvedBy,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  return apiResponse(req, err("Unknown documents action"));
}
