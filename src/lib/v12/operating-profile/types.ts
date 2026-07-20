/** V12.2 Part 5 — Domain 75 Business Operating Profile (company setup slice) */

export type CompanyRole = "buyer" | "supplier" | "contractor";

export type SetupSuggestion = {
  id: string;
  label: string;
  reason: string;
  source: "industry_adjacency" | "role_inference";
  status: "pending" | "accepted" | "rejected";
};

export type ProfileCompanySuggestion = {
  id: string;
  companyId: string;
  companySlug: string;
  companyName: string;
  headline: string;
  country: string;
  city: string;
  categories: string[];
  trustScore: number;
  verified: boolean;
  claimed: boolean;
  rank: number;
  score: number;
  confidence: number;
  reasons: string[];
  badge: "trusted_supplier" | "strong_fit" | "relevant";
  status: "suggested" | "saved" | "dismissed";
  policyVersion: string;
};

export type SetupQuestion = {
  id: string;
  prompt: string;
  groupId: string;
  groupLabel: string;
  required: boolean;
  inputType: "text" | "textarea" | "single_select" | "multi_select";
  options?: Array<{ value: string; label: string }>;
  whyAsked: string;
  answerOwner: "buyer" | "supplier" | "either";
  source: "dqe" | "operating_profile" | "industry_pack";
};

export type SetupSection = {
  id: string;
  label: string;
  description: string;
  questions: SetupQuestion[];
};

export type OperatingProfileRecord = {
  id: string;
  companyId: string;
  companyName: string;
  role: CompanyRole;
  industryPack: string;
  status: "draft" | "confirmed";
  policyVersion: string;
  answers: Record<string, string>;
  sections: Array<{
    key: string;
    label: string;
    summary: string;
  }>;
  suggestions: SetupSuggestion[];
  /** AI marketplace companies ranked from this profile */
  companySuggestions: ProfileCompanySuggestion[];
  createdAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
};

export type CompanySetupSession = {
  id: string;
  companyId: string;
  companyName: string;
  role: CompanyRole;
  industryPack: string;
  status: "in_progress" | "review" | "completed";
  sectionIndex: number;
  sections: SetupSection[];
  answers: Record<string, string>;
  suggestions: SetupSuggestion[];
  companySuggestions: ProfileCompanySuggestion[];
  profileId?: string;
  createdAt: string;
  updatedAt: string;
};
