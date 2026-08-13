/** Capability index 1–105 mapped onto the live RateQuip platform.
 * Titles/summaries from the Super Repository blueprint (11 Aug 2026).
 * layer: live = Phase 2 production · v12 = enterprise thin slice · later = backlog
 */
export type CapabilityLayer = "live" | "v12" | "later";

export type BlueprintCapability = {
  number: number;
  slug: string;
  title: string;
  group: string;
  summary: string;
  layer: CapabilityLayer;
  note: string;
};

export const blueprintCapabilities: BlueprintCapability[] = [
  {
    "number": 1,
    "slug": "1-expanded-ratequip-vision",
    "title": "Expanded RateQuip Vision",
    "group": "Platform Strategy And Connected Economies",
    "summary": "RateQuip should no longer be defined merely as an industrial marketplace, RFQ platform or supplier directory.",
    "layer": "live",
    "note": "Public positioning on the live site and /economies"
  },
  {
    "number": 2,
    "slug": "2-ratequip-is-actually-several-interconnected-economies",
    "title": "RateQuip Is Actually Several Interconnected Economies",
    "group": "Platform Strategy And Connected Economies",
    "summary": "The final platform should contain multiple interconnected economies.",
    "layer": "live",
    "note": "Twelve-economy model published; industrial + procurement live"
  },
  {
    "number": 3,
    "slug": "3-the-ratequip-individual-account-becomes-extremely-important",
    "title": "The RateQuip Individual Account Becomes Extremely Important",
    "group": "Professional Identity, Capability And Portable Trust",
    "summary": "Currently industrial platforms generally begin with companies.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 4,
    "slug": "4-ai-resume-and-capability-builder",
    "title": "AI Resume and Capability Builder",
    "group": "Professional Identity, Capability And Portable Trust",
    "summary": "\\",
    "layer": "v12",
    "note": "V12 activation / DQE company setup"
  },
  {
    "number": 5,
    "slug": "5-ratequip-work-passport",
    "title": "RateQuip Work Passport",
    "group": "Professional Identity, Capability And Portable Trust",
    "summary": "Every professional should progressively build a RateQuip Work Passport.",
    "layer": "v12",
    "note": "Work Passport specified; contractor builder thin slice"
  },
  {
    "number": 6,
    "slug": "6-global-local-eyes-network",
    "title": "Global Local-Eyes Network",
    "group": "Local Representation, Field Evidence And Distributed Project Delivery",
    "summary": "Consider an Australian buyer purchasing a machine from a manufacturer in Guangzhou.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 7,
    "slug": "7-turn-up-and-check-my-machine",
    "title": "\\",
    "group": "Local Representation, Field Evidence And Distributed Project Delivery",
    "summary": "\\",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 8,
    "slug": "8-field-evidence-application",
    "title": "Field Evidence Application",
    "group": "Local Representation, Field Evidence And Distributed Project Delivery",
    "summary": "The representative's mobile application becomes an important product.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 9,
    "slug": "9-project-manager-marketplace",
    "title": "Project Manager Marketplace",
    "group": "Local Representation, Field Evidence And Distributed Project Delivery",
    "summary": "The successful person receives access to a controlled project workspace.",
    "layer": "v12",
    "note": "Contractor builder thin slice"
  },
  {
    "number": 10,
    "slug": "10-ratequip-distributed-project-office",
    "title": "RateQuip Distributed Project Office",
    "group": "Local Representation, Field Evidence And Distributed Project Delivery",
    "summary": "Once appointed, the local representative sees only information required for their role.",
    "layer": "v12",
    "note": "V12 workflow + project create"
  },
  {
    "number": 11,
    "slug": "11-global-multinational-team-formation",
    "title": "Global Multinational Team Formation",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "RateQuip AI identifies that their combined skills can service a particular market.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 12,
    "slug": "12-ratequip-virtual-businesses",
    "title": "RateQuip Virtual Businesses",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "A Virtual Venture is not automatically represented as a legally incorporated company.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 13,
    "slug": "13-ai-business-formation-assistant",
    "title": "AI Business Formation Assistant",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "Where legal incorporation is required, RateQuip can connect users with suitable lawyers, accountants or company-formation services rather than pretending the platform itself has created a legal entity.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 14,
    "slug": "14-ai-detects-capability-gaps-in-teams",
    "title": "AI Detects Capability Gaps in Teams",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "Your team has strong mechanical, electrical and controls engineering but no process-safety specialist.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 15,
    "slug": "15-team-roles",
    "title": "Team Roles",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "The primary actor is a group of complementary professionals; the relevant counterparty is customers, suppliers and fellow members. The system of record is a project team or persistent virtual venture, and the outcome must be supported by accepted constitution versions, votes, rol",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 16,
    "slug": "16-team-voting",
    "title": "Team Voting",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "The primary actor is a group of complementary professionals; the relevant counterparty is customers, suppliers and fellow members. The system of record is a project team or persistent virtual venture, and the outcome must be supported by accepted constitution versions, votes, rol",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 17,
    "slug": "17-ratequip-team-constitution",
    "title": "RateQuip Team Constitution",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "The primary actor is a group of complementary professionals; the relevant counterparty is customers, suppliers and fellow members. The system of record is a project team or persistent virtual venture, and the outcome must be supported by accepted constitution versions, votes, rol",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 18,
    "slug": "18-project-specific-revenue-splits",
    "title": "Project-Specific Revenue Splits",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "A business's ownership split does not necessarily equal its project-payment split.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 19,
    "slug": "19-dynamic-revenue-splits",
    "title": "Dynamic Revenue Splits",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "However, complicated automatic formulas should only be used where all participants have explicitly agreed to them.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 20,
    "slug": "20-team-treasury",
    "title": "Team Treasury",
    "group": "Multinational Teams, Virtual Ventures And Governed Collaboration",
    "summary": "Actual custody and settlement should initially be handled through appropriately licensed payment providers rather than RateQuip casually holding customer crypto itself.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 21,
    "slug": "21-payment-architecture",
    "title": "Payment Architecture",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "with additional supported assets added only after compliance and operational review.",
    "layer": "live",
    "note": "Stripe Checkout, wallets, credit packs, webhooks"
  },
  {
    "number": 22,
    "slug": "22-my-recommended-crypto-hierarchy",
    "title": "My Recommended Crypto Hierarchy",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "I would make USDC the primary crypto-style settlement option.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 23,
    "slug": "23-separate-the-invoice-currency-from-the-payment-rail",
    "title": "Separate the Invoice Currency From the Payment Rail",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "The primary actor is a payer, payee or team treasurer; the relevant counterparty is a licensed payment provider and project participants. The system of record is an invoice, funded milestone or withdrawal instruction, and the outcome must be supported by ledger entries, approvals",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 24,
    "slug": "24-ratequip-wallet-experience",
    "title": "RateQuip Wallet Experience",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "The user should not need to understand blockchain terminology to use RateQuip.",
    "layer": "live",
    "note": "Buyer and supplier billing dashboards"
  },
  {
    "number": 25,
    "slug": "25-convert-earnings-into-ratequip-credits",
    "title": "Convert Earnings Into RateQuip Credits",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "leave funds available for future platform services, subject to legal/accounting structure.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 26,
    "slug": "26-credits-must-not-pretend-to-be-cryptocurrency",
    "title": "Credits Must Not Pretend to Be Cryptocurrency",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "The primary actor is a payer, payee or team treasurer; the relevant counterparty is a licensed payment provider and project participants. The system of record is an invoice, funded milestone or withdrawal instruction, and the outcome must be supported by ledger entries, approvals",
    "layer": "live",
    "note": "Credits are a platform utility, not an investment product"
  },
  {
    "number": 27,
    "slug": "27-milestone-escrow",
    "title": "Milestone Escrow",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "For crypto rails, this could potentially integrate regulated custodial or programmable-payment infrastructure rather than RateQuip itself taking on unnecessary custody obligations.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 28,
    "slug": "28-multi-party-approval",
    "title": "Multi-Party Approval",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "The concept maps naturally to multi-signature or programmable-account concepts where suitable. Current XRP Ledger documentation, for example, supports signer lists and weighted multi-signing.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 29,
    "slug": "29-split-withdrawals",
    "title": "Split Withdrawals",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "The platform calculates this only after any applicable obligations, restrictions and provider requirements are satisfied.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 30,
    "slug": "30-team-treasury-withdrawals",
    "title": "Team Treasury Withdrawals",
    "group": "Commercial Ledger, Payments, Escrow And Allocation",
    "summary": "The primary actor is a payer, payee or team treasurer; the relevant counterparty is a licensed payment provider and project participants. The system of record is an invoice, funded milestone or withdrawal instruction, and the outcome must be supported by ledger entries, approvals",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 31,
    "slug": "31-local-industrial-micro-tasks",
    "title": "Local Industrial Micro-Tasks",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "Qualified technical activities would require correspondingly qualified people.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 32,
    "slug": "32-ratequip-local-eyes",
    "title": "RateQuip Local Eyes",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "Someone trusted near your supplier, factory or project when you can't be there.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 33,
    "slug": "33-local-representation-subscriptions",
    "title": "Local Representation Subscriptions",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "That creates recurring work for qualified RateQuip professionals.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 34,
    "slug": "34-remote-engineering-teams",
    "title": "Remote Engineering Teams",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "The existing RateQuip ecosystem specification already calls for discrete work packages with scope, deliverables, interfaces, eligibility and acceptance evidence.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 35,
    "slug": "35-build-my-team-ai-agent",
    "title": "\\",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "\\",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 36,
    "slug": "36-individuals-can-become-sales-representatives",
    "title": "Individuals Can Become Sales Representatives",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "A manufacturer in Germany wants representation in Australia but doesn't want to employ a full-time salesperson.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 37,
    "slug": "37-manufacturer-representative-networks",
    "title": "Manufacturer Representative Networks",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "A company can create its own distributed global sales network:",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 38,
    "slug": "38-everyday-person-marketing-work",
    "title": "Everyday Person Marketing Work",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "People without industrial qualifications can still participate.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 39,
    "slug": "39-physical-marketing-kits",
    "title": "Physical Marketing Kits",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "The primary actor is a business seeking local commercial activity; the relevant counterparty is an eligible local contributor. The system of record is a bounded field, sales or marketing task, and the outcome must be supported by approved creative, proof of placement or introduct",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 40,
    "slug": "40-street-and-event-promotion",
    "title": "Street and Event Promotion",
    "group": "Local Tasks, Sales Representation And Human-Powered Marketing",
    "summary": "The primary actor is a business seeking local commercial activity; the relevant counterparty is an eligible local contributor. The system of record is a bounded field, sales or marketing task, and the outcome must be supported by approved creative, proof of placement or introduct",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 41,
    "slug": "41-ratequip-earn-marketplace",
    "title": "RateQuip Earn Marketplace",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "The primary actor is a professional or team seeking work; the relevant counterparty is a qualified buyer. The system of record is an opportunity, service package or proposal, and the outcome must be supported by eligibility factors, scope, price assumptions, acceptance and delive",
    "layer": "live",
    "note": "RFQ marketplace: create, quote, award, 25-credit debit"
  },
  {
    "number": 42,
    "slug": "42-ratequip-opportunity-radar",
    "title": "RateQuip Opportunity Radar",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "The primary actor is a professional or team seeking work; the relevant counterparty is a qualified buyer. The system of record is an opportunity, service package or proposal, and the outcome must be supported by eligibility factors, scope, price assumptions, acceptance and delive",
    "layer": "v12",
    "note": "Opportunity builder thin slice"
  },
  {
    "number": 43,
    "slug": "43-ratequip-missions-and-gamification",
    "title": "RateQuip Missions and Gamification",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "The primary actor is a professional or team seeking work; the relevant counterparty is a qualified buyer. The system of record is an opportunity, service package or proposal, and the outcome must be supported by eligibility factors, scope, price assumptions, acceptance and delive",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 44,
    "slug": "44-reputation-dimensions",
    "title": "Reputation Dimensions",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "The primary actor is a professional or team seeking work; the relevant counterparty is a qualified buyer. The system of record is an opportunity, service package or proposal, and the outcome must be supported by eligibility factors, scope, price assumptions, acceptance and delive",
    "layer": "live",
    "note": "Explainable Trust Score (review, verification, activity)"
  },
  {
    "number": 45,
    "slug": "45-trust-levels",
    "title": "Trust Levels",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "The primary actor is a professional or team seeking work; the relevant counterparty is a qualified buyer. The system of record is an opportunity, service package or proposal, and the outcome must be supported by eligibility factors, scope, price assumptions, acceptance and delive",
    "layer": "live",
    "note": "Claimed / verified company levels"
  },
  {
    "number": 46,
    "slug": "46-team-reputation",
    "title": "Team Reputation",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "Then the team becomes commercially valuable even though members are internationally distributed.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 47,
    "slug": "47-people-can-sell-service-packages",
    "title": "People Can Sell Service Packages",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "The primary actor is a professional or team seeking work; the relevant counterparty is a qualified buyer. The system of record is an opportunity, service package or proposal, and the outcome must be supported by eligibility factors, scope, price assumptions, acceptance and delive",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 48,
    "slug": "48-team-service-catalogues",
    "title": "Team Service Catalogues",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "A virtual multinational organisation can therefore look and operate like a professional industrial services company.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 49,
    "slug": "49-ratequip-ai-proposal-builder",
    "title": "RateQuip AI Proposal Builder",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "The primary actor is a professional or team seeking work; the relevant counterparty is a qualified buyer. The system of record is an opportunity, service package or proposal, and the outcome must be supported by eligibility factors, scope, price assumptions, acceptance and delive",
    "layer": "v12",
    "note": "AI RFQ assist / intelligence draft"
  },
  {
    "number": 50,
    "slug": "50-automated-team-scheduling",
    "title": "Automated Team Scheduling",
    "group": "Opportunity Discovery, Reputation, Service Packaging And Proposals",
    "summary": "The primary actor is a professional or team seeking work; the relevant counterparty is a qualified buyer. The system of record is an opportunity, service package or proposal, and the outcome must be supported by eligibility factors, scope, price assumptions, acceptance and delive",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 51,
    "slug": "51-follow-the-sun-engineering",
    "title": "Follow-the-Sun Engineering",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "With appropriate handover processes, global distributed teams can reduce idle project time.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 52,
    "slug": "52-ratequip-venture-discovery",
    "title": "RateQuip Venture Discovery",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "The primary actor is a founder, customer or AI-assisted team builder; the relevant counterparty is candidate members and delivery partners. The system of record is a commercial opportunity transformed into a governed delivery organisation, and the outcome must be supported by gap",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 53,
    "slug": "53-opportunity-to-business-transformation",
    "title": "Opportunity-to-Business Transformation",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "\\",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 54,
    "slug": "54-business-incubator-layer",
    "title": "Business Incubator Layer",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "The primary actor is a founder, customer or AI-assisted team builder; the relevant counterparty is candidate members and delivery partners. The system of record is a commercial opportunity transformed into a governed delivery organisation, and the outcome must be supported by gap",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 55,
    "slug": "55-sales-technical-team-formation",
    "title": "Sales + Technical Team Formation",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "This potentially unlocks people who could never independently create a business.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 56,
    "slug": "56-manufacturer-ratequip-team-partnerships",
    "title": "Manufacturer + RateQuip Team Partnerships",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "The primary actor is a founder, customer or AI-assisted team builder; the relevant counterparty is candidate members and delivery partners. The system of record is a commercial opportunity transformed into a governed delivery organisation, and the outcome must be supported by gap",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 57,
    "slug": "57-contractor-networks-around-equipment",
    "title": "Contractor Networks Around Equipment",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "When a machine is sold, RateQuip can automatically create the local support ecosystem:",
    "layer": "v12",
    "note": "Asset register thin slice"
  },
  {
    "number": 58,
    "slug": "58-customer-owned-project-team",
    "title": "Customer-Owned Project Team",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "This dramatically expands RateQuip from sourcing into actual project execution.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 59,
    "slug": "59-project-command-centre",
    "title": "Project Command Centre",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "RateQuip therefore follows the project from first enquiry through operation.",
    "layer": "v12",
    "note": "V12 workflow command surface"
  },
  {
    "number": 60,
    "slug": "60-ai-project-watchdog",
    "title": "AI Project Watchdog",
    "group": "Venture Discovery, Incubation And Project Command",
    "summary": "Fabrication is approximately 11 days behind the approved schedule.",
    "layer": "v12",
    "note": "Intelligence / watchdog specified in V12"
  },
  {
    "number": 61,
    "slug": "61-anti-fraud-controls",
    "title": "Anti-Fraud Controls",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "The original RateQuip blueprint already explicitly requires referral attribution controls, prevention of duplicate/self-referrals and auditable marketplace administration.",
    "layer": "live",
    "note": "Admin moderation of claims and reviews"
  },
  {
    "number": 62,
    "slug": "62-escalating-kyc",
    "title": "Escalating KYC",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "Do not ask someone handing out a flyer for the same documentation as someone receiving US$500,000 in project payments.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 63,
    "slug": "63-dispute-resolution",
    "title": "Dispute Resolution",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "RateQuip should provide structured dispute workflows without pretending to replace courts, arbitration or legal professionals.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 64,
    "slug": "64-commercial-attribution-graph",
    "title": "Commercial Attribution Graph",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "Person <-> Skill <-> Location <-> Referral <-> Campaign <-> Company <-> Opportunity <-> Work <-> Evidence <-> Transaction <-> Reward <-> Reputation <-> Team",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 65,
    "slug": "65-contribution-based-rewards",
    "title": "Contribution-Based Rewards",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "RateQuip can recognise multiple legitimate contributors without paying endless downstream recruitment chains.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 66,
    "slug": "66-company-campaign-marketplace",
    "title": "Company Campaign Marketplace",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "The primary actor is a participant seeking access or reward; the relevant counterparty is customers, reviewers and marketplace operations. The system of record is an assurance, eligibility or reward decision, and the outcome must be supported by identity, credentials, provenance,",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 67,
    "slug": "67-sponsored-human-distribution",
    "title": "Sponsored Human Distribution",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "Rather than spend the entire budget with search/social platforms, a company can allocate:",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 68,
    "slug": "68-ratequip-academy",
    "title": "RateQuip Academy",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "The primary actor is a participant seeking access or reward; the relevant counterparty is customers, reviewers and marketplace operations. The system of record is an assurance, eligibility or reward decision, and the outcome must be supported by identity, credentials, provenance,",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 69,
    "slug": "69-opportunity-eligibility",
    "title": "Opportunity Eligibility",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "RateQuip must never gamify people into performing work outside their competence.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 70,
    "slug": "70-insurance-marketplace",
    "title": "Insurance Marketplace",
    "group": "Trust, Fraud Controls, Rewards, Academy And Eligibility",
    "summary": "RateQuip can connect users to appropriate insurance providers while remaining within appropriate regulatory boundaries.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 71,
    "slug": "71-cross-border-tax-and-legal-layer",
    "title": "Cross-Border Tax and Legal Layer",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "Crypto does not remove legal, tax or contracting obligations.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 72,
    "slug": "72-regulatory-payment-architecture",
    "title": "Regulatory Payment Architecture",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "For Australia specifically, the 2026 AUSTRAC regime now covers a broader range of virtual-asset services. Businesses conducting activities such as exchange, custody or transferring virtual assets on behalf of customers may be within VASP registration and AML/CTF requirements.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 73,
    "slug": "73-ratequip-internal-ledger",
    "title": "RateQuip Internal Ledger",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "The primary actor is a multinational project participant; the relevant counterparty is project members, regulated providers and professional advisers. The system of record is a compliant cross-border collaboration and settlement configuration, and the outcome must be supported by",
    "layer": "v12",
    "note": "Credit, commission and enterprise ledgers"
  },
  {
    "number": 74,
    "slug": "74-wallet-security",
    "title": "Wallet Security",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "For users who elect embedded digital-asset wallets, the platform should favour architectures where custody and transaction authority are explicitly defined.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 75,
    "slug": "75-payment-choice-at-onboarding",
    "title": "Payment Choice at Onboarding",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "The primary actor is a multinational project participant; the relevant counterparty is project members, regulated providers and professional advisers. The system of record is a compliant cross-border collaboration and settlement configuration, and the outcome must be supported by",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 76,
    "slug": "76-global-language-layer",
    "title": "Global Language Layer",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "The primary actor is a multinational project participant; the relevant counterparty is project members, regulated providers and professional advisers. The system of record is a compliant cross-border collaboration and settlement configuration, and the outcome must be supported by",
    "layer": "live",
    "note": "English / Thai / Chinese UI"
  },
  {
    "number": 77,
    "slug": "77-time-zone-coordination",
    "title": "Time-Zone Coordination",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "The primary actor is a multinational project participant; the relevant counterparty is project members, regulated providers and professional advisers. The system of record is a compliant cross-border collaboration and settlement configuration, and the outcome must be supported by",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 78,
    "slug": "78-ai-meeting-translator-and-recorder",
    "title": "AI Meeting Translator and Recorder",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "The primary actor is a multinational project participant; the relevant counterparty is project members, regulated providers and professional advisers. The system of record is a compliant cross-border collaboration and settlement configuration, and the outcome must be supported by",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 79,
    "slug": "79-confidentiality-compartments",
    "title": "Confidentiality Compartments",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "The primary actor is a multinational project participant; the relevant counterparty is project members, regulated providers and professional advisers. The system of record is a compliant cross-border collaboration and settlement configuration, and the outcome must be supported by",
    "layer": "v12",
    "note": "Document vault thin slice"
  },
  {
    "number": 80,
    "slug": "80-team-intellectual-property-rules",
    "title": "Team Intellectual Property Rules",
    "group": "Cross-Border Compliance, Payments, Language And Confidential Collaboration",
    "summary": "The primary actor is a multinational project participant; the relevant counterparty is project members, regulated providers and professional advisers. The system of record is a compliant cross-border collaboration and settlement configuration, and the outcome must be supported by",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 81,
    "slug": "81-ratequip-global-industrial-gig-marketplace",
    "title": "RateQuip Global Industrial Gig Marketplace",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "RateQuip eventually competes across several categories simultaneously:",
    "layer": "v12",
    "note": "V12 matching engine"
  },
  {
    "number": 82,
    "slug": "82-search-example",
    "title": "Search Example",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "I need someone in Ningbo who speaks English and Mandarin, has food-machine experience and can visit a pouch-machine manufacturer twice per month for the next four months.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 83,
    "slug": "83-virtual-company-example",
    "title": "Virtual Company Example",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "RateQuip has helped create an international industrial business from people who might never otherwise have met.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 84,
    "slug": "84-business-matching-ai",
    "title": "Business Matching AI",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "Ana is an excellent automation engineer but has declined three projects requiring onsite Australian service.",
    "layer": "v12",
    "note": "V12 matching + recommendations"
  },
  {
    "number": 85,
    "slug": "85-skills-exchange",
    "title": "Skills Exchange",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "However, barter should remain properly recorded where it has accounting or taxation implications.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 86,
    "slug": "86-ratequip-project-bounties",
    "title": "RateQuip Project Bounties",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "Find me three verified manufacturers meeting these specifications.",
    "layer": "v12",
    "note": "Catalogue factory opportunity match schema"
  },
  {
    "number": 87,
    "slug": "87-urgent-opportunity-mode",
    "title": "Urgent Opportunity Mode",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "The primary actor is a buyer with a specific industrial problem; the relevant counterparty is qualified professionals, scouts or specialist teams. The system of record is a precisely matched task, bounty or asset-linked intervention, and the outcome must be supported by asset ide",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 88,
    "slug": "88-asset-to-professional-matching",
    "title": "Asset-to-Professional Matching",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "This links the Opportunity Economy directly with the RateQuip asset lifecycle.",
    "layer": "v12",
    "note": "Assets + matching thin slices"
  },
  {
    "number": 89,
    "slug": "89-global-spare-parts-scouts",
    "title": "Global Spare-Parts Scouts",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "Again the network solves something ordinary search may struggle to solve.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 90,
    "slug": "90-industrial-knowledge-missions",
    "title": "Industrial Knowledge Missions",
    "group": "Industrial Gig Search, Ai Matching, Bounties And Asset Intelligence",
    "summary": "The primary actor is a buyer with a specific industrial problem; the relevant counterparty is qualified professionals, scouts or specialist teams. The system of record is a precisely matched task, bounty or asset-linked intervention, and the outcome must be supported by asset ide",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 91,
    "slug": "91-company-claim-economy",
    "title": "Company Claim Economy",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "additional attributable reward can apply according to published rules.",
    "layer": "live",
    "note": "Company claim with evidence and admin approve"
  },
  {
    "number": 92,
    "slug": "92-referral-without-spam",
    "title": "Referral Without Spam",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "The primary actor is a contributor, business representative or campaign sponsor; the relevant counterparty is a legitimate company or buyer. The system of record is a verified company relationship and attributable growth outcome, and the outcome must be supported by invitation ch",
    "layer": "live",
    "note": "Invites, join codes, referral share"
  },
  {
    "number": 93,
    "slug": "93-gamified-geographic-expansion",
    "title": "Gamified Geographic Expansion",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "RateQuip can grow country by country without conventional offices everywhere.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 94,
    "slug": "94-regional-ambassadors",
    "title": "Regional Ambassadors",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "Status does not automatically imply employment or legal agency.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 95,
    "slug": "95-ratequip-sales-academy",
    "title": "RateQuip Sales Academy",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "The primary actor is a contributor, business representative or campaign sponsor; the relevant counterparty is a legitimate company or buyer. The system of record is a verified company relationship and attributable growth outcome, and the outcome must be supported by invitation ch",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 96,
    "slug": "96-social-media-content-generator",
    "title": "Social Media Content Generator",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "Approved RateQuip promoters select campaigns and share them through compliant channels.",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 97,
    "slug": "97-qr-everywhere",
    "title": "QR Everywhere",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "The primary actor is a contributor, business representative or campaign sponsor; the relevant counterparty is a legitimate company or buyer. The system of record is a verified company relationship and attributable growth outcome, and the outcome must be supported by invitation ch",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 98,
    "slug": "98-exhibition-economy",
    "title": "Exhibition Economy",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "The primary actor is a contributor, business representative or campaign sponsor; the relevant counterparty is a legitimate company or buyer. The system of record is a verified company relationship and attributable growth outcome, and the outcome must be supported by invitation ch",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 99,
    "slug": "99-marketing-attribution",
    "title": "Marketing Attribution",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "The primary actor is a contributor, business representative or campaign sponsor; the relevant counterparty is a legitimate company or buyer. The system of record is a verified company relationship and attributable growth outcome, and the outcome must be supported by invitation ch",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 100,
    "slug": "100-ratequip-economic-flywheel",
    "title": "RateQuip Economic Flywheel",
    "group": "Company Claiming, Referrals, Geographic Growth And Measurable Promotion",
    "summary": "Person earns money, crypto settlement option, credits and reputation",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 101,
    "slug": "101-ratequip-s-new-core-navigation",
    "title": "RateQuip's New Core Navigation",
    "group": "Navigation, Positioning, Strategic Moat And Enterprise Objective",
    "summary": "The primary actor is a user, product team or investor; the relevant counterparty is the complete RateQuip ecosystem. The system of record is a coherent operating model and understandable product experience, and the outcome must be supported by task completion, graph quality, succ",
    "layer": "live",
    "note": "Live nav: search, suppliers, RFQ, collaborate, pricing"
  },
  {
    "number": 102,
    "slug": "102-expanded-ratequip-positioning",
    "title": "Expanded RateQuip Positioning",
    "group": "Navigation, Positioning, Strategic Moat And Enterprise Objective",
    "summary": "RateQuip is an AI-powered global industrial economic network that connects products, suppliers, buyers, professionals, projects and opportunities. Companies can source and sell. Individuals can work, represent, promote, inspect, refer and earn. Distributed teams can form multinat",
    "layer": "live",
    "note": "Phase 2 industrial marketplace + procurement positioning"
  },
  {
    "number": 103,
    "slug": "103-what-makes-this-significantly-more-powerful",
    "title": "What Makes This Significantly More Powerful",
    "group": "Navigation, Positioning, Strategic Moat And Enterprise Objective",
    "summary": "How do we assemble everything required to make the project happen?",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  },
  {
    "number": 104,
    "slug": "104-the-long-term-strategic-moat",
    "title": "The Long-Term Strategic Moat",
    "group": "Navigation, Positioning, Strategic Moat And Enterprise Objective",
    "summary": "RateQuip's greatest asset should ultimately be its interconnected knowledge and economic graph.",
    "layer": "v12",
    "note": "V12 taxonomy and knowledge graph seeds"
  },
  {
    "number": 105,
    "slug": "105-final-enterprise-objective",
    "title": "Final Enterprise Objective",
    "group": "Navigation, Positioning, Strategic Moat And Enterprise Objective",
    "summary": "The final RateQuip repository should therefore no longer describe a platform whose endpoint is:",
    "layer": "later",
    "note": "Specified in the Super Repository blueprint; not in the Phase 2 MVP"
  }
];

export function capabilityBySlug(slug: string) {
  return blueprintCapabilities.find((c) => c.slug === slug) ?? null;
}

export function capabilitiesByGroup() {
  const groups: { group: string; items: BlueprintCapability[] }[] = [];
  for (const cap of blueprintCapabilities) {
    const last = groups[groups.length - 1];
    if (!last || last.group !== cap.group) groups.push({ group: cap.group, items: [cap] });
    else last.items.push(cap);
  }
  return groups;
}

export function capabilityCounts() {
  return {
    total: blueprintCapabilities.length,
    live: blueprintCapabilities.filter((c) => c.layer === "live").length,
    v12: blueprintCapabilities.filter((c) => c.layer === "v12").length,
    later: blueprintCapabilities.filter((c) => c.layer === "later").length,
  };
}
