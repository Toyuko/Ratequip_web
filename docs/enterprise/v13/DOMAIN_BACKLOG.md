# Domains 14–69 Overlay Backlog

Enterprise domains beyond the Phase 2 MVP and Wave 1–3 thin slices. Each item ships as a **flagged vertical slice** using [VERTICAL_SLICE_TEMPLATE.md](./VERTICAL_SLICE_TEMPLATE.md).

## Priority bands

### Band A — deepen existing commercial core (near-term)

| Domain | Notes | Flag suggestion |
|--------|-------|-----------------|
| 14 Procurement | Align approval workflow with Phase 2 RFQ without replacing it | `ENTERPRISE_PROCUREMENT_OVERLAY` |
| 16 SRM | Scorecards → supplier dashboards | `ENTERPRISE_SRM` |
| 17 CRM | Opportunity stages → supplier CRM | `ENTERPRISE_CRM` |
| 18–20 Assets / passport | Award → asset already stubbed | `ENTERPRISE_ASSETS` |
| 37 Workflow engine | Extend Part 3 workflow runtime | `ENTERPRISE_WORKFLOW` |
| 38 Document vault | Extend vault + evidence | `ENTERPRISE_VAULT` |

### Band B — marketplaces (spec only today)

| Domain | Flag suggestion |
|--------|-----------------|
| 23 Manufacturer Platform | `ENTERPRISE_MFR` |
| 24 Distributor Platform | `ENTERPRISE_DIST` |
| 25 Contractor Platform | `ENTERPRISE_CONTRACTOR_MP` |
| 26 Service Provider | `ENTERPRISE_SERVICE_MP` |
| 27 Consultant | `ENTERPRISE_CONSULTANT` |
| 28 Recruitment | `ENTERPRISE_RECRUIT` |
| 29 Finance | `ENTERPRISE_FINANCE` |
| 30 Insurance | `ENTERPRISE_INSURANCE` |
| 31 Freight | `ENTERPRISE_FREIGHT` |
| 32 Warehousing | `ENTERPRISE_WAREHOUSE` |
| 33 Advertising | `ENTERPRISE_ADS` |
| 34 Community | `ENTERPRISE_COMMUNITY` |
| 35 Academy | `ENTERPRISE_ACADEMY` |
| 36 Events | `ENTERPRISE_EVENTS` |

### Band C — integrations / OT (gated)

Require safety/segmentation review before enablement:

| Domain | Flag suggestion |
|--------|-----------------|
| 43 ERP | `ENTERPRISE_ERP` |
| 44 CMMS | `ENTERPRISE_CMMS` |
| 45 SCADA | `ENTERPRISE_SCADA` |
| 46 PLC | `ENTERPRISE_PLC` |
| 47 IoT Gateway | `ENTERPRISE_IOT` |

### Band D — platform / ops

| Domain | Notes |
|--------|-------|
| 48–55 API Gateway / Events / DB / SDKs | Prefer extending Next.js + Neon; no microservice rewrite |
| 56–63 Infra / CI / Security / i18n | Use Module 69 checklists; do not equate `release_gate.py` with production ready |
| 66–69 Entitlements / ecosystem / catalogue / readiness | Partial — continue Waves 2–3 |

## Rule

No Band B/C domain may alter Phase 2 routes. Ship under `/v12/*` or `/v13/*` only.
