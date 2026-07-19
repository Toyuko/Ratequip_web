/**
 * Packaging / process line companion graph.
 * When an RFQ focuses on one machine, expand to the rest of the project.
 */

export type CompanionRole =
  | "primary"
  | "upstream"
  | "downstream"
  | "materials"
  | "utilities"
  | "services";

export type CompanionTemplate = {
  role: CompanionRole;
  label: string;
  why: string;
  categorySlugs: string[];
  searchQuery: string;
  /** Indicative marketplace budget band (USD) for compare views */
  budgetMin: number;
  budgetMax: number;
};

export type PrimaryLineProfile = {
  id: string;
  match: RegExp;
  label: string;
  primary: CompanionTemplate;
  companions: CompanionTemplate[];
};

/** Shared packaging-line add-ons used by fillers/cappers/etc. */
const PACKAGING_LINE_TAIL: CompanionTemplate[] = [
  {
    role: "downstream",
    label: "Labellers",
    why: "Label application after fill/cap for finished pack presentation and batch coding.",
    categorySlugs: ["labellers"],
    searchQuery: "labeller labeling machine",
    budgetMin: 25000,
    budgetMax: 120000,
  },
  {
    role: "downstream",
    label: "Coding & marking",
    why: "Lot / expiry coding required for traceability on finished containers.",
    categorySlugs: ["coding-and-marking", "inkjet-printers", "cij-printers"],
    searchQuery: "inkjet coding marking",
    budgetMin: 8000,
    budgetMax: 45000,
  },
  {
    role: "downstream",
    label: "Checkweigher",
    why: "In-line weight verification after fill/cap before case packing.",
    categorySlugs: ["checkweighers"],
    searchQuery: "checkweigher",
    budgetMin: 15000,
    budgetMax: 80000,
  },
  {
    role: "downstream",
    label: "Metal detection / inspection",
    why: "Product safety and quality gate common on pharma/food packaging lines.",
    categorySlugs: ["metal-detectors", "inspection-qc"],
    searchQuery: "metal detector inspection",
    budgetMin: 12000,
    budgetMax: 70000,
  },
  {
    role: "downstream",
    label: "Conveyors & line integration",
    why: "Infeed/outfeed and machine-to-machine transfer for continuous operation.",
    categorySlugs: ["conveyors", "factory-automation"],
    searchQuery: "conveyor packaging line",
    budgetMin: 10000,
    budgetMax: 90000,
  },
  {
    role: "downstream",
    label: "Case packing / end-of-line",
    why: "Secondary packaging before palletising and warehouse handoff.",
    categorySlugs: ["case-packers", "palletisers", "shrink-wrappers"],
    searchQuery: "case packer palletiser",
    budgetMin: 40000,
    budgetMax: 220000,
  },
  {
    role: "materials",
    label: "Bottles / containers",
    why: "Primary packaging containers that must match neck finish and line change parts.",
    categorySlugs: ["packaging-machinery", "general-business"],
    searchQuery: "bottle container packaging supplier",
    budgetMin: 5000,
    budgetMax: 80000,
  },
  {
    role: "materials",
    label: "Caps / closures",
    why: "Closure supply matched to torque, foil induction, and neck size.",
    categorySlugs: ["cappers", "packaging-machinery"],
    searchQuery: "cap closure supplier",
    budgetMin: 3000,
    budgetMax: 60000,
  },
  {
    role: "services",
    label: "FAT / commissioning / validation",
    why: "Factory acceptance, site commissioning, and cGMP/TGA validation support.",
    categorySlugs: ["inspection-qc", "commissioning", "service-categories"],
    searchQuery: "FAT commissioning validation",
    budgetMin: 3500,
    budgetMax: 45000,
  },
  {
    role: "utilities",
    label: "Compressed air / plant utilities",
    why: "Electro-pneumatic cappers and fillers need clean dry instrument air and power.",
    categorySlugs: ["industrial-equipment", "compressors"],
    searchQuery: "compressed air compressor plant utility",
    budgetMin: 5000,
    budgetMax: 50000,
  },
];

export const PRIMARY_LINE_PROFILES: PrimaryLineProfile[] = [
  {
    id: "capping",
    match: /capp(?:er|ing)|closure|screw.?cap|press.?on.?cap|induction.?seal/i,
    label: "Capping / closure line",
    primary: {
      role: "primary",
      label: "Capping machine",
      why: "Core request — apply screw or press-on caps to containers.",
      categorySlugs: ["cappers"],
      searchQuery: "capping machine capper",
      budgetMin: 35000,
      budgetMax: 180000,
    },
    companions: [
      {
        role: "upstream",
        label: "Bottle / liquid fillers",
        why: "Containers are filled immediately before capping on an integrated packaging line.",
        categorySlugs: ["bottle-fillers", "pouch-fillers"],
        searchQuery: "bottle filler filling machine",
        budgetMin: 60000,
        budgetMax: 350000,
      },
      {
        role: "downstream",
        label: "Induction sealers",
        why: "Foil induction often follows screw capping for tamper evidence and seal integrity.",
        categorySlugs: ["tray-sealers", "packaging-machinery"],
        searchQuery: "induction sealer foil seal",
        budgetMin: 15000,
        budgetMax: 90000,
      },
      ...PACKAGING_LINE_TAIL,
    ],
  },
  {
    id: "filling",
    match: /fill(?:er|ing)|rotary.?fill|volumetric.?fill|liquid.?fill/i,
    label: "Filling line",
    primary: {
      role: "primary",
      label: "Filling machine",
      why: "Core request — dose product into containers.",
      categorySlugs: ["bottle-fillers", "pouch-fillers", "packaging-machinery"],
      searchQuery: "filler filling machine",
      budgetMin: 80000,
      budgetMax: 400000,
    },
    companions: [
      {
        role: "downstream",
        label: "Capping machine",
        why: "Filled containers typically move next to capping on the same line.",
        categorySlugs: ["cappers"],
        searchQuery: "capper capping machine",
        budgetMin: 35000,
        budgetMax: 180000,
      },
      {
        role: "downstream",
        label: "Induction / tray sealers",
        why: "Seal integrity after fill/cap for shelf life and tamper evidence.",
        categorySlugs: ["tray-sealers", "vacuum-packaging"],
        searchQuery: "sealer induction tray sealer",
        budgetMin: 15000,
        budgetMax: 120000,
      },
      {
        role: "upstream",
        label: "Processing / mixing",
        why: "Product often needs hygienic process equipment before the packaging hall.",
        categorySlugs: ["food-processing", "mixers", "cip-systems"],
        searchQuery: "mixer process equipment CIP",
        budgetMin: 40000,
        budgetMax: 300000,
      },
      ...PACKAGING_LINE_TAIL,
    ],
  },
  {
    id: "sieving",
    match: /sieve|sifter|screen(?:ing)?|mesh\s*\d+/i,
    label: "Powder sieving / processing",
    primary: {
      role: "primary",
      label: "Industrial sieve / sifter",
      why: "Core request — particle size control for powders/granules.",
      categorySlugs: ["food-processing", "industrial-equipment"],
      searchQuery: "sieve sifter powder",
      budgetMin: 8000,
      budgetMax: 60000,
    },
    companions: [
      {
        role: "upstream",
        label: "Milling / grinding",
        why: "Particle size reduction often feeds sieving stages.",
        categorySlugs: ["food-processing", "industrial-equipment"],
        searchQuery: "mill grinder powder",
        budgetMin: 15000,
        budgetMax: 120000,
      },
      {
        role: "downstream",
        label: "Blending / mixing",
        why: "Sieved material is commonly blended before packaging.",
        categorySlugs: ["food-processing", "mixers"],
        searchQuery: "blender mixer powder",
        budgetMin: 20000,
        budgetMax: 150000,
      },
      {
        role: "downstream",
        label: "Baging / packing",
        why: "Finished powder moves to pouch/bottle packaging equipment.",
        categorySlugs: ["bagging-machines", "pouch-fillers", "bottle-fillers"],
        searchQuery: "bagging pouch filler",
        budgetMin: 30000,
        budgetMax: 200000,
      },
      {
        role: "utilities",
        label: "Dust extraction / HVAC",
        why: "Powder handling needs dust control for GMP and operator safety.",
        categorySlugs: ["industrial-hvac", "dust-collection", "industrial-equipment"],
        searchQuery: "dust extraction HVAC cleanroom",
        budgetMin: 10000,
        budgetMax: 120000,
      },
      {
        role: "services",
        label: "FAT / site acceptance",
        why: "URS-style sieve buys usually require inspection before release.",
        categorySlugs: ["inspection-qc"],
        searchQuery: "FAT inspection witnessing",
        budgetMin: 2500,
        budgetMax: 20000,
      },
    ],
  },
  {
    id: "labelling",
    match: /labell?er|label(?:ing|ling)/i,
    label: "Labelling line",
    primary: {
      role: "primary",
      label: "Labelling machine",
      why: "Core request — apply product labels.",
      categorySlugs: ["labellers"],
      searchQuery: "labeller labeling",
      budgetMin: 25000,
      budgetMax: 120000,
    },
    companions: [
      {
        role: "upstream",
        label: "Capping / sealing",
        why: "Labelling usually follows capped or sealed containers.",
        categorySlugs: ["cappers", "tray-sealers"],
        searchQuery: "capper sealer",
        budgetMin: 35000,
        budgetMax: 180000,
      },
      ...PACKAGING_LINE_TAIL.filter((c) => c.label !== "Labellers"),
    ],
  },
  {
    id: "palletising",
    match: /palletis|palletiz|end.?of.?line/i,
    label: "End-of-line palletising",
    primary: {
      role: "primary",
      label: "Palletising cell",
      why: "Core request — automated end-of-line pallet handling.",
      categorySlugs: ["palletisers", "factory-automation", "robotics"],
      searchQuery: "palletiser robotics",
      budgetMin: 70000,
      budgetMax: 280000,
    },
    companions: [
      {
        role: "upstream",
        label: "Case packers / wrappers",
        why: "Cases or wrapped packs feed the palletiser.",
        categorySlugs: ["case-packers", "shrink-wrappers"],
        searchQuery: "case packer shrink wrapper",
        budgetMin: 40000,
        budgetMax: 200000,
      },
      {
        role: "upstream",
        label: "Conveyors",
        why: "Infeed accumulation and outfeed of finished pallets.",
        categorySlugs: ["conveyors"],
        searchQuery: "conveyor pallet",
        budgetMin: 10000,
        budgetMax: 90000,
      },
      {
        role: "services",
        label: "Automation integration",
        why: "Safety fencing, HMI, and line PLC integration for cells.",
        categorySlugs: ["factory-automation", "robotics"],
        searchQuery: "automation robotics integration",
        budgetMin: 15000,
        budgetMax: 100000,
      },
    ],
  },
];

export function detectPrimaryProfile(text: string): PrimaryLineProfile {
  for (const profile of PRIMARY_LINE_PROFILES) {
    if (profile.match.test(text)) return profile;
  }
  return {
    id: "generic-equipment",
    match: /.*/,
    label: "Equipment project",
    primary: {
      role: "primary",
      label: "Primary equipment",
      why: "Main equipment described in the RFQ / URS.",
      categorySlugs: ["packaging-machinery", "food-processing", "industrial-equipment"],
      searchQuery: "equipment machinery",
      budgetMin: 20000,
      budgetMax: 200000,
    },
    companions: [
      {
        role: "services",
        label: "Installation & commissioning",
        why: "Most capital equipment projects need site install and start-up support.",
        categorySlugs: ["service-categories", "commissioning"],
        searchQuery: "commissioning installation",
        budgetMin: 5000,
        budgetMax: 60000,
      },
      {
        role: "services",
        label: "Inspection / FAT",
        why: "Independent verification before shipment or site acceptance.",
        categorySlugs: ["inspection-qc"],
        searchQuery: "FAT inspection",
        budgetMin: 2500,
        budgetMax: 25000,
      },
      {
        role: "utilities",
        label: "Plant utilities",
        why: "Power, air, and HVAC often constrain equipment selection.",
        categorySlugs: ["industrial-equipment", "industrial-hvac"],
        searchQuery: "plant utilities HVAC compressor",
        budgetMin: 5000,
        budgetMax: 80000,
      },
    ],
  };
}

export function roleLabel(role: CompanionRole) {
  switch (role) {
    case "primary":
      return "In this RFQ";
    case "upstream":
      return "Upstream";
    case "downstream":
      return "Downstream";
    case "materials":
      return "Materials";
    case "utilities":
      return "Utilities";
    case "services":
      return "Services";
  }
}
