export const EQUIPMENT_CLASSES = [
  "EXCAVATOR_20T",
  "EXCAVATOR_5T",
  "FORKLIFT",
  "EWP_BOOM",
  "CRANE_SLEW",
  "DOZER",
  "LOADER",
] as const;

export type EquipmentClass = (typeof EQUIPMENT_CLASSES)[number];

export const CREDENTIAL_TYPES = [
  "HRW_LF",
  "HRW_CN",
  "HRW_DG",
  "HRW_RB",
  "HRW_WP",
  "WHITE_CARD",
  "VOC",
  "DRIVER_HR",
  "DRIVER_HC",
  "DRIVER_MC",
] as const;

export type CredentialType = (typeof CREDENTIAL_TYPES)[number];

export const CREDENTIAL_LABELS: Record<string, string> = {
  HRW_LF: "HRW forklift (LF)",
  HRW_CN: "HRW slewing mobile crane (CN)",
  HRW_DG: "HRW dogging (DG)",
  HRW_RB: "HRW basic rigging (RB)",
  HRW_WP: "HRW boom-type EWP (WP)",
  WHITE_CARD: "White Card / construction induction",
  VOC: "Verification of Competency",
  DRIVER_HR: "Heavy rigid (HR)",
  DRIVER_HC: "Heavy combination (HC)",
  DRIVER_MC: "Multi-combination (MC)",
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  EXCAVATOR_20T: "20-tonne excavator operator",
  EXCAVATOR_5T: "5-tonne excavator operator",
  FORKLIFT: "Forklift operator",
  EWP_BOOM: "Boom EWP operator",
  CRANE_SLEW: "Slewing crane operator",
  DOZER: "Dozer operator",
  LOADER: "Loader operator",
};

export const DEFAULT_CREDENTIALS_FOR_CLASS: Record<string, string[]> = {
  EXCAVATOR_20T: ["WHITE_CARD"],
  EXCAVATOR_5T: ["WHITE_CARD"],
  FORKLIFT: ["HRW_LF", "WHITE_CARD"],
  EWP_BOOM: ["HRW_WP", "WHITE_CARD"],
  CRANE_SLEW: ["HRW_CN", "WHITE_CARD"],
  DOZER: ["WHITE_CARD"],
  LOADER: ["WHITE_CARD"],
};

export const TAXONOMY_VERSION = "talent-taxonomy-v1";

/** Indeed occupation-ish search attributes. Fail closed if missing. */
export const INDEED_OCCUPATION: Record<string, { titleHint: string; category: string }> = {
  EXCAVATOR_20T: {
    titleHint: "Excavator Operator",
    category: "Construction",
  },
  EXCAVATOR_5T: {
    titleHint: "Excavator Operator",
    category: "Construction",
  },
  FORKLIFT: { titleHint: "Forklift Operator", category: "Warehouse" },
  EWP_BOOM: {
    titleHint: "EWP / Boom Lift Operator",
    category: "Construction",
  },
  CRANE_SLEW: { titleHint: "Crane Operator", category: "Construction" },
  DOZER: { titleHint: "Dozer Operator", category: "Construction" },
  LOADER: { titleHint: "Loader Operator", category: "Construction" },
};

export function indeedMappingFor(equipmentClass: string) {
  return INDEED_OCCUPATION[equipmentClass] ?? null;
}

/** LinkedIn industry / category hints. Fail closed if missing. */
export const LINKEDIN_OCCUPATION: Record<
  string,
  { titleHint: string; industry: string; category: string }
> = {
  EXCAVATOR_20T: {
    titleHint: "Excavator Operator",
    industry: "Construction",
    category: "Skilled Labor",
  },
  EXCAVATOR_5T: {
    titleHint: "Excavator Operator",
    industry: "Construction",
    category: "Skilled Labor",
  },
  FORKLIFT: {
    titleHint: "Forklift Operator",
    industry: "Warehousing",
    category: "Skilled Labor",
  },
  EWP_BOOM: {
    titleHint: "EWP / Boom Lift Operator",
    industry: "Construction",
    category: "Skilled Labor",
  },
  CRANE_SLEW: {
    titleHint: "Crane Operator",
    industry: "Construction",
    category: "Skilled Labor",
  },
  DOZER: {
    titleHint: "Dozer Operator",
    industry: "Construction",
    category: "Skilled Labor",
  },
  LOADER: {
    titleHint: "Loader Operator",
    industry: "Construction",
    category: "Skilled Labor",
  },
};

export function linkedInMappingFor(equipmentClass: string) {
  return LINKEDIN_OCCUPATION[equipmentClass] ?? null;
}
