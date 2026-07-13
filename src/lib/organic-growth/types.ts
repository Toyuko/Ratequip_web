export const COMPANY_TYPES = [
  "buyer",
  "supplier",
  "manufacturer",
  "contractor",
  "installer",
  "freight",
  "inspector",
  "auditor",
  "consultant",
  "other",
] as const;

export type CompanyType = (typeof COMPANY_TYPES)[number];

export const CONTACT_SOURCES = [
  "business_relationship",
  "company_website",
  "business_card_or_signature",
  "public_directory",
  "other",
] as const;

export type ContactSource = (typeof CONTACT_SOURCES)[number];

export const RELATIONSHIPS = [
  "customer_buyer",
  "supplier",
  "project_participant",
  "employee_former",
  "industry_peer",
  "research",
  "other",
] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

export const INTENDED_PURPOSES = [
  "leave_review",
  "include_rfq",
  "invite_project",
  "watchlist",
  "directory_coverage",
  "other",
] as const;

export type IntendedPurpose = (typeof INTENDED_PURPOSES)[number];

export const DISCLOSURE_PREFERENCES = [
  "user_display_name",
  "verified_business_name",
  "anonymous_ratequip_user",
] as const;

export type DisclosurePreference = (typeof DISCLOSURE_PREFERENCES)[number];

export type ListingStatus =
  | "draft"
  | "duplicate_check"
  | "details_complete"
  | "contacts_complete"
  | "contacts_skipped"
  | "review_ready"
  | "review_skipped"
  | "confirmation_required"
  | "publishing"
  | "published"
  | "abandoned"
  | "blocked"
  | "merged_into_existing"
  | "failed";

export type MatchLevel = "exact" | "likely" | "possible";

export type InvitationRecipientState =
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "claim_started"
  | "converted"
  | "bounced"
  | "complained"
  | "unsubscribed"
  | "expired"
  | "cancelled"
  | "suppressed"
  | "failed";

export type ContactCandidateDraft = {
  id: string;
  /** Present only while drafting; stripped after publish. */
  email?: string;
  emailMasked: string;
  contactName?: string;
  role?: string;
  sourceType: ContactSource;
  sourceUrl?: string;
  sourceNote?: string;
  personalNote?: string;
  sendAfterPublish: boolean;
  domainMatchCategory:
    | "company_domain"
    | "generic_business_domain"
    | "consumer_domain"
    | "unrelated_domain"
    | "unknown";
  sendEligibility: "pending" | "eligible" | "suppressed" | "blocked" | "manual_review";
};

export type ListingSubmissionDraft = {
  id: string;
  idempotencyKey: string;
  status: ListingStatus;
  searchQuery?: string;
  companyName?: string;
  websiteUrl?: string;
  registrableDomain?: string;
  companyTypes: CompanyType[];
  countryCode?: string;
  locality?: string;
  addressLine?: string;
  region?: string;
  postalCode?: string;
  phoneDisplay?: string;
  publicSourceUrl?: string;
  privateNotes?: string;
  categories: string[];
  relationship?: Relationship;
  intendedPurpose?: IntendedPurpose;
  conflictDeclared: boolean;
  disclosurePreference: DisclosurePreference;
  declarationsAccepted: boolean;
  skipContacts: boolean;
  skipReview: boolean;
  contacts: ContactCandidateDraft[];
  publishedCompanyId?: string;
  publishedCompanySlug?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type DuplicateCandidate = {
  companyId: string;
  companySlug: string;
  name: string;
  website: string;
  city: string;
  country: string;
  claimed: boolean;
  verified: boolean;
  matchLevel: MatchLevel;
  matchScore: number;
  matchReasons: string[];
};

export type PublishedInvitation = {
  id: string;
  emailMasked: string;
  role?: string;
  state: InvitationRecipientState;
  claimToken: string;
};
