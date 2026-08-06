# V13 Domain Inventory → Live App

| Archive domain | Live status | Primary paths |
|----------------|-------------|---------------|
| 02 Platform Core | Thin slice | `/v12`, auth guards |
| 03 Authentication | Phase 2 + V12 | Clerk |
| 04 Identity & Accounts | Phase 2 + V12 | orgs, wallets |
| 05 Universal Industrial Taxonomy | Thin slice | `/v12/taxonomy`, `src/data/v12/taxonomy_*` |
| 06 Industrial Knowledge Graph | Schema + Part 7/Wave 2 | `graph_assertions`, `src/lib/v13/part7/graph.ts` |
| 07 Dynamic Question Engine | Thin slice | `src/lib/v12/dqe/*` |
| 08 Universal Capability Graph | Schema + Wave 2 | capabilities.json + match features |
| 09 Opportunity Builder | Thin slice deepened | `/v12/opportunity-builder` |
| 10 Contractor Builder | Thin slice deepened | `/v12/contractor-builder` |
| 11–13 Matching / Recs / AI | Thin slice | `/v12/matching`, intelligence |
| 14 Procurement | Thin slice + Phase 2 RFQ | `/v12/procurement`, Phase 2 RFQ |
| 15 RFQ Platform | Phase 2 SoR | RFQ routes |
| 16 SRM | Thin slice | `/v12/srm` |
| 17 CRM | Thin slice | `/v12/crm` |
| 18–22 Assets / lifecycle / passport / twin | Thin slice | `/v12/assets` |
| 23–34 Marketplaces | Spec backlog | see DOMAIN_BACKLOG.md |
| 35–47 Integrations / OT | Spec backlog (gated) | DOMAIN_BACKLOG.md |
| 48–65 Platform plumbing | Partial | migrations, SDKs stubs |
| 66 Pilot / entitlements | Thin slice | Part 4 release control |
| 67 Project ecosystem | Schema + thin | Part 5 migrations |
| 68 AI Catalogue Product Factory | Thin slice + Wave 3 | `/v12/catalogue-factory` |
| 69 Enterprise readiness | Docs / CI | this folder + workflows |
| Part 7 Business DNA | Wave 1 | `src/lib/v13/part7`, activation UI |
