# RateQuip Enterprise Master Repository V12 - Part 2

**Version:** 12.0.0-part2  
**Generated:** 2026-07-19T11:41:29+00:00  
**Status:** Cumulative authoritative production-engineering baseline.

Part 2 includes the complete Part 1 repository and immutable V11/Part 1 source archives, then adds Domains 14-36: procurement, RFQ, SRM, CRM, assets, lifecycle, digital passport, digital twin, predictive maintenance, manufacturer/distributor/contractor/service/consultant platforms, recruitment, finance, insurance, freight, warehousing, advertising, community, academy and events.

## Application order
1. Treat `00_Preserved_Baselines/V11_COMPLETE_AUTHORITATIVE.zip` as historical source.
2. Part 1 migrations 0001-0005 and contracts remain authoritative.
3. Apply Part 2 migrations 0006-0013 in numeric order.
4. Generate clients from Part 1 and Part 2 OpenAPI contracts or the provided combined index.
5. Enforce RBAC and PostgreSQL RLS; interface visibility is not an authorisation boundary.
6. Run `64_Validation_Reports/validate_part2.py` and staging migration/rollback tests before deployment.

## Part 3 boundary
Part 3 continues Domains 37-48 and 55-60: workflow/BPM, document vault, compliance, ESG, analytics, marketplace APIs, ERP/CMMS/SCADA/PLC/IoT integrations, API gateway expansion, SDKs, infrastructure, deployment and operations. Part 2 stable IDs and contracts must not be renumbered.
