/**
 * RateQuip Collaborate — domain types (Features 61–70).
 * Terminology is fixed by the technical build spec. Do not introduce synonyms.
 */

/** Money: integer minor units + ISO-4217 — never floats. */
export type Money = {
  currency: string;
  /** Amount in the currency's minor unit (cents, satang, …). */
  amountMinor: number;
};

export type MoneyBand = {
  currency: string;
  lowMinor: number;
  highMinor: number;
  confidence?: number;
};

export type PartyKind = "INDIVIDUAL" | "ORGANISATION";

export type PartyMembershipRole =
  | "OWNER"
  | "ADMIN"
  | "AUTHORISED_REP"
  | "MEMBER";

export type VerificationTier = "T0" | "T1" | "T2" | "T3" | "T4";

export type CapabilityKind = "SKILL" | "CREDENTIAL" | "ASSET" | "CAPACITY";

export type VerifiedState =
  | "SELF_DECLARED"
  | "EVIDENCE_SUBMITTED"
  | "THIRD_PARTY_VERIFIED"
  | "DELIVERY_PROVEN"
  | "EXPIRED"
  | "REVOKED";

export type EngagementMode = "JOB" | "POD" | "SESSION" | "VENTURE";

export type ContractingStructure = "DIRECT" | "LEAD" | "ENTITY";

export type ActorRole =
  | "BUYER"
  | "LEAD"
  | "CONTRIBUTOR"
  | "SUPPLIER"
  | "OBSERVER";

export type RequirementNecessity = "MANDATORY" | "PREFERRED" | "OPTIONAL";

export type RequirementStatus =
  | "UNFILLED"
  | "PROPOSED"
  | "FILLED"
  | "WAIVED";

export type EngagementVisibility = "PRIVATE" | "INVITED" | "PUBLIC";

export type JobState =
  | "DRAFT"
  | "PUBLISHED"
  | "QUOTING"
  | "AWARDED"
  | "CONTRACTED"
  | "FUNDED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "REVISION_REQUESTED"
  | "ACCEPTED"
  | "PAID"
  | "CLOSED"
  | "CANCELLED_BY_BUYER"
  | "WITHDRAWN"
  | "DISPUTED"
  | "RESOLVED_RELEASE"
  | "RESOLVED_REFUND"
  | "RESOLVED_SPLIT"
  | "ABANDONED";

export type SessionState =
  | "OFFERED"
  | "BOOKED"
  | "AUTHORISED"
  | "CANCELLED_BY_BUYER"
  | "CANCELLED_BY_EXPERT"
  | "RESCHEDULED"
  | "IN_SESSION"
  | "DELIVERABLE_SUBMITTED"
  | "REVISION_REQUESTED"
  | "ACCEPTED"
  | "PAID"
  | "CLOSED"
  | "DISPUTED";

export type MilestoneState =
  | "DRAFT"
  | "FUNDED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "REVISION_REQUESTED"
  | "ACCEPTED"
  | "PAID"
  | "DISPUTED"
  | "CANCELLED";

export type SlipAttribution =
  | "OWNER"
  | "UPSTREAM"
  | "BUYER_INPUT"
  | "EXTERNAL";

export type AllocationBasis = "FIXED";

export type SessionOfferingType =
  | "DIAGNOSTIC_15"
  | "CONSULT_60"
  | "LIVE_TROUBLESHOOT"
  | "DOCUMENT_REVIEW"
  | "REVIEW_PLC"
  | "SPEC_ADVICE";

export type ConflictRelation =
  | "NONE"
  | "COMMON_OWNERSHIP"
  | "SUBCONTRACTOR_HISTORY"
  | "FAMILY"
  | "EMPLOYER_EMPLOYEE"
  | "OTHER";

export type ReputationEventType =
  | "MILESTONE_ACCEPTED"
  | "MILESTONE_LATE"
  | "MILESTONE_EARLY"
  | "REVISION_REQUESTED"
  | "DISPUTE_RAISED"
  | "DISPUTE_UPHELD_AGAINST"
  | "DISPUTE_DISMISSED"
  | "ENGAGEMENT_CANCELLED_BY"
  | "NO_SHOW"
  | "RESPONSE_TIMELY"
  | "RESPONSE_LAPSED"
  | "CREDENTIAL_VERIFIED"
  | "CREDENTIAL_EXPIRED"
  | "REPEAT_ENGAGEMENT"
  | "PARTY_REPLACED"
  | "CONTROL_CHANGED"
  | "SESSION_COMPLETED";

export type PayoutMethodType = "BANK_ACCOUNT" | "DIGITAL_ASSET";

export type DigitalAsset = "USDC" | "BTC";

export type EvidenceType =
  | "PHOTO"
  | "DOCUMENT"
  | "INSPECTION_REPORT"
  | "SESSION_RECORD"
  | "VIDEO"
  | "OTHER";

export type Party = {
  partyId: string;
  kind: PartyKind;
  legalName: string;
  jurisdiction: string;
  contactEmail: string;
  timezone: string;
  verificationTier: VerificationTier;
  userId?: string;
  organisationId?: string;
  createdAt: string;
};

export type PartyMembership = {
  membershipId: string;
  individualPartyId: string;
  organisationPartyId: string;
  role: PartyMembershipRole;
  /** Max value (minor units) the member may commit without a second approver. */
  authorityLimitMinor: number | null;
  currency: string;
  createdAt: string;
};

export type Capability = {
  capabilityId: string;
  partyId: string;
  kind: CapabilityKind;
  taxonomyId: string;
  verifiedState: VerifiedState;
  visibility: "PUBLIC" | "PRIVATE" | "NETWORK";
  level?: number;
  yearsExperience?: number;
  issuer?: string;
  identifier?: string;
  issuedAt?: string;
  expiresAt?: string;
  jurisdiction?: string;
  assetType?: string;
  specifications?: Record<string, unknown>;
  location?: string;
  unit?: string;
  quantity?: number;
  period?: string;
  committedQuantity?: number;
  availableFrom?: string;
  evidenceRefs: string[];
  createdAt: string;
  lastConfirmedAt: string;
};

export type Requirement = {
  requirementId: string;
  engagementId: string;
  kind: CapabilityKind;
  taxonomyId: string;
  necessity: RequirementNecessity;
  minLevel?: number;
  jurisdictionConstraint?: string;
  onSiteRequired: boolean;
  quantity?: { unit: string; value: number };
  budgetBand?: MoneyBand;
  status: RequirementStatus;
  filledByActorId: string | null;
  derivedFrom: "AI_ARCHITECT" | "BUYER" | "LEAD";
  rationale?: string;
};

export type Actor = {
  actorId: string;
  engagementId: string;
  partyId: string;
  role: ActorRole;
  conflictDeclaration: ConflictRelation;
  joinedAt: string;
};

export type PayoutAllocation = {
  actorId: string;
  amountMinor: number;
  currency: string;
  basis: AllocationBasis;
};

export type EvidenceArtifact = {
  evidenceId: string;
  milestoneId: string;
  type: EvidenceType;
  fileUrl?: string;
  fileName?: string;
  uploaderPartyId: string;
  uploadTime: string;
  contentHash: string;
  criterionIndex?: number;
  captureMetadata?: Record<string, unknown>;
};

export type Milestone = {
  milestoneId: string;
  engagementId: string;
  sequence: number;
  title: string;
  acceptanceCriteria: string[];
  requiredEvidence: EvidenceType[];
  amount: Money;
  allocations: PayoutAllocation[];
  dependsOn: string[];
  dueDate?: string;
  acceptanceWindowDays: number;
  state: MilestoneState;
  fundingRef?: string;
  slipAttribution?: SlipAttribution | null;
  evidence: EvidenceArtifact[];
  submittedAt?: string;
  acceptedAt?: string;
  revisionCount: number;
};

export type FeeQuote = {
  feeQuoteId: string;
  engagementId: string;
  scheduleVersion: string;
  currency: string;
  grossMinor: number;
  platformFeeMinor: number;
  providerFeeMinor: number;
  netToContributorMinor: number;
  feeBps: number;
  chargedTo: "CONTRIBUTOR" | "BUYER" | "SPLIT";
  disclosure: {
    gross: Money;
    platformFee: Money;
    providerFee: Money;
    netToContributor: Money;
  };
  createdAt: string;
  acceptedAt?: string;
};

export type DomainEvent = {
  eventId: string;
  engagementId: string;
  actorId?: string;
  actingAsPartyId: string;
  type: string;
  payload: Record<string, unknown>;
  payloadHash: string;
  occurredAt: string;
  prevEventId: string | null;
  chainHash: string;
};

export type ReputationEvent = {
  reputationEventId: string;
  partyId: string;
  engagementId: string;
  milestoneId?: string;
  counterpartyId?: string;
  type: ReputationEventType;
  valueMinor?: number;
  currency?: string;
  occurredAt: string;
  attribution?: string;
  transactionRef: string;
};

export type ReputationDimension =
  | "identity_verification"
  | "qualifications"
  | "technical_capability"
  | "response_reliability"
  | "on_time_delivery"
  | "work_quality"
  | "customer_satisfaction"
  | "team_collaboration"
  | "repeat_engagement"
  | "dispute_cancellation";

export type ReputationProjection = {
  partyId: string;
  dimensions: Partial<
    Record<
      ReputationDimension,
      { score: number; sampleSize: number; trend: "UP" | "FLAT" | "DOWN" }
    >
  >;
  updatedAt: string;
};

export type SessionOffering = {
  offeringId: string;
  expertPartyId: string;
  type: SessionOfferingType;
  title: string;
  description: string;
  price: Money;
  durationMinutes: number;
  languages: string[];
  supportedMachineBrands: string[];
  prerequisites: string[];
  deliverableDefinition: string;
  requiresCredentialVerification: boolean;
  active: boolean;
  createdAt: string;
};

export type SessionRecord = {
  findings: string;
  recommendations: string;
  nextSteps: string;
  submittedAt: string;
};

export type WorkspaceThread = {
  threadId: string;
  workspaceId: string;
  subject: string;
  createdAt: string;
};

export type WorkspaceMessage = {
  messageId: string;
  threadId: string;
  authorPartyId: string;
  body: string;
  createdAt: string;
  masked: boolean;
};

export type WorkspaceFile = {
  fileId: string;
  workspaceId: string;
  name: string;
  url: string;
  uploaderPartyId: string;
  contentHash: string;
  ipStatus?:
    | "OWNED_BY_UPLOADER"
    | "LICENSED"
    | "THIRD_PARTY"
    | "UNKNOWN";
  createdAt: string;
};

export type WorkspaceTask = {
  taskId: string;
  workspaceId: string;
  title: string;
  assigneePartyId?: string;
  status: "OPEN" | "DONE";
  createdAt: string;
};

export type WorkspaceAccessLog = {
  logId: string;
  workspaceId: string;
  partyId: string;
  action: "VIEW" | "DOWNLOAD" | "UPLOAD" | "MESSAGE";
  resourceId?: string;
  occurredAt: string;
  reason?: string;
};

export type CollaborateWorkspace = {
  workspaceId: string;
  engagementId: string;
  threads: WorkspaceThread[];
  messages: WorkspaceMessage[];
  files: WorkspaceFile[];
  tasks: WorkspaceTask[];
  accessLog: WorkspaceAccessLog[];
};

export type Agreement = {
  agreementId: string;
  engagementId: string;
  kind:
    | "SCOPE_OF_WORK"
    | "MASTER_SERVICES"
    | "SUBCONTRACT"
    | "MUTUAL_NDA"
    | "IP_ASSIGNMENT"
    | "CONTRIBUTION_REGISTER"
    | "CHANGE_ORDER"
    | "SESSION_TERMS"
    | "SETTLEMENT_DEED";
  version: string;
  jurisdiction: string;
  structuredJson: Record<string, unknown>;
  pdfUrl?: string;
  documentHash?: string;
  signedBy: { partyId: string; signedAt: string; ip?: string }[];
  createdAt: string;
};

export type ChangeOrder = {
  changeOrderId: string;
  engagementId: string;
  description: string;
  reason: string;
  priceDeltaMinor: number;
  scheduleDeltaDays: number;
  affectedMilestoneIds: string[];
  approvals: { partyId: string; approvedAt?: string }[];
  funded: boolean;
  createdAt: string;
};

export type Quote = {
  quoteId: string;
  engagementId: string;
  contributorPartyId: string;
  lineItems: { description: string; amountMinor: number }[];
  totalMinor: number;
  currency: string;
  validityUntil: string;
  assumptions: string[];
  exclusions: string[];
  leadTimeDays?: number;
  milestoneBreakdown: { title: string; amountMinor: number }[];
  feeQuoteId?: string;
  status: "SUBMITTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "EXPIRED";
  createdAt: string;
};

export type Dispute = {
  disputeId: string;
  engagementId: string;
  milestoneId?: string;
  raisedByPartyId: string;
  state:
    | "RAISED"
    | "EVIDENCE_EXCHANGE"
    | "PLATFORM_REVIEW"
    | "PROPOSED_RESOLUTION"
    | "ACCEPTED"
    | "EXECUTED"
    | "REJECTED"
    | "ESCALATED";
  resolution?:
    | "FULL_RELEASE"
    | "FULL_REFUND"
    | "SPLIT"
    | "REWORK"
    | "PARTIAL";
  createdAt: string;
};

export type VerificationRecord = {
  verificationId: string;
  partyId: string;
  provider: string;
  subject: string;
  status: "PENDING" | "PASSED" | "FAILED" | "EXPIRED";
  tierUnlocked?: VerificationTier;
  evidence?: Record<string, unknown>;
  expiresAt?: string;
  createdAt: string;
  reviewedBy?: string;
};

export type PayoutMethod = {
  payoutMethodId: string;
  partyId: string;
  type: PayoutMethodType;
  currency: string;
  /** Bank details ref or digital asset address — never store keys. */
  providerRef: string;
  asset?: DigitalAsset;
  whitelistedAt?: string;
  active: boolean;
  /** DIGITAL_ASSET rail is feature-flagged off by default. */
  enabled: boolean;
};

export type PayoutProfile = {
  partyId: string;
  taxIdentifier?: string;
  preferredCurrency: string;
  methods: PayoutMethod[];
};

export type TaxonomyTerm = {
  taxonomyId: string;
  path: string;
  label: string;
  synonyms: string[];
  kind: CapabilityKind;
  curated: boolean;
};

export type PendingTaxonomyTerm = {
  pendingId: string;
  rawLabel: string;
  kind: CapabilityKind;
  submittedByPartyId: string;
  createdAt: string;
};

export type Engagement = {
  engagementId: string;
  mode: EngagementMode;
  title: string;
  summary?: string;
  buyerPartyId: string;
  contractingStructure: ContractingStructure;
  leadActorId: string | null;
  state: string;
  currency: string;
  valueBand?: MoneyBand;
  jurisdiction: string;
  requirements: Requirement[];
  actors: Actor[];
  milestones: Milestone[];
  feeQuoteId: string | null;
  riskFlags: string[];
  visibility: EngagementVisibility;
  createdAt: string;
  eventStreamId: string;
  /** SESSION mode extras */
  offeringId?: string;
  sessionRecord?: SessionRecord;
  scheduledAt?: string;
  /** JOB quoting */
  quotes: Quote[];
  agreements: Agreement[];
  changeOrders: ChangeOrder[];
  disputes: Dispute[];
  workspaceId?: string;
};

export type ActingContext = {
  userId: string;
  actingAsPartyId: string;
  idempotencyKey?: string;
};
