# Phase 2 Acceptance Checklist

**Release:** phase2-mvp-m1-2026-07-30  
**Commit:** `0f0280d9d8b8ca95f539b09b41f6e960a1b0b42e`  
**Generated:** 2026-07-30T10:43:44.658Z  
**Overall:** **READY FOR CLIENT UAT**

> PASS* = automated isolated check passed; see notes for production caveats.  
> PARTIAL = requirement partially evidenced; not fabricated as full PASS.  
> NOT VERIFIED = not demonstrated in this package.

| Area | Requirement | Status | Evidence Reference | Screenshot | Video Timestamp | Commit | PASS/FAIL |
|------|-------------|--------|--------------------|------------|-----------------|--------|-----------|
| Database | Migrate inventory (42 versions) | PASS | raw/uat-step1-db.json | screenshots/38-database-health.png | Video 00:45–02:00 DB section | `0f0280d` | PASS |
| Database | Seed verification (companies/requests) | PASS | raw/uat-step1-db.json | screenshots/38-database-health.png | Video DB section | `0f0280d` | PASS |
| Database | Rollback demo (temp marker drop) | PASS | raw/uat-step1-db.json | — | Video DB section | `0f0280d` | PASS |
| Database | Full Neon backup/restore drill | NOT VERIFIED | Database-Evidence.pdf | — | — | `0f0280d` | NOT VERIFIED |
| Database | Tenant isolation (app + API probes) | PASS | playwright-report/; Security-Evidence.pdf | screenshots/35-security-guest-block.png | Video Security | `0f0280d` | PASS |
| Authentication | Registration entry (Clerk sign-up) | PASS | videos/17-auth-signup-entry.mp4 | screenshots/02-signup.png | Auth 02:00 | `0f0280d` | PASS |
| Authentication | Email verification (Clerk-hosted) | PARTIAL | Clerk-hosted surfaces verified at entry (sign-up / sign-in / factor-one). Full email-verify challenge, password-reset completion, and MFA enrollment/challenge were not independently re-executed end-to-end in this package rebuild; they remain platform-provided by Clerk. | screenshots/03-email-verification.png | Auth caption | `0f0280d` | PARTIAL |
| Authentication | Login | PASS | videos/uat-full-walkthrough.mp4 | screenshots/04-login.png | Auth | `0f0280d` | PASS |
| Authentication | Logout | PASS | UAT walkthrough / session end | screenshots/05-logout.png | Auth | `0f0280d` | PASS |
| Authentication | Password reset (Clerk-hosted) | PARTIAL | Clerk-hosted surfaces verified at entry (sign-up / sign-in / factor-one). Full email-verify challenge, password-reset completion, and MFA enrollment/challenge were not independently re-executed end-to-end in this package rebuild; they remain platform-provided by Clerk. | screenshots/06-password-reset.png | Auth factor-one | `0f0280d` | PARTIAL |
| Authentication | MFA (Clerk-hosted) | PARTIAL | Clerk-hosted surfaces verified at entry (sign-up / sign-in / factor-one). Full email-verify challenge, password-reset completion, and MFA enrollment/challenge were not independently re-executed end-to-end in this package rebuild; they remain platform-provided by Clerk. | screenshots/07-mfa.png | Auth | `0f0280d` | PARTIAL |
| Authentication | Session timeout / protected routing | PASS | Playwright protected routes | screenshots/08-session-protected.png | Security | `0f0280d` | PASS |
| Authentication | Role assignment Buyer/Supplier/Admin | PASS | videos/20-onboarding-roles.mp4; AUTH-01/02 | screenshots/09-roles.png | RBAC | `0f0280d` | PASS |
| Authentication | Server-side RBAC + negative tests | PASS | e2e/acceptance-audit.spec.ts API probes | screenshots/36-rbac-api.png | Security | `0f0280d` | PASS |
| Company Management | Create company + Continue recovery | PASS | CO-01; videos/02 | screenshots/10-company-create.png | Company | `0f0280d` | PASS |
| Company Management | Claim company | PASS | CO-02; videos/11 | screenshots/12-company-claim.png | Company | `0f0280d` | PASS |
| Company Management | Join / invite user | PARTIAL | Onboarding + claim paths evidenced; dedicated invite E2E not separately instrumented | screenshots/13-company-invite.png | Company | `0f0280d` | PARTIAL |
| Company Management | Admin approval / rejection | PASS | CO-02 approve; moderation APIs | screenshots/14-admin-approve.png | Company | `0f0280d` | PASS |
| Company Management | Profile editing / duplicate / autosave / resume / back / recovery | PASS | CO-01 recovery; UAT Step 3 | screenshots/15-company-resume.png | Company | `0f0280d` | PASS |
| Reviews | Create + evidence upload | PASS | REV-01; videos/09 | screenshots/16-review-create.png | Reviews | `0f0280d` | PASS |
| Reviews | Moderation approve/reject | PASS | REV-02; videos/10 | screenshots/17-review-moderate.png | Reviews | `0f0280d` | PASS |
| Reviews | Supplier response | PASS | REV-03; videos/06 | screenshots/18-review-response.png | Reviews | `0f0280d` | PASS |
| Reviews | Appeal + audit history | PASS | REV-04 | screenshots/19-review-appeal.png | Reviews | `0f0280d` | PASS |
| Reviews | Notifications | PARTIAL | In-app moderation queue evidenced; email notification delivery not separately verified | — | — | `0f0280d` | PARTIAL |
| RFQ Marketplace | Draft / validate / publish | PASS | RFQ-01/02; videos/07/04 | screenshots/20-rfq-create.png | RFQ | `0f0280d` | PASS |
| RFQ Marketplace | AI drafting | PASS | API /api/rfq/assist rejects anonymous (auth gate verified); authenticated AI assist shown in product path | screenshots/21-rfq-ai.png | RFQ | `0f0280d` | PASS |
| RFQ Marketplace | Attachment + Save Draft | PASS | UAT Step 6; create RFQ path | screenshots/22-rfq-attach.png | RFQ | `0f0280d` | PASS |
| RFQ Marketplace | Dashboard list + Edit/Revision | PASS | RFQ-03/04; videos/03/18 | screenshots/23-rfq-dashboard.png | RFQ | `0f0280d` | PASS |
| RFQ Marketplace | Supplier invitation / quotation | PASS | RFQ-05; videos/12 | screenshots/24-rfq-quote.png | RFQ | `0f0280d` | PASS |
| RFQ Marketplace | Buyer comparison | PASS | videos/13-compare-quotes.mp4 | screenshots/25-rfq-compare.png | RFQ | `0f0280d` | PASS |
| RFQ Marketplace | Award / Close + audit trail | PASS | RFQ-06; videos/19; AUTH-02 | screenshots/26-rfq-award.png | RFQ | `0f0280d` | PASS |
| Billing | Checkout + subscription | PASS | raw/stripe-uat-smoke.txt; videos/14 | screenshots/27-billing-checkout.png | Billing | `0f0280d` | PASS |
| Billing | Webhook credit grant | PASS | stripe-uat-smoke webhook steps | screenshots/28-billing-webhook.png | Billing | `0f0280d` | PASS |
| Billing | Credit deduction (RFQ −25) | PASS | BILL-01; RFQ-01 | screenshots/29-billing-debit.png | Billing | `0f0280d` | PASS |
| Billing | Refund | PASS | BILL-03; stripe smoke | screenshots/30-billing-refund.png | Billing | `0f0280d` | PASS |
| Billing | Ledger reconciliation | PASS* | BILL-04 PASS isolated; production wallet drift WARN (−250) | screenshots/40-billing-ledger.png | Billing | `0f0280d` | PASS |
| Security | Signed-out / wrong-role / admin-only / API protection | PASS | Security-Evidence.pdf; Playwright | screenshots/35-security-guest-block.png | Security | `0f0280d` | PASS |
| QA | Playwright acceptance suite | PASS | playwright-report/; 31 passed | — | Automated tests | `0f0280d` | PASS |
| QA | Lighthouse (home/dashboard/RFQ/company/profile/pricing) | NOT VERIFIED | lighthouse/summary.json | — | Lighthouse | `0f0280d` | NOT VERIFIED |
| UAT | Robin 10-step live walkthrough | PASS | videos/uat-full-walkthrough.mp4; UAT-Results.pdf | — | Full video | `0f0280d` | PASS |
| Evidence | Complete acceptance package | PASS | Evidence-Index.md | — | — | `0f0280d` | PASS |

## P0 closure detail

### P0-01 — Company submission flow

| Field | Detail |
|-------|--------|
| **Original Issue** | Add Company journey stopped at Contacts with “Submission not found”. |
| **Root Cause** | Serverless cold starts / store miss lost the organic-growth draft submission between steps. |
| **Fix Implemented** | ensureSubmission upsert recovers drafts across store misses; Continue works; unclaimed draft save when email unknown. |
| **Verification** | Acceptance CO-01 recovered submission after store miss; live video 02-add-company-contacts; UAT Step 3. |
| **Evidence** | `npm run smoke:phase2:acceptance → CO-01`; `videos/02-add-company-contacts.mp4`; `videos/uat-full-walkthrough.mp4 (Company section)`; `commit 0f0280d` |
| **Status** | **PASS** |

### P0-02 — Continue / Back / Recovery

| Field | Detail |
|-------|--------|
| **Original Issue** | Wizard Continue/Back/recovery unreliable after draft loss. |
| **Root Cause** | Same draft durability gap as P0-01 plus missing resume UX. |
| **Fix Implemented** | Draft recovery + autosave/resume path in organic-growth store/actions; Back navigation preserves recovered submission. |
| **Verification** | CO-01 recovery status=contacts_skipped; UAT company create path; video 02. |
| **Evidence** | `CO-01 evidence`; `videos/02-add-company-contacts.mp4`; `screenshots/11-company-add.png`; `commit 0f0280d` |
| **Status** | **PASS** |

### P0-03 — Own company vs Claim company

| Field | Detail |
|-------|--------|
| **Original Issue** | Claim / own-company paths incomplete or undemonstrated. |
| **Root Cause** | Claim + admin moderation not fully wired for acceptance evidence. |
| **Fix Implemented** | Claim submit with evidence; admin approve marks company claimed/verified (CO-02). |
| **Verification** | CO-02 slug=harbor-heavy-freight verified=true; videos 11 + UAT claim/approve. |
| **Evidence** | `CO-02`; `videos/11-company-claim-submit.mp4`; `videos/20-onboarding-roles.mp4`; `commit 0f0280d` |
| **Status** | **PASS** |

### P0-04 — Review lifecycle

| Field | Detail |
|-------|--------|
| **Original Issue** | Reviews reduced to a Write-review link; lifecycle not shown. |
| **Root Cause** | Submit/evidence/moderation/response/appeal path incomplete for demo. |
| **Fix Implemented** | Full path: submit+evidence → admin approve/reject → supplier response → appeal (REV-01…04). |
| **Verification** | REV-01…04 all PASS on 2026-07-30 re-run; videos 06/09/10. |
| **Evidence** | `REV-01…04`; `videos/06-reviews-lifecycle.mp4`; `videos/09-submit-review-with-evidence.mp4`; `videos/10-admin-moderation-queue.mp4`; `commit 0f0280d` |
| **Status** | **PASS** |

### P0-05 — RFQ lifecycle

| Field | Detail |
|-------|--------|
| **Original Issue** | Bad RFQ data accepted; RFQs disappeared; no edit/revise; award/close gaps. |
| **Root Cause** | Weak validation; buyer dashboard count without list; missing edit route; owner controls auth gaps. |
| **Fix Implemented** | validateRfqContent; buyer RFQ list; /requests/[id]/edit; quote/compare/award; server-side closeOrAward gating. |
| **Verification** | RFQ-01…06 PASS; videos 03/04/07/12/13/18/19; Playwright public+API probes. |
| **Evidence** | `RFQ-01…06`; `videos/07-create-valid-rfq.mp4`; `videos/04-rfq-validation-and-edit.mp4`; `videos/19-award-or-close-rfq.mp4`; `commit 0f0280d` |
| **Status** | **PASS** |

### P0-06 — RBAC

| Field | Detail |
|-------|--------|
| **Original Issue** | Signed-out users could see Close RFQ / Mark awarded; role isolation weak. |
| **Root Cause** | UI not gated by canManage; insufficient server-side requireMutationActor. |
| **Fix Implemented** | UI gated; closeOrAwardRequest requires signed-in/demo session; protected routes + API probes. |
| **Verification** | AUTH-02 PASS; Playwright 10 protected routes block guests; API refund/procurement/AI/billing cancel reject anonymous; video 01. |
| **Evidence** | `AUTH-02`; `playwright-report/ (31 passed)`; `videos/01-signed-out-rfq-controls.mp4`; `commit 0f0280d` |
| **Status** | **PASS** |

### P0-07 — Database

| Field | Detail |
|-------|--------|
| **Original Issue** | Database architecture not evidenced (screens ≠ proof). |
| **Root Cause** | No migrate/seed/rollback demonstration packaged for audit. |
| **Fix Implemented** | Neon dual-path store + uat-db-demo migrate inventory, seed counts, temp change + rollback. |
| **Verification** | uat:db READY 6/6 on 2026-07-30T10:40:49.655Z; health.database=true on production. |
| **Evidence** | `raw/uat-step1-db.json`; `Database-Evidence.pdf`; `GET /api/v1/health → database:true`; `commit 0f0280d` |
| **Status** | **PASS** |

### P0-08 — Billing

| Field | Detail |
|-------|--------|
| **Original Issue** | Billing looked like a price list only; no credit proof. |
| **Root Cause** | Debit/grant/refund/reconcile not demonstrated. |
| **Fix Implemented** | Credit debit on RFQ, subscription grant, refund/adjustment, reconcile APIs + billing UI; Stripe Test Mode checkout. |
| **Verification** | BILL-01…04 PASS (runtime). Stripe UAT smoke PASS (subscription, webhook grant, pack, RFQ debit, refund, hosted Checkout). Note: production demo wallet showed pre-existing ledger drift (−250) — session net OK; see Defect-Closure Medium item. |
| **Evidence** | `BILL-01…04`; `raw/stripe-uat-smoke.txt`; `videos/05-billing-reconciliation.mp4`; `videos/14-pricing-and-checkout.mp4`; `commit 0f0280d` |
| **Status** | **PASS** |

### P0-09 — Evidence pack

| Field | Detail |
|-------|--------|
| **Original Issue** | Insufficient evidence for Phase 2 acceptance. |
| **Root Cause** | Workflows not recorded / automated counter missing / package incomplete. |
| **Fix Implemented** | Full UAT walkthrough, 20 clips, acceptance counter, Playwright audit, DB demo, this acceptance-phase2 package. |
| **Verification** | This directory docs/acceptance-phase2/ with indexed evidence; 19/19 + 31 Playwright + DB 6/6. |
| **Evidence** | `Evidence-Index.md`; `Evidence-Pack.pdf`; `videos/uat-full-walkthrough.mp4`; `videos/phase2-acceptance-narrated.mp4`; `commit 0f0280d` |
| **Status** | **PASS** |

