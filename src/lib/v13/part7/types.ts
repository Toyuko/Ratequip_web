export type ProfileStatus = "draft" | "in_review" | "confirmed" | "archived";

export type ConfirmationStatus =
  | "observed"
  | "inferred"
  | "confirmed"
  | "rejected"
  | "superseded";

export type BusinessFact = {
  id: string;
  tenantId: string;
  businessProfileId: string;
  predicate: string;
  objectJson: Record<string, unknown>;
  sourceType: string;
  sourceId?: string;
  confidence: number;
  confirmationStatus: ConfirmationStatus;
  validFrom: string;
  validTo?: string;
  lastVerifiedAt?: string;
  createdBy?: string;
  createdAt: string;
};

export type BusinessProfile = {
  id: string;
  tenantId: string;
  companyId?: string;
  setupSessionId?: string;
  operatingProfileId?: string;
  legalName: string;
  role?: string;
  industryPack?: string;
  profileStatus: ProfileStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export type SetupCheckpoint = {
  tenantId: string;
  setupSessionId: string;
  businessProfileId?: string;
  payload: Record<string, unknown>;
  updatedAt: string;
};
