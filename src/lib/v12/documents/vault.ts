/**
 * Thin V12 Domain 38 document vault (Release 3A).
 * Versions are immutable once issued; approve locks content hash.
 */
import { createHash } from "node:crypto";

export type DocumentRecord = {
  id: string;
  title: string;
  docType: string;
  linkedType?: string;
  linkedId?: string;
  status: "draft" | "in_review" | "approved" | "superseded" | "held";
  currentVersion: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentVersion = {
  id: string;
  documentId: string;
  version: number;
  contentHash: string;
  label: string;
  body: string;
  status: "draft" | "approved" | "superseded";
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
};

export function hashDocumentBody(body: string) {
  return createHash("sha256").update(body).digest("hex").slice(0, 24);
}
