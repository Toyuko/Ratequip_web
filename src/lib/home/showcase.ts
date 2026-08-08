/**
 * Curated homepage showcase content — industrial visuals + sample marketplace
 * surfaces so the landing page feels like a live platform at launch.
 */

export type ShowcaseEquipment = {
  id: string;
  name: string;
  manufacturer: string;
  companySlug: string;
  category: string;
  location: string;
  specs: string[];
  imageSrc: string;
  imageAlt: string;
};

export type ShowcaseIndustry = {
  name: string;
  slug: string;
  imageSrc: string;
  imageAlt: string;
};

export type ShowcaseEvidencePillar = {
  title: string;
  body: string;
};

export type ShowcaseCompareRow = {
  label: string;
  values: [string, string, string];
};

export type ShowcaseCountry = {
  name: string;
  code: string;
  x: number;
  y: number;
};

/** Soft, atmospheric industrial photography (used with blur + heavy overlay). */
export const HERO_MONTAGE = [
  {
    src: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=60",
    alt: "Muted factory floor atmosphere",
  },
  {
    src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1600&q=60",
    alt: "Soft-focus industrial machinery",
  },
  {
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=60",
    alt: "Abstract production environment",
  },
] as const;

export const HERO_QUICK_LINKS = [
  { label: "Filling Machines", query: "Filling Machines" },
  { label: "Packaging", query: "Packaging" },
  { label: "Conveyors", query: "Conveyors" },
  { label: "Robotics", query: "Robotics" },
  { label: "Processing", query: "Processing" },
  { label: "Coding", query: "Coding" },
  { label: "Inspection", query: "Inspection" },
] as const;

export const FEATURED_EQUIPMENT: ShowcaseEquipment[] = [
  {
    id: "eq-1",
    name: "NF-240 Rotary Filler",
    manufacturer: "NordicFill Systems",
    companySlug: "nordicfill-systems",
    category: "Filling & Bottling",
    location: "Bangkok, Thailand",
    specs: ["18,000 bph", "PET & glass", "CIP-ready"],
    imageSrc:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Bottle filling line on a production floor",
  },
  {
    id: "eq-2",
    name: "Apex PalletCell 3",
    manufacturer: "Apex Robotics Asia",
    companySlug: "apex-robotics-asia",
    category: "Robotics & Automation",
    location: "Singapore",
    specs: ["12 cycles/min", "Safety cell", "Thai HMI"],
    imageSrc:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Industrial robot palletising cartons",
  },
  {
    id: "eq-3",
    name: "ST-900 Tray Sealer",
    manufacturer: "SealTech Asia",
    companySlug: "sealtech-asia",
    category: "Packaging",
    location: "Kuala Lumpur, Malaysia",
    specs: ["MAP-ready", "15 cycles/min", "Ready meals"],
    imageSrc:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Food packaging machinery in a plant",
  },
  {
    id: "eq-4",
    name: "HS-400 High Shear Mixer",
    manufacturer: "BlendCraft Process",
    companySlug: "blendcraft-process",
    category: "Processing",
    location: "Ho Chi Minh City, Vietnam",
    specs: ["Inline", "CIP-ready", "Sauces & emulsions"],
    imageSrc:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Stainless steel process mixing equipment",
  },
];

export const INDUSTRY_TILES: ShowcaseIndustry[] = [
  {
    name: "Processing & Production",
    slug: "food-processing",
    imageSrc:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Industrial process plant",
  },
  {
    name: "Packaging",
    slug: "packaging-machinery",
    imageSrc:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Packaging production line",
  },
  {
    name: "Filling & Bottling",
    slug: "packaging-machinery",
    imageSrc:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Bottle filling equipment",
  },
  {
    name: "Conveying & Handling",
    slug: "industrial-equipment",
    imageSrc:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Warehouse conveyor systems",
  },
  {
    name: "Robotics & Automation",
    slug: "factory-automation",
    imageSrc:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Factory robotics cell",
  },
  {
    name: "Coding & Marking",
    slug: "packaging-machinery",
    imageSrc:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Industrial coding equipment",
  },
  {
    name: "Inspection & Quality",
    slug: "inspection-qc",
    imageSrc:
      "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Quality inspection on the line",
  },
  {
    name: "Pharmaceutical",
    slug: "food-processing",
    imageSrc:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Pharmaceutical production environment",
  },
  {
    name: "Food & Beverage",
    slug: "food-processing",
    imageSrc:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Food and beverage plant floor",
  },
  {
    name: "Used Equipment",
    slug: "industrial-equipment",
    imageSrc:
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Industrial machinery inventory",
  },
];

export const EVIDENCE_PILLARS: ShowcaseEvidencePillar[] = [
  {
    title: "Verified transactions",
    body: "Purchase evidence and completed project trails — not anonymous star ratings.",
  },
  {
    title: "Company history",
    body: "Capabilities, installed base, industries served and years in market.",
  },
  {
    title: "Response performance",
    body: "How suppliers engage RFQs, quotes and follow-ups over time.",
  },
  {
    title: "Reviews with proof",
    body: "Independent reviews tied to real deliveries, FAT and commissioning.",
  },
];

export const COMPARE_MACHINES = [
  "NF-240 Rotary Filler",
  "ST-900 Tray Sealer",
  "Apex PalletCell 3",
] as const;

export const COMPARE_ROWS: ShowcaseCompareRow[] = [
  {
    label: "Category",
    values: ["Filling", "Packaging", "Robotics"],
  },
  {
    label: "Throughput",
    values: ["18,000 bph", "15 cycles/min", "12 cycles/min"],
  },
  {
    label: "Supplier",
    values: ["NordicFill", "SealTech Asia", "Apex Robotics"],
  },
  {
    label: "Location",
    values: ["Thailand", "Malaysia", "Singapore"],
  },
  {
    label: "Trust Score",
    values: ["92", "88", "90"],
  },
  {
    label: "CIP / Hygiene",
    values: ["Yes", "MAP-ready", "N/A"],
  },
];

/** Approximate SVG map pin positions (viewBox 0 0 1000 500). */
export const NETWORK_COUNTRIES: ShowcaseCountry[] = [
  { name: "Australia", code: "AU", x: 860, y: 380 },
  { name: "Thailand", code: "TH", x: 760, y: 250 },
  { name: "Vietnam", code: "VN", x: 780, y: 240 },
  { name: "Singapore", code: "SG", x: 775, y: 290 },
  { name: "Malaysia", code: "MY", x: 765, y: 285 },
  { name: "China", code: "CN", x: 780, y: 190 },
  { name: "Japan", code: "JP", x: 850, y: 175 },
  { name: "Germany", code: "DE", x: 510, y: 145 },
  { name: "Sweden", code: "SE", x: 520, y: 95 },
  { name: "United States", code: "US", x: 220, y: 180 },
  { name: "United Kingdom", code: "GB", x: 475, y: 130 },
  { name: "India", code: "IN", x: 700, y: 230 },
];

export const CREDIT_USES = [
  "Profile boosts & visibility",
  "Featured equipment listings",
  "Premium RFQ & opportunity access",
  "Advertising & discovery placements",
] as const;
