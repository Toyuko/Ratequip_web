export type DemoRole = "buyer" | "supplier" | "contractor" | "admin";

export type DemoCompany = {
  id: string;
  name: string;
  slug: string;
  headline: string;
  description: string;
  country: string;
  city: string;
  website: string;
  verified: boolean;
  claimed: boolean;
  trustScore: number;
  reviewCount: number;
  employeeRange: string;
  yearFounded: number;
  categories: string[];
};

export type DemoCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Parent category id when this is a leaf / subcategory */
  parentId?: string | null;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function leafCategories(
  parentId: string,
  names: string[],
  descriptionFor: (name: string) => string,
): DemoCategory[] {
  return names.map((name) => {
    const slug = slugify(name);
    return {
      id: `${parentId}-${slug}`,
      name,
      slug,
      description: descriptionFor(name),
      parentId,
    };
  });
}

export type DemoReview = {
  id: string;
  companyId: string;
  companySlug: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type DemoRequest = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  deliveryCountry: string;
  status: "open" | "closed" | "awarded";
  quoteCount: number;
  createdAt: string;
};

export type DemoQuote = {
  id: string;
  requestId: string;
  companyName: string;
  companySlug: string;
  amount: number;
  currency: string;
  leadTimeDays: number;
  notes: string;
  status: string;
};

export type DemoProject = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  status: string;
  memberCount: number;
};

export type DemoClaim = {
  id: string;
  companyName: string;
  companySlug: string;
  claimant: string;
  status: "pending" | "approved" | "rejected";
  notes: string;
  createdAt: string;
};

export type DemoPlan = {
  code: string;
  name: string;
  audience: DemoRole;
  priceMonthly: number;
  features: string[];
  highlighted?: boolean;
};

/**
 * Category taxonomy from RateQuip Enterprise Master Repository
 * (`26_Categories_Taxonomy/category_taxonomy_v3.json`), plus platform
 * service verticals already used in demo seed data.
 *
 * Parent slugs for packaging / processing / automation keep the original
 * demo URLs so existing company + RFQ links stay valid.
 */
export const demoCategories: DemoCategory[] = [
  {
    id: "cat-packaging",
    name: "Packaging Equipment",
    slug: "packaging-machinery",
    description: "Fillers, sealers, cartoners, coding and end-of-line systems.",
  },
  {
    id: "cat-processing",
    name: "Processing Equipment",
    slug: "food-processing",
    description: "Mixers, hygienic process lines, CIP and food production systems.",
  },
  {
    id: "cat-industrial",
    name: "Industrial Equipment",
    slug: "industrial-equipment",
    description: "Plant utilities, material handling and environmental systems.",
  },
  {
    id: "cat-automation",
    name: "Automation and Controls",
    slug: "factory-automation",
    description: "Robotics, PLCs, vision, drives and machine safety.",
  },
  {
    id: "cat-services",
    name: "Service Categories",
    slug: "service-categories",
    description: "Installation, maintenance, fabrication and technical trades.",
  },
  {
    id: "cat-general",
    name: "General Business",
    slug: "general-business",
    description: "Commercial facilities, trades and professional services.",
  },
  {
    id: "cat-inspection",
    name: "Inspection & QC",
    slug: "inspection-qc",
    description: "Third-party inspection, FAT witnessing and quality assurance.",
  },
  {
    id: "cat-logistics",
    name: "Heavy Logistics",
    slug: "heavy-logistics",
    description: "Freight, customs and oversized equipment transport.",
  },
  // Retained for existing CleanAir demo tagging; also mirrored under Services as HVAC.
  {
    id: "cat-hvac",
    name: "Industrial HVAC",
    slug: "industrial-hvac",
    description: "Climate control for plants, warehouses and cleanrooms.",
    parentId: "cat-industrial",
  },
  ...leafCategories(
    "cat-packaging",
    [
      "Cartoning Machines",
      "Pouch Fillers",
      "Bottle Fillers",
      "Cappers",
      "Labellers",
      "Inkjet Printers",
      "Thermal Inkjet Printers",
      "CIJ Printers",
      "Case Packers",
      "Palletisers",
      "Shrink Wrappers",
      "Flow Wrappers",
      "Vertical Form Fill Seal",
      "Horizontal Form Fill Seal",
      "Checkweighers",
      "Metal Detectors",
      "Conveyors",
      "Carton Feeders",
      "Tray Sealers",
      "Vacuum Packaging",
      "Bagging Machines",
      "Coding and Marking",
    ],
    (name) => `${name} for packaging and end-of-line production.`,
  ),
  ...leafCategories(
    "cat-processing",
    [
      "Mixers",
      "High Shear Mixers",
      "Emulsifiers",
      "Homogenisers",
      "Mills",
      "Grinders",
      "Blenders",
      "Reactors",
      "Tanks",
      "Kettles",
      "Pasteurisers",
      "Heat Exchangers",
      "CIP Systems",
      "Pumps",
      "Powder Induction Systems",
      "Sieves",
      "Separators",
      "Dryers",
      "Evaporators",
      "Cooking Systems",
      "Fermentation Equipment",
      "Food Processing Lines",
    ],
    (name) => `${name} for industrial and hygienic processing.`,
  ),
  ...leafCategories(
    "cat-industrial",
    [
      "Compressors",
      "Boilers",
      "Chillers",
      "Generators",
      "Forklifts",
      "Cranes",
      "Dust Collectors",
      "Air Handling",
      "Water Treatment",
      "Waste Treatment",
    ],
    (name) => `${name} for plants, warehouses and utilities.`,
  ),
  ...leafCategories(
    "cat-automation",
    [
      "PLC",
      "HMI",
      "SCADA",
      "Robotics",
      "Vision Systems",
      "Sensors",
      "VSDs",
      "Servo Systems",
      "Control Panels",
      "Machine Safety",
    ],
    (name) => `${name} for factory automation and controls.`,
  ),
  ...leafCategories(
    "cat-services",
    [
      "Electrical",
      "Mechanical",
      "Automation",
      "PLC Programming",
      "Commissioning",
      "Installation",
      "Maintenance",
      "Fabrication",
      "Welding",
      "Refrigeration",
      "HVAC",
      "Plumbing",
    ],
    (name) => `${name} contractors and field service providers.`,
  ),
  ...leafCategories(
    "cat-general",
    [
      "Hotels",
      "Restaurants",
      "Commercial Kitchens",
      "Medical Clinics",
      "Builders",
      "Trades",
      "Professional Services",
      "Cleaning",
      "Security",
      "IT Infrastructure",
    ],
    (name) => `${name} suppliers and service partners.`,
  ),
];

export const demoCompanies: DemoCompany[] = [
  {
    id: "co-nordic-fill",
    name: "NordicFill Systems",
    slug: "nordicfill-systems",
    headline: "Hygienic liquid filling lines for beverage and dairy plants",
    description:
      "NordicFill designs and installs stainless filling, capping and CIP-ready packaging lines for mid-to-large beverage producers across ASEAN and Europe.",
    country: "Sweden",
    city: "Malmö",
    website: "https://example.com/nordicfill",
    verified: true,
    claimed: true,
    trustScore: 92.4,
    reviewCount: 28,
    employeeRange: "51-200",
    yearFounded: 2004,
    categories: ["packaging-machinery", "food-processing", "bottle-fillers", "cip-systems"],
  },
  {
    id: "co-apex-robotics",
    name: "Apex Robotics Asia",
    slug: "apex-robotics-asia",
    headline: "Turnkey palletising and pick-and-place cells",
    description:
      "Apex delivers collaborative and industrial robot cells with local commissioning teams in Thailand, Vietnam and Indonesia.",
    country: "Thailand",
    city: "Bangkok",
    website: "https://example.com/apex",
    verified: true,
    claimed: true,
    trustScore: 88.1,
    reviewCount: 19,
    employeeRange: "11-50",
    yearFounded: 2012,
    categories: ["factory-automation", "robotics", "palletisers", "commissioning"],
  },
  {
    id: "co-harbor-freight",
    name: "Harbor Heavy Freight",
    slug: "harbor-heavy-freight",
    headline: "Oversized machinery shipping and customs clearance",
    description:
      "Specialist forwarder for presses, extruders and complete production lines with bonded warehouse options.",
    country: "Singapore",
    city: "Singapore",
    website: "https://example.com/harbor",
    verified: true,
    claimed: false,
    trustScore: 84.6,
    reviewCount: 41,
    employeeRange: "51-200",
    yearFounded: 1998,
    categories: ["heavy-logistics"],
  },
  {
    id: "co-cleanair",
    name: "CleanAir Plant Solutions",
    slug: "cleanair-plant-solutions",
    headline: "Industrial HVAC and cleanroom air systems",
    description:
      "Design-build HVAC for pharmaceutical, electronics and food plants with documented validation packages.",
    country: "Germany",
    city: "Stuttgart",
    website: "https://example.com/cleanair",
    verified: false,
    claimed: false,
    trustScore: 76.2,
    reviewCount: 12,
    employeeRange: "11-50",
    yearFounded: 2009,
    categories: ["industrial-hvac", "air-handling", "hvac"],
  },
  {
    id: "co-inspectpro",
    name: "InspectPro Global",
    slug: "inspectpro-global",
    headline: "Factory audits, FAT witnessing and loading inspections",
    description:
      "Independent inspectors covering machinery OEMs across China, India and Turkey with photo evidence packs.",
    country: "United Kingdom",
    city: "Manchester",
    website: "https://example.com/inspectpro",
    verified: true,
    claimed: true,
    trustScore: 90.0,
    reviewCount: 33,
    employeeRange: "11-50",
    yearFounded: 2015,
    categories: ["inspection-qc", "commissioning"],
  },
  {
    id: "co-mekong-parts",
    name: "Mekong Spare Parts Hub",
    slug: "mekong-spare-parts-hub",
    headline: "OEM-compatible spare parts for packaging lines",
    description:
      "Stocked seals, sensors and wear parts with 48-hour regional dispatch for common European OEMs.",
    country: "Vietnam",
    city: "Ho Chi Minh City",
    website: "https://example.com/mekong",
    verified: true,
    claimed: true,
    trustScore: 81.5,
    reviewCount: 22,
    employeeRange: "11-50",
    yearFounded: 2011,
    categories: ["packaging-machinery", "maintenance", "sensors"],
  },
  {
    id: "co-sealtech-asia",
    name: "SealTech Asia",
    slug: "sealtech-asia",
    headline: "Tray sealers, vacuum and MAP packaging systems",
    description:
      "OEM of tray sealers and vacuum packaging machines for ready meals, meat and seafood processors with ASEAN spare parts stock.",
    country: "Malaysia",
    city: "Penang",
    website: "https://example.com/sealtech",
    verified: true,
    claimed: true,
    trustScore: 86.3,
    reviewCount: 17,
    employeeRange: "51-200",
    yearFounded: 2007,
    categories: [
      "packaging-machinery",
      "tray-sealers",
      "vacuum-packaging",
      "flow-wrappers",
    ],
  },
  {
    id: "co-codejet",
    name: "CodeJet Marking",
    slug: "codejet-marking",
    headline: "CIJ, TIJ and laser coding for high-speed lines",
    description:
      "Industrial inkjet and thermal inkjet printers with local service engineers across Thailand, Vietnam and the Philippines.",
    country: "Thailand",
    city: "Chonburi",
    website: "https://example.com/codejet",
    verified: true,
    claimed: true,
    trustScore: 83.7,
    reviewCount: 24,
    employeeRange: "11-50",
    yearFounded: 2010,
    categories: [
      "packaging-machinery",
      "coding-and-marking",
      "inkjet-printers",
      "cij-printers",
      "thermal-inkjet-printers",
    ],
  },
  {
    id: "co-cartonmax",
    name: "CartonMax Solutions",
    slug: "cartonmax-solutions",
    headline: "Cartoning, case packing and shrink wrap lines",
    description:
      "End-of-line cartoning and case packing systems for pharma, personal care and dry foods with integrated checkweighers.",
    country: "Italy",
    city: "Bologna",
    website: "https://example.com/cartonmax",
    verified: true,
    claimed: false,
    trustScore: 89.2,
    reviewCount: 31,
    employeeRange: "51-200",
    yearFounded: 1995,
    categories: [
      "packaging-machinery",
      "cartoning-machines",
      "case-packers",
      "shrink-wrappers",
      "checkweighers",
      "carton-feeders",
    ],
  },
  {
    id: "co-vffs-pacific",
    name: "Pacific Form-Fill",
    slug: "pacific-form-fill",
    headline: "VFFS and HFFS bagging for snacks and powders",
    description:
      "Vertical and horizontal form-fill-seal machines with multihead weighers for snack, coffee and powder producers.",
    country: "Taiwan",
    city: "Taichung",
    website: "https://example.com/pacificff",
    verified: true,
    claimed: true,
    trustScore: 85.0,
    reviewCount: 15,
    employeeRange: "51-200",
    yearFounded: 2001,
    categories: [
      "packaging-machinery",
      "vertical-form-fill-seal",
      "horizontal-form-fill-seal",
      "bagging-machines",
      "pouch-fillers",
    ],
  },
  {
    id: "co-labelpro",
    name: "LabelPro Industrial",
    slug: "labelpro-industrial",
    headline: "Pressure-sensitive labellers and applicators",
    description:
      "Wrap-around, front-back and tamper-evident labelling systems for bottles, jars and cartons with vision verification options.",
    country: "Japan",
    city: "Osaka",
    website: "https://example.com/labelpro",
    verified: true,
    claimed: true,
    trustScore: 91.1,
    reviewCount: 27,
    employeeRange: "51-200",
    yearFounded: 1988,
    categories: ["packaging-machinery", "labellers", "cappers", "metal-detectors"],
  },
  {
    id: "co-lineflow",
    name: "LineFlow Conveyors",
    slug: "lineflow-conveyors",
    headline: "Sanitary conveyors and accumulation systems",
    description:
      "Modular belt and roller conveyors for food and beverage plants, including elevators and accumulation tables.",
    country: "Netherlands",
    city: "Eindhoven",
    website: "https://example.com/lineflow",
    verified: false,
    claimed: true,
    trustScore: 78.4,
    reviewCount: 9,
    employeeRange: "11-50",
    yearFounded: 2014,
    categories: ["packaging-machinery", "conveyors", "factory-automation"],
  },
  {
    id: "co-blendcraft",
    name: "BlendCraft Process",
    slug: "blendcraft-process",
    headline: "High-shear mixers, emulsifiers and homogenisers",
    description:
      "Process skids for sauces, dairy and cosmetics with recipe control, CIP-ready vessels and validated documentation packs.",
    country: "Germany",
    city: "Hamburg",
    website: "https://example.com/blendcraft",
    verified: true,
    claimed: true,
    trustScore: 88.8,
    reviewCount: 21,
    employeeRange: "51-200",
    yearFounded: 1999,
    categories: [
      "food-processing",
      "mixers",
      "high-shear-mixers",
      "emulsifiers",
      "homogenisers",
      "blenders",
    ],
  },
  {
    id: "co-thermoline",
    name: "ThermoLine Asia",
    slug: "thermoline-asia",
    headline: "Pasteurisers, heat exchangers and cooking systems",
    description:
      "Thermal process equipment for beverage, dairy and ready-meal plants with local commissioning across Southeast Asia.",
    country: "Thailand",
    city: "Samut Prakan",
    website: "https://example.com/thermoline",
    verified: true,
    claimed: true,
    trustScore: 84.9,
    reviewCount: 14,
    employeeRange: "11-50",
    yearFounded: 2008,
    categories: [
      "food-processing",
      "pasteurisers",
      "heat-exchangers",
      "cooking-systems",
      "kettles",
      "tanks",
    ],
  },
  {
    id: "co-milltech",
    name: "MillTech Grinding",
    slug: "milltech-grinding",
    headline: "Mills, grinders, sieves and powder handling",
    description:
      "Particle size reduction and sieving systems for spices, chemicals and food ingredients with dust-tight designs.",
    country: "India",
    city: "Pune",
    website: "https://example.com/milltech",
    verified: true,
    claimed: false,
    trustScore: 80.2,
    reviewCount: 18,
    employeeRange: "51-200",
    yearFounded: 2003,
    categories: [
      "food-processing",
      "mills",
      "grinders",
      "sieves",
      "powder-induction-systems",
      "separators",
    ],
  },
  {
    id: "co-dryflow",
    name: "DryFlow Evaporation",
    slug: "dryflow-evaporation",
    headline: "Dryers, evaporators and fermentation skids",
    description:
      "Spray dryers, evaporators and fermentation equipment for dairy, biotech and specialty chemicals.",
    country: "Denmark",
    city: "Aarhus",
    website: "https://example.com/dryflow",
    verified: true,
    claimed: true,
    trustScore: 87.5,
    reviewCount: 11,
    employeeRange: "51-200",
    yearFounded: 1992,
    categories: [
      "food-processing",
      "dryers",
      "evaporators",
      "fermentation-equipment",
      "reactors",
      "food-processing-lines",
    ],
  },
  {
    id: "co-pumpworks",
    name: "PumpWorks Hygienic",
    slug: "pumpworks-hygienic",
    headline: "Sanitary pumps and CIP transfer systems",
    description:
      "Hygienic centrifugal and positive-displacement pumps with seal kits stocked for ASEAN beverage plants.",
    country: "United States",
    city: "Milwaukee",
    website: "https://example.com/pumpworks",
    verified: true,
    claimed: true,
    trustScore: 82.6,
    reviewCount: 36,
    employeeRange: "201-500",
    yearFounded: 1978,
    categories: ["food-processing", "pumps", "cip-systems", "tanks"],
  },
  {
    id: "co-airpower",
    name: "AirPower Utilities",
    slug: "airpower-utilities",
    headline: "Compressors, boilers, chillers and generators",
    description:
      "Plant utility packages including compressed air, steam, process chillers and standby generators with maintenance contracts.",
    country: "South Korea",
    city: "Busan",
    website: "https://example.com/airpower",
    verified: true,
    claimed: true,
    trustScore: 85.4,
    reviewCount: 29,
    employeeRange: "51-200",
    yearFounded: 2000,
    categories: [
      "industrial-equipment",
      "compressors",
      "boilers",
      "chillers",
      "generators",
    ],
  },
  {
    id: "co-lifthaul",
    name: "LiftHaul Material",
    slug: "lifthaul-material",
    headline: "Forklifts, cranes and heavy plant handling",
    description:
      "Electric and diesel forklifts plus overhead crane systems for factories and bonded warehouses.",
    country: "China",
    city: "Shanghai",
    website: "https://example.com/lifthaul",
    verified: false,
    claimed: true,
    trustScore: 74.8,
    reviewCount: 20,
    employeeRange: "201-500",
    yearFounded: 2006,
    categories: ["industrial-equipment", "forklifts", "cranes"],
  },
  {
    id: "co-cleantech-env",
    name: "CleanTech Environment",
    slug: "cleantech-environment",
    headline: "Dust collection, water and waste treatment",
    description:
      "Environmental systems for food, pharma and electronics plants — baghouses, RO water and effluent treatment.",
    country: "Singapore",
    city: "Singapore",
    website: "https://example.com/cleantech",
    verified: true,
    claimed: true,
    trustScore: 86.0,
    reviewCount: 16,
    employeeRange: "11-50",
    yearFounded: 2011,
    categories: [
      "industrial-equipment",
      "dust-collectors",
      "water-treatment",
      "waste-treatment",
      "air-handling",
    ],
  },
  {
    id: "co-ctrlworks",
    name: "CtrlWorks Automation",
    slug: "ctrlworks-automation",
    headline: "PLC, HMI, SCADA and control panel builds",
    description:
      "Controls engineering for packaging and process lines with UL/CE panel builds and remote diagnostics.",
    country: "Australia",
    city: "Melbourne",
    website: "https://example.com/ctrlworks",
    verified: true,
    claimed: true,
    trustScore: 89.6,
    reviewCount: 25,
    employeeRange: "11-50",
    yearFounded: 2009,
    categories: [
      "factory-automation",
      "plc",
      "hmi",
      "scada",
      "control-panels",
      "plc-programming",
    ],
  },
  {
    id: "co-visionsafe",
    name: "VisionSafe Systems",
    slug: "visionsafe-systems",
    headline: "Machine vision, sensors and safety systems",
    description:
      "Vision inspection, photoelectric sensors, light curtains and safety PLC upgrades for existing production lines.",
    country: "Germany",
    city: "Munich",
    website: "https://example.com/visionsafe",
    verified: true,
    claimed: true,
    trustScore: 90.3,
    reviewCount: 22,
    employeeRange: "51-200",
    yearFounded: 2005,
    categories: [
      "factory-automation",
      "vision-systems",
      "sensors",
      "machine-safety",
      "servo-systems",
      "vsds",
    ],
  },
  {
    id: "co-mekong-elec",
    name: "Mekong Electrical Co.",
    slug: "mekong-electrical",
    headline: "Industrial electrical and panel installation",
    description:
      "Licensed electrical contractors for factory fit-outs, MCC rooms and emergency power integrations across Vietnam.",
    country: "Vietnam",
    city: "Binh Duong",
    website: "https://example.com/mekong-elec",
    verified: true,
    claimed: true,
    trustScore: 81.0,
    reviewCount: 13,
    employeeRange: "51-200",
    yearFounded: 2013,
    categories: [
      "service-categories",
      "electrical",
      "installation",
      "control-panels",
    ],
  },
  {
    id: "co-forgefab",
    name: "ForgeFab Stainless",
    slug: "forgefab-stainless",
    headline: "Hygienic fabrication, welding and skids",
    description:
      "Stainless fabrication for process skids, platforms and hygienic piping with ASME and food-grade weld procedures.",
    country: "Indonesia",
    city: "Jakarta",
    website: "https://example.com/forgefab",
    verified: true,
    claimed: false,
    trustScore: 79.5,
    reviewCount: 10,
    employeeRange: "51-200",
    yearFounded: 2007,
    categories: [
      "service-categories",
      "fabrication",
      "welding",
      "mechanical",
      "installation",
    ],
  },
  {
    id: "co-coldfix",
    name: "ColdFix Service",
    slug: "coldfix-service",
    headline: "Industrial refrigeration and cold-room HVAC",
    description:
      "Refrigeration contractors for cold stores, blast freezers and process chillers with 24/7 ASEAN call-outs.",
    country: "Thailand",
    city: "Bangkok",
    website: "https://example.com/coldfix",
    verified: true,
    claimed: true,
    trustScore: 83.1,
    reviewCount: 19,
    employeeRange: "11-50",
    yearFounded: 2010,
    categories: [
      "service-categories",
      "refrigeration",
      "hvac",
      "plumbing",
      "maintenance",
      "chillers",
    ],
  },
  {
    id: "co-plantcare",
    name: "PlantCare Maintenance",
    slug: "plantcare-maintenance",
    headline: "Preventive maintenance and line overhauls",
    description:
      "Multi-trade maintenance teams for packaging and process plants — mechanical, automation and planned shutdowns.",
    country: "Malaysia",
    city: "Shah Alam",
    website: "https://example.com/plantcare",
    verified: false,
    claimed: true,
    trustScore: 77.2,
    reviewCount: 8,
    employeeRange: "11-50",
    yearFounded: 2016,
    categories: [
      "service-categories",
      "maintenance",
      "mechanical",
      "automation",
      "commissioning",
    ],
  },
  {
    id: "co-kitchenpro",
    name: "KitchenPro Commercial",
    slug: "kitchenpro-commercial",
    headline: "Commercial kitchen and restaurant equipment",
    description:
      "Fit-out partner for hotels, restaurants and central kitchens with stainless equipment and installation crews.",
    country: "Thailand",
    city: "Bangkok",
    website: "https://example.com/kitchenpro",
    verified: true,
    claimed: true,
    trustScore: 82.0,
    reviewCount: 40,
    employeeRange: "51-200",
    yearFounded: 2002,
    categories: [
      "general-business",
      "commercial-kitchens",
      "hotels",
      "restaurants",
    ],
  },
  {
    id: "co-buildright",
    name: "BuildRight Industrial",
    slug: "buildright-industrial",
    headline: "Factory builders and trade fit-out teams",
    description:
      "Design-build contractor for light industrial sheds, cleanrooms and plant expansions with licensed trades.",
    country: "Vietnam",
    city: "Haiphong",
    website: "https://example.com/buildright",
    verified: true,
    claimed: true,
    trustScore: 80.8,
    reviewCount: 12,
    employeeRange: "201-500",
    yearFounded: 2004,
    categories: ["general-business", "builders", "trades", "professional-services"],
  },
  {
    id: "co-secureplant",
    name: "SecurePlant Services",
    slug: "secureplant-services",
    headline: "Site security, cleaning and IT infrastructure",
    description:
      "Facility services for industrial parks — access control, cleaning crews and plant-floor network cabling.",
    country: "Singapore",
    city: "Singapore",
    website: "https://example.com/secureplant",
    verified: false,
    claimed: false,
    trustScore: 73.5,
    reviewCount: 7,
    employeeRange: "51-200",
    yearFounded: 2015,
    categories: [
      "general-business",
      "security",
      "cleaning",
      "it-infrastructure",
      "medical-clinics",
    ],
  },
  {
    id: "co-asiacargo",
    name: "AsiaCargo Project",
    slug: "asiacargo-project",
    headline: "Project cargo and inland heavy haulage",
    description:
      "Breakbulk and project logistics for complete production lines with route surveys and temporary road permits.",
    country: "Malaysia",
    city: "Port Klang",
    website: "https://example.com/asiacargo",
    verified: true,
    claimed: true,
    trustScore: 86.7,
    reviewCount: 23,
    employeeRange: "51-200",
    yearFounded: 1997,
    categories: ["heavy-logistics", "cranes"],
  },
  {
    id: "co-qa-witness",
    name: "QA Witness Asia",
    slug: "qa-witness-asia",
    headline: "FAT, SAT and supplier quality audits",
    description:
      "Independent QC inspectors for machinery purchases in China, Taiwan and Korea with bilingual punch-list reports.",
    country: "Hong Kong",
    city: "Hong Kong",
    website: "https://example.com/qawitness",
    verified: true,
    claimed: true,
    trustScore: 91.8,
    reviewCount: 38,
    employeeRange: "11-50",
    yearFounded: 2012,
    categories: ["inspection-qc", "commissioning", "professional-services"],
  },
  {
    id: "co-capline",
    name: "CapLine Closure Systems",
    slug: "capline-closure-systems",
    headline: "Cappers, rinsers and bottle handling",
    description:
      "Rotary and chuck cappers for beverage and personal care bottles with integrated rinsers and conveyors.",
    country: "Spain",
    city: "Barcelona",
    website: "https://example.com/capline",
    verified: true,
    claimed: true,
    trustScore: 87.0,
    reviewCount: 16,
    employeeRange: "51-200",
    yearFounded: 1994,
    categories: [
      "packaging-machinery",
      "cappers",
      "bottle-fillers",
      "conveyors",
    ],
  },
];

export const demoProducts = [
  {
    id: "prod-1",
    companySlug: "nordicfill-systems",
    name: "NF-240 Rotary Filler",
    summary: "24-head rotary filler for PET and glass, up to 18,000 bph.",
  },
  {
    id: "prod-2",
    companySlug: "nordicfill-systems",
    name: "CIP Skid Compact",
    summary: "Skid-mounted CIP with recipe control and validation logging.",
  },
  {
    id: "prod-3",
    companySlug: "apex-robotics-asia",
    name: "Apex PalletCell 3",
    summary: "End-of-line palletising cell with safety fencing and HMI.",
  },
  {
    id: "prod-4",
    companySlug: "cleanair-plant-solutions",
    name: "CA-ISO7 AHU Package",
    summary: "ISO 7 cleanroom AHU package with HEPA and BMS integration.",
  },
  {
    id: "prod-5",
    companySlug: "sealtech-asia",
    name: "ST-900 Tray Sealer",
    summary: "MAP-ready tray sealer for ready meals, up to 15 cycles/min.",
  },
  {
    id: "prod-6",
    companySlug: "codejet-marking",
    name: "CJ-Pro CIJ Printer",
    summary: "IP65 continuous inkjet coder for high-speed beverage lines.",
  },
  {
    id: "prod-7",
    companySlug: "blendcraft-process",
    name: "HS-400 High Shear Mixer",
    summary: "Inline high-shear mixer for sauces and emulsions, CIP-ready.",
  },
  {
    id: "prod-8",
    companySlug: "ctrlworks-automation",
    name: "CW Panel Builder Kit",
    summary: "Pre-engineered PLC/HMI panel templates for packaging lines.",
  },
  {
    id: "prod-9",
    companySlug: "airpower-utilities",
    name: "AP-75 Screw Compressor",
    summary: "75 kW oil-injected compressor package with dryer and receiver.",
  },
  {
    id: "prod-10",
    companySlug: "thermoline-asia",
    name: "TL Pasteurizer 5k",
    summary: "Plate pasteuriser skid for juice and dairy, 5,000 L/h.",
  },
];

export const demoReviews: DemoReview[] = [
  {
    id: "rev-1",
    companyId: "co-nordic-fill",
    companySlug: "nordicfill-systems",
    rating: 5,
    title: "Reliable commissioning in Thailand",
    body: "Line was installed on schedule. Documentation and FAT package made our QA team confident.",
    author: "Procurement Lead, Beverage Co",
    verifiedPurchase: true,
    status: "approved",
    createdAt: "2026-05-12",
  },
  {
    id: "rev-2",
    companyId: "co-apex-robotics",
    companySlug: "apex-robotics-asia",
    rating: 4,
    title: "Strong local support",
    body: "Robot cell integration was smooth. Response times during ramp-up were excellent.",
    author: "Plant Manager, Electronics OEM",
    verifiedPurchase: true,
    status: "approved",
    createdAt: "2026-04-02",
  },
  {
    id: "rev-3",
    companyId: "co-harbor-freight",
    companySlug: "harbor-heavy-freight",
    rating: 5,
    title: "Handled a 42-ton press without drama",
    body: "Customs and inland haulage were coordinated tightly. Clear evidence trail throughout.",
    author: "Logistics Director, Auto Parts",
    verifiedPurchase: true,
    status: "approved",
    createdAt: "2026-03-18",
  },
  {
    id: "rev-pending",
    companyId: "co-cleanair",
    companySlug: "cleanair-plant-solutions",
    rating: 3,
    title: "Lead time slipped two weeks",
    body: "Quality was fine but schedule slipped. Uploading PO as evidence.",
    author: "Facilities Buyer",
    verifiedPurchase: true,
    status: "pending",
    createdAt: "2026-07-01",
  },
];

export const demoRequests: DemoRequest[] = [
  {
    id: "req-1",
    title: "Rotary filler for sparkling water line",
    slug: "rotary-filler-sparkling-water",
    description:
      "Looking for a hygienic rotary filler suitable for 500ml PET, 12–15k bph, with CIP and local ASEAN commissioning support.",
    category: "packaging-machinery",
    budgetMin: 180000,
    budgetMax: 320000,
    currency: "USD",
    deliveryCountry: "Thailand",
    status: "open",
    quoteCount: 3,
    createdAt: "2026-06-28",
  },
  {
    id: "req-2",
    title: "Palletising cell for carton end-of-line",
    slug: "palletising-cell-carton",
    description:
      "Need a turnkey palletising cell for 20 kg cartons, 12 cycles/min, with safety certification and Thai language HMI.",
    category: "factory-automation",
    budgetMin: 90000,
    budgetMax: 150000,
    currency: "USD",
    deliveryCountry: "Vietnam",
    status: "open",
    quoteCount: 2,
    createdAt: "2026-07-02",
  },
  {
    id: "req-3",
    title: "FAT witnessing for extrusion line in China",
    slug: "fat-witnessing-extrusion-china",
    description:
      "Independent inspector required for 3-day FAT at OEM in Guangdong. Photo evidence pack and punch list required.",
    category: "inspection-qc",
    budgetMin: 3500,
    budgetMax: 6500,
    currency: "USD",
    deliveryCountry: "China",
    status: "open",
    quoteCount: 4,
    createdAt: "2026-07-05",
  },
];

export const demoQuotes: DemoQuote[] = [
  {
    id: "q-1",
    requestId: "req-1",
    companyName: "NordicFill Systems",
    companySlug: "nordicfill-systems",
    amount: 265000,
    currency: "USD",
    leadTimeDays: 120,
    notes: "Includes FAT in Malmö and 2 weeks commissioning in Thailand.",
    status: "submitted",
  },
  {
    id: "q-2",
    requestId: "req-1",
    companyName: "Mekong Spare Parts Hub",
    companySlug: "mekong-spare-parts-hub",
    amount: 198000,
    currency: "USD",
    leadTimeDays: 90,
    notes: "Partner OEM fill line; local spare parts stock included for 12 months.",
    status: "submitted",
  },
  {
    id: "q-3",
    requestId: "req-2",
    companyName: "Apex Robotics Asia",
    companySlug: "apex-robotics-asia",
    amount: 128000,
    currency: "USD",
    leadTimeDays: 75,
    notes: "Includes fencing, HMI Thai/EN, and operator training.",
    status: "shortlisted",
  },
];

export const demoProjects: DemoProject[] = [
  {
    id: "proj-1",
    name: "Bangkok Beverage Line Upgrade",
    slug: "bangkok-beverage-line-upgrade",
    summary: "Replace filler and add palletising cell for Line 2.",
    status: "active",
    memberCount: 4,
  },
  {
    id: "proj-2",
    name: "HCMC Cold Chain Expansion",
    slug: "hcmc-cold-chain-expansion",
    summary: "HVAC and logistics RFQs for new chilled warehouse.",
    status: "active",
    memberCount: 3,
  },
];

export const demoClaims: DemoClaim[] = [
  {
    id: "claim-1",
    companyName: "Harbor Heavy Freight",
    companySlug: "harbor-heavy-freight",
    claimant: "ops@harbor.example",
    status: "pending",
    notes: "Business registration and domain WHOIS attached.",
    createdAt: "2026-07-08",
  },
  {
    id: "claim-2",
    companyName: "CleanAir Plant Solutions",
    companySlug: "cleanair-plant-solutions",
    claimant: "admin@cleanair.example",
    status: "pending",
    notes: "Company stamp letter and LinkedIn company admin proof.",
    createdAt: "2026-07-09",
  },
];

export const demoPlans: DemoPlan[] = [
  {
    code: "buyer-free",
    name: "Buyer Free",
    audience: "buyer",
    priceMonthly: 0,
    features: [
      "Search suppliers",
      "Save shortlists",
      "Post 1 RFQ / month",
      "Basic Trust Score view",
    ],
  },
  {
    code: "buyer-premium",
    name: "Buyer Premium",
    audience: "buyer",
    priceMonthly: 39,
    highlighted: true,
    features: [
      "Unlimited RFQs",
      "Quote comparison workspace",
      "Verified review uploads",
      "Project workspace lite",
      "Priority support",
    ],
  },
  {
    code: "supplier-silver",
    name: "Supplier Silver",
    audience: "supplier",
    priceMonthly: 49,
    features: [
      "Claimed company profile",
      "Product catalogue",
      "RFQ lead inbox",
      "Review responses",
    ],
  },
  {
    code: "supplier-gold",
    name: "Supplier Gold",
    audience: "supplier",
    priceMonthly: 199,
    highlighted: true,
    features: [
      "Everything in Silver",
      "Featured search placement label",
      "Advanced analytics",
      "Credit pack bonus",
    ],
  },
  {
    code: "supplier-platinum",
    name: "Supplier Platinum",
    audience: "supplier",
    priceMonthly: 799,
    features: [
      "Everything in Gold",
      "Dedicated success manager",
      "API access (coming soon)",
      "Enterprise audit exports",
    ],
  },
];

export const upcomingModules = [
  {
    slug: "intelligence",
    name: "RateQuip Intelligence",
    summary: "Explainable supplier and market intelligence.",
  },
  {
    slug: "srm",
    name: "Supplier Relationship Management",
    summary: "Preferred lists, scorecards and renewals.",
  },
  {
    slug: "equipment-lifecycle",
    name: "Equipment Lifecycle",
    summary: "Acquisition through maintenance and resale.",
  },
  {
    slug: "asset-register",
    name: "Asset Register",
    summary: "Multi-site assets, serials and expiry reminders.",
  },
  {
    slug: "digital-passport",
    name: "Digital Equipment Passport",
    summary: "Verified equipment identity with evidence trail.",
  },
  {
    slug: "ai-copilot",
    name: "AI Procurement Co-Pilot",
    summary: "Spec drafting, shortlists and quote analysis.",
  },
  {
    slug: "risk",
    name: "Predictive Supplier Risk",
    summary: "Forward-looking risk signals with appeals.",
  },
  {
    slug: "academy",
    name: "RateQuip Academy",
    summary: "Industrial training and credentials.",
  },
  {
    slug: "compliance",
    name: "Supplier Compliance Centre",
    summary: "Certificates, questionnaires and expiry alerts.",
  },
  {
    slug: "finance",
    name: "Equipment Finance Marketplace",
    summary: "Licensed partner finance referrals.",
  },
  {
    slug: "insurance",
    name: "Insurance Marketplace",
    summary: "Transit and equipment cover referrals.",
  },
  {
    slug: "developer",
    name: "Developer Portal",
    summary: "Public APIs, sandbox and usage billing.",
  },
];

export const demoWallet = {
  balance: 250,
  entries: [
    {
      id: "led-1",
      delta: 300,
      reason: "Starter credit pack",
      createdAt: "2026-06-01",
    },
    {
      id: "led-2",
      delta: -25,
      reason: "RFQ lead unlock",
      createdAt: "2026-06-15",
    },
    {
      id: "led-3",
      delta: -25,
      reason: "RFQ lead unlock",
      createdAt: "2026-07-02",
    },
  ],
};

export const demoAudit = [
  {
    id: "aud-1",
    action: "review.approved",
    entityType: "review",
    actor: "admin@ratequip.com",
    createdAt: "2026-07-08T10:00:00Z",
  },
  {
    id: "aud-2",
    action: "claim.submitted",
    entityType: "company_claim",
    actor: "ops@harbor.example",
    createdAt: "2026-07-08T14:20:00Z",
  },
  {
    id: "aud-3",
    action: "request.created",
    entityType: "request",
    actor: "buyer@example.com",
    createdAt: "2026-07-05T09:12:00Z",
  },
];
