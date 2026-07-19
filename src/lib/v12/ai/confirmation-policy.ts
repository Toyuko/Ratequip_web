/** ADR-0007 — AI output remains draft until authorised confirmation */
export const CONFIRMATION_REQUIRED = new Set([
  "publish_rfq",
  "invite_supplier",
  "submit_quote",
  "award_contract",
  "publish_claim",
  "assert_compliance",
  "send_external_message",
  "charge_entitlement",
  "change_permission",
  "delete_record",
]);

export interface AIAction {
  type: string;
  draftId: string;
  companyId: string;
  requestedBy: string;
}

export function mayExecuteWithoutConfirmation(action: AIAction): boolean {
  return !CONFIRMATION_REQUIRED.has(action.type);
}

export type AIDraftStatus = "draft" | "confirmed" | "rejected";

export interface AIDraft {
  id: string;
  type: string;
  title: string;
  body: string;
  companyId: string;
  requestedBy: string;
  status: AIDraftStatus;
  groundingRefs: string[];
  createdAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}
