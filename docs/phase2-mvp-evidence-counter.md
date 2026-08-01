# Phase 2 MVP Evidence Counter

**Invoice:** 2026-010 · Phase 2 Milestone 1 (MVP Core) · THB 20,000  
**Audit reference:** RateQuip Developer Discussion Notes V4 — Phase 2 Payment Audit (30 July 2026)  
**Counter generated from:** `npm run smoke:phase2:acceptance`

## Decision counter (post-remediation)

| # | Milestone area | Audit (30 Jul) | After remediation | Automated checks |
|---|----------------|----------------|-------------------|------------------|
| 1 | Database architecture | NOT DEMONSTRATED | READY | DB-01 |
| 2 | Accounts / authentication | PARTIAL / FAIL | READY* | AUTH-01, AUTH-02 |
| 3 | Company profiles and administration | FAIL | READY | CO-01, CO-02 |
| 4 | Reviews and evidence | NOT DEMONSTRATED | READY | REV-01…04 |
| 5 | Basic RFQ marketplace | FAIL | READY | RFQ-01…06 |
| 6 | Billing / credit framework | NOT DEMONSTRATED | READY | BILL-01…04 |

**Score: 6 / 6 areas ready · 19 / 19 automated checks passed**  
**Neon-backed re-run (2026-08-01):** `DATABASE_URL` via `.env.local` · real UUID RFQ/review/quote rows · BILL-02/04 balanced after ledger repair + period-keyed subscription grants.

\*Clerk-hosted verification, password reset and MFA remain platform-provided (Clerk Dashboard / hosted UI). App evidence covers session gating, role resolution, and mutation protection.

## P0 blockers closed

| Audit P0 | Fix | Evidence |
|----------|-----|----------|
| Add Company “Submission not found” | `ensureSubmission` upsert recovers drafts across serverless cold starts | CO-01 · Contacts step Continues / Save unclaimed draft |
| Signed-out Close RFQ / Mark awarded | UI gated by `canManage`; `closeOrAwardRequest` requires signed-in/demo session | AUTH-02 · `/requests/[id]` |
| Nonsensical RFQ budgets/titles | Shared `validateRfqContent` + API Zod refine | RFQ-02 |
| Buyer dashboard count without list | “Your RFQs” linked list on buyer dashboard | RFQ-04 · `/dashboard/buyer` |
| No Edit / Revise RFQ | `/requests/[id]/edit` + `updateRequestFields` | RFQ-03 |
| Reviews only a Write-review link | Submit + evidence + moderate + supplier response + appeal | REV-01…04 |
| Billing is price sheet only | Debit, subscription grant, refund, reconcile APIs + billing UI | BILL-01…04 |

## How to reproduce the counter

```bash
npm run smoke:phase2:acceptance
npm run smoke:phase2
```

## Next step

Automated checks prove the backend/workflows. Phase 2 is ready for another client audit against the updated build and this evidence pack.

## Key code references

- Organic Growth durability: `src/lib/organic-growth/store.ts`, `src/lib/actions/organic-growth.ts`
- RFQ auth/validation/revise: `src/lib/actions/marketplace.ts`, `src/lib/rfq/validation.ts`, `src/app/requests/[id]/edit/page.tsx`
- Buyer RFQ list: `src/app/dashboard/buyer/page.tsx`
- Review respond/appeal: `persistReviewResponse` / `persistReviewAppeal` in `src/lib/db/phase2.ts`
- Billing refund/reconcile: `src/lib/billing/operations.ts`, `/api/v1/billing/refund`, `/api/v1/billing/reconcile`
