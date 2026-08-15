/**
 * Canonical operator / gig domain. Adapters must not leak board types here.
 */

export type BoardId = "seek" | "indeed" | "linkedin" | "direct";

export type OperatorStatus = "ACTIVE" | "MERGED" | "INACTIVE";

export type CredentialStatus = "ACTIVE" | "EXPIRED" | "SUSPENDED" | "REVOKED";

export type VerificationMethod =
  | "REGISTER_LOOKUP"
  | "DOCUMENT_CAPTURE"
  | "ISSUER_CONTACT"
  | "SELF_DECLARED";

export type PipelineState =
  | "APPLIED"
  | "SCREENING"
  | "CREDENTIAL_CHECK"
  | "VERIFIED"
  | "PLACED"
  | "REJECTED";

export type DispositionStatus =
  | "NEW"
  | "REVIEW"
  | "SCREEN"
  | "INTERVIEW"
  | "OFFER"
  | "HIRE"
  | "REJECT";

export type GigStatus = "DRAFT" | "OPEN" | "FILLED" | "CANCELLED" | "EXPIRED";

export type PublicationState =
  | "PENDING"
  | "LIVE"
  | "REJECTED"
  | "CLOSED"
  | "EXPIRED";

export const PRIVACY_NOTICE_VERSION = "operator-pool-v1";

export const RATEQUIP_HIRER_ID = "hirer_ratequip";

export type HirerContext = {
  hirerId: string;
  boardAccountRef: string;
  credentialsRef: string;
};

export type BoardCapabilities = {
  screeningQuestions: boolean;
  attachments: boolean;
  dispositionSync: false | { required: true; minCadence: "daily" };
  renewPosting: boolean;
  asyncPublish: boolean;
  requiresHirerRelationship: boolean;
  applicationRetentionDays: number | null;
};

export type CanonicalGig = {
  id: string;
  hirerId: string;
  bookingId?: string;
  requestId?: string;
  engagementId?: string;
  equipmentClass: string;
  requiredCredentials: string[];
  siteLat?: number;
  siteLng?: number;
  siteLabel?: string;
  startsAt: string;
  endsAt: string;
  rateCents: number;
  currency: string;
  title: string;
  description?: string;
  status: GigStatus;
  createdAt: string;
};

export type GigPublication = {
  id: string;
  gigId: string;
  board: BoardId;
  externalPostingId?: string;
  externalTaskId?: string;
  state: PublicationState;
  taxonomyVersion?: string;
  publishedAt?: string;
  expiresAt?: string;
  lastReconciledAt?: string;
  adSpendCents: number;
};

export type CanonicalApplication = {
  id: string;
  gigPublicationId?: string;
  partyId?: string;
  board: BoardId;
  externalApplicationId: string;
  receivedAt: string;
  sourcePayloadBlobUrl?: string;
  pipelineState: PipelineState;
  givenName?: string;
  familyName?: string;
  email?: string;
  phone?: string;
  resumeFileName?: string;
  resumeBase64?: string;
  answers: Record<string, string>;
};

export type PublishResult = {
  ok: boolean;
  externalPostingId?: string;
  externalTaskId?: string;
  state: PublicationState;
  message?: string;
};

export type InboundEnvelope = {
  board: BoardId;
  externalEventId: string;
  raw: Record<string, unknown>;
};

export type RawInboundRequest = {
  headers: Record<string, string | null>;
  rawBody: string;
};

export interface JobBoardAdapter {
  readonly board: BoardId;
  capabilities(): BoardCapabilities;
  publishGig(ctx: HirerContext, gig: CanonicalGig): Promise<PublishResult>;
  updateGig(
    ctx: HirerContext,
    pub: GigPublication,
    gig: CanonicalGig,
  ): Promise<PublishResult>;
  closeGig(ctx: HirerContext, pub: GigPublication): Promise<void>;
  verifyInbound(req: RawInboundRequest): Promise<InboundEnvelope>;
  fetchApplication(env: InboundEnvelope): Promise<CanonicalApplication>;
  sendDisposition(
    ref: { externalApplicationId: string },
    status: DispositionStatus,
    changedAt: string,
  ): Promise<void>;
}

export type OperatorProfile = {
  partyId: string;
  status: OperatorStatus;
  legalName: string;
  givenName?: string;
  familyName?: string;
  primaryEmailNorm: string;
  primaryPhoneE164?: string;
  homeLat?: number;
  homeLng?: number;
  createdViaBoard?: BoardId;
  verifiedIdentityAt?: string;
  poolConsentAt?: string;
  privacyNoticeVersion?: string;
  rightToWorkVerifiedAt?: string;
  jurisdiction: string;
  userId?: string;
  createdAt: string;
};

export type OperatorCredential = {
  id: string;
  partyId: string;
  credentialType: string;
  identifier?: string;
  issuingJurisdiction: string;
  issuedAt?: string;
  expiresAt?: string;
  verificationMethod: VerificationMethod;
  verifiedAt?: string;
  verifiedBy?: string;
  documentBlobUrl?: string;
  status: CredentialStatus;
};

export type OperatorAvailability = {
  id: string;
  partyId: string;
  windowStart: string;
  windowEnd: string;
  radiusKm: number;
  baseLat?: number;
  baseLng?: number;
  exclusivity: boolean;
};

export type IdentityLink = {
  id: string;
  partyId: string;
  board: BoardId;
  externalId: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  matchedByRule?: string;
  mergedFrom?: string;
};

export type InboundEvent = {
  id: string;
  board: BoardId;
  externalEventId: string;
  receivedAt: string;
  raw: Record<string, unknown>;
  processedAt?: string;
  error?: string;
};

export type OutboxRow = {
  id: string;
  aggregateType: string;
  aggregateId: string;
  board: BoardId;
  operation: string;
  payload: Record<string, unknown>;
  attempts: number;
  nextAttemptAt: string;
  processedAt?: string;
  error?: string;
};

export type PlacementBlockReason =
  | "EXPIRED_CREDENTIAL"
  | "UNVERIFIED_CREDENTIAL"
  | "MISSING_CREDENTIAL"
  | "UNAVAILABLE"
  | "OUT_OF_RADIUS"
  | "NO_RIGHT_TO_WORK"
  | "OVERLAPPING_GIG"
  | "INACTIVE";
