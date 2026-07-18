export type TourRole = "buyer" | "supplier" | "contractor" | "admin";

export type TourStep = {
  id: string;
  title: string;
  body: string;
  /** Matches `[data-tour="..."]` on the page. Omit for centered welcome/finish cards. */
  target?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** Optional primary action after this step (finish step). */
  cta?: { label: string; href: string };
};

const sharedIntro: TourStep = {
  id: "welcome",
  title: "Welcome to RateQuip",
  body: "A quick tour of how to click, search, and navigate. Takes about a minute — you can skip anytime.",
  placement: "center",
};

const sharedNav: TourStep = {
  id: "top-nav",
  title: "Main navigation",
  body: "Use the top bar to browse suppliers, open RFQs, explore categories, and check pricing. These links work from every page.",
  target: "top-nav",
  placement: "bottom",
};

const sharedSidebar: TourStep = {
  id: "dash-nav",
  title: "Your dashboards",
  body: "Switch between Buyer, Supplier, Contractor, and Admin views here. Your role determines what you see first after sign-up.",
  target: "dash-nav",
  placement: "right",
};

const buyerSteps: TourStep[] = [
  sharedIntro,
  sharedNav,
  sharedSidebar,
  {
    id: "buyer-stats",
    title: "At a glance",
    body: "Track open RFQs, active projects, and credit balance. Credits are used when you publish requests.",
    target: "buyer-stats",
    placement: "bottom",
  },
  {
    id: "buyer-actions",
    title: "Quick actions",
    body: "Start here: post an RFQ, add a company, open a project workspace, compare quotes, or manage billing.",
    target: "buyer-actions",
    placement: "bottom",
  },
  {
    id: "buyer-suppliers",
    title: "Saved suppliers",
    body: "Click a supplier name to open their profile, trust score, and contact path. Browse the full directory from Suppliers in the top nav.",
    target: "buyer-suppliers",
    placement: "top",
  },
  {
    id: "finish",
    title: "You’re ready",
    body: "Try posting your first RFQ, or explore the supplier directory. Replay this tour anytime from “Take a tour”.",
    placement: "center",
    cta: { label: "Post an RFQ", href: "/requests/new" },
  },
];

const supplierSteps: TourStep[] = [
  sharedIntro,
  sharedNav,
  sharedSidebar,
  {
    id: "supplier-stats",
    title: "Lead overview",
    body: "See open leads, quotes you’ve sent, and reviews waiting for attention.",
    target: "supplier-stats",
    placement: "bottom",
  },
  {
    id: "supplier-actions",
    title: "Grow your presence",
    body: "Edit your profile, publish products, build quotes, and manage billing from these shortcuts.",
    target: "supplier-actions",
    placement: "bottom",
  },
  {
    id: "supplier-leads",
    title: "Lead inbox",
    body: "Click a lead title to open the RFQ and respond with a quote. New open requests land here first.",
    target: "supplier-leads",
    placement: "top",
  },
  {
    id: "finish",
    title: "You’re ready",
    body: "Complete your profile so buyers can find you, then reply to open leads. Replay this tour anytime from “Take a tour”.",
    placement: "center",
    cta: { label: "Edit profile", href: "/dashboard/supplier/profile" },
  },
];

const contractorSteps: TourStep[] = [
  sharedIntro,
  sharedNav,
  sharedSidebar,
  {
    id: "contractor-actions",
    title: "Get started",
    body: "Browse open RFQs, claim your company profile, or open the compliance centre as those modules roll out.",
    target: "contractor-actions",
    placement: "bottom",
  },
  {
    id: "finish",
    title: "You’re ready",
    body: "Start with the RFQ board or claim your company so buyers can reach you. Replay this tour anytime from “Take a tour”.",
    placement: "center",
    cta: { label: "Browse RFQs", href: "/requests" },
  },
];

const adminSteps: TourStep[] = [
  sharedIntro,
  sharedNav,
  sharedSidebar,
  {
    id: "finish",
    title: "Admin workspace",
    body: "Use this dashboard to moderate submissions and keep marketplace quality high. Replay this tour anytime from “Take a tour”.",
    placement: "center",
  },
];

export function getTourSteps(role: string): TourStep[] {
  switch (role) {
    case "supplier":
      return supplierSteps;
    case "contractor":
      return contractorSteps;
    case "admin":
      return adminSteps;
    case "buyer":
    default:
      return buyerSteps;
  }
}
