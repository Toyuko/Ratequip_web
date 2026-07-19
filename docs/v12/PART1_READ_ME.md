# RateQuip Enterprise Master Repository V12 — Part 1

**Status:** Authoritative production engineering baseline — Part 1  
**Generated:** 2026-07-19T11:01:04.634620+00:00  
**Supersedes for implementation:** V11 architectural baseline while preserving it immutably under `00_Preserved_V11_Baseline/`.

## Part 1 scope

Part 1 establishes the V12 repository contract and implementation foundations for Domains 01–13 plus cross-cutting database, migrations, seed data, RBAC, UI, events, CI/CD, security, localisation, testing, validation and developer implementation guidance.

The V11 repository remains included in full for provenance and regression protection. V12 artifacts are authoritative where a conflict exists. No V11 feature is intentionally removed.

## Source-of-truth order

1. V12 ADRs, contracts, schema and policies.
2. V12 domain specifications.
3. V12 acceptance tests and validation gates.
4. Preserved V11 repository for historical requirements and traceability.

## Non-negotiable product outcomes

- No generic first dashboard.
- No cross-company or cross-role leakage.
- No unannounced charges or hidden usage consumption.
- Every recommendation and invitation has stored reasons.
- AI-derived claims remain drafts until confirmed by an authorised user.
- Every critical commercial, security and administrative mutation is auditable.
- Mobile and accessibility requirements apply to all critical workflows.
- Account activation is atomic, idempotent and recoverable.

## Continue generation

Part 2 must continue from `00_V12_GENERATION_LEDGER.json`, preserve checksums, and add Domains 14–36 without rewriting completed Part 1 assets unless a recorded ADR supersedes them.
