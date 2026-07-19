# READ ME FIRST

**Repository:** RateQuip Enterprise Master Repository V12.2 - Add-On 02 / Part 5  
**Generated:** 2026-07-19T17:29:38+00:00  
**Status:** Delta-only, install after V12 Part 3 and V12.1 Add-On 01 / Part 4

## Purpose
This delta repository implements the Intelligent URS/RFQ Project Ecosystem, Business Operating Profile, global supplier/workforce/expert/laboratory/logistics/capacity marketplaces, and multi-supplier project orchestration capabilities.

## Baseline and identifier allocation
The inspected authoritative V12 Part 3 ledger ends at Feature 140 and migration 0023. This add-on allocates Features **141-165**, migrations **0024-0029**, domains **66-80**, and new namespaced operation IDs, event types, permissions and screen IDs. Existing stable identifiers are not redefined.

## Installation order
1. V11 authoritative baseline.
2. V12 Part 1.
3. V12 Part 2.
4. V12 Part 3.
5. V12.1 Add-On 01 / Part 4, where present.
6. This V12.2 Add-On 02 / Part 5.

## Core safety rule
The platform separates extracted fact, buyer-confirmed data, supplier-confirmed data, calculated result, industry pattern, model inference and unverified recommendation. It never publishes, invites, awards, spends credits, releases funds or discloses confidential clauses without authorised human confirmation.

## Repository structure
- `01_Architecture`: architecture, ADRs and compatibility.
- `02_Feature_Ledger`: Features 141-165 and traceability.
- `03_Domain_Specifications`: implementation specifications for domains 66-80.
- `04_Database`: PostgreSQL migrations, RLS and rollback.
- `05_API`: OpenAPI 3.1 and JSON Schemas.
- `06_Events`: event catalogue and schemas.
- `07_RBAC`: permissions and role matrices.
- `08_UI`: screen registry and screen contracts.
- `09_AI`: prompts, policies, evaluation and adjacency rules.
- `10_Reference_Implementation`: TypeScript implementation and tests.
- `11_Test_Fixtures`: controlled source fixtures and anonymised benchmark expectations.
- `12_Installation`: installation, upgrade, rollback and validation.
- `13_Reports`: DOCX/PDF master report and validation evidence.
