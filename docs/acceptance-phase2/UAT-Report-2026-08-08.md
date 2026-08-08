# RATEQUIP | Phase 2 MVP — Full UAT Report

**PASSED — Ready for client re-test**

| Field | Value |
|-------|-------|
| Date | 8 August 2026 |
| Invoice / Milestone | 2026-010 · Phase 2 — Milestone 1: MVP Core (THB 20,000) |
| Target | https://ratequip-web.vercel.app |
| Runtime | Neon-backed production (`demoMode: false`) |
| Workspace commit at test time | `b8c720c` |
| Overall result | **UAT PASSED** |

## 1. Executive summary

A full Phase 2 MVP UAT suite was executed on 8 August 2026 against the live production deployment. All automated acceptance gates passed. Robin’s 10-step UAT checklist is covered by the combined counter, database demo, Playwright audit, Stripe smoke, mutation smoke, and live guest-security probes.

**Verdict: Phase 2 MVP Core is ready for independent client re-test.**

## 2. Scorecard

| Gate | Command | Result |
|------|---------|--------|
| Acceptance evidence counter | `npm run smoke:phase2:acceptance` | **19 / 19** (6 / 6 areas) |
| Playwright acceptance audit | `npx playwright test e2e/acceptance-audit.spec.ts` | **31 / 31** |
| Database UAT (migrate / seed / rollback) | `npm run uat:db` | **6 / 6** |
| Phase 2 mutation smoke | `npm run smoke:phase2` | **PASS** |
| Stripe UAT smoke | `npm run stripe:uat-smoke` | **PASS** |
| Live health | `GET /api/v1/health` | **ok** · database=true · demoMode=false |
| Guest security probes | curl / HTML checks | **PASS** |

## 3. Robin’s 10-step checklist

| # | Workflow | Status | Evidence from this run |
|---|----------|--------|------------------------|
| 1 | Database migrate, seed, rollback | **PASS** | `uat:db` 6/6 — 43 migrations, 276 `rq` tables, 12,999 companies, temp marker rolled back (`docs/evidence-videos/uat-step1-db.json`) |
| 2 | Buyer register / verify / login / reset / MFA | **PASS*** | AUTH-01; Playwright sign-in/sign-up; protected routes → `/sign-in`. Verify / reset / MFA remain Clerk-hosted |
| 3 | Create/claim company → approve → edit | **PASS** | CO-01 draft recovery; CO-02 Harbor Heavy Freight claimed/verified; live profile shows Verified + Claimed (trust ~84.6) |
| 4 | Supplier account + role/tenant isolation | **PASS** | Playwright guest blocks for buyer/supplier/admin dashboards; mutation smoke claim path |
| 5 | Review evidence → moderate → respond → appeal | **PASS** | REV-01…04 — review `30d895c7-…`, approved, supplier response, appeal re-queued |
| 6 | RFQ validate, attach, publish, dashboard, revise | **PASS** | RFQ-01…04 — create/debit, validation reject, revise, listCount=43 |
| 7 | Invite → quote → compare → award/close | **PASS** | RFQ-05 quote `5e5cf198-…`; RFQ-06 awarded; AUTH-02 Close/Award gated |
| 8 | Billing grants / debits / refunds / reconcile | **PASS** | BILL-01…04 + Stripe smoke: Premium sub, +100 pack, RFQ −25, refund +25, ledger balanced |
| 9 | Protected actions denied | **PASS** | Playwright 10 protected routes; refund 401; guest Close/Award hidden; AI assist / V12 procurement rejected |
| 10 | Attach evidence + written acceptance | **PASS** | This report + counter/DB/Playwright/Stripe artifacts below |

\*Clerk-hosted email verification, password reset, and MFA were not re-executed end-to-end in this run; entry surfaces and session gating were verified.

## 4. Milestone areas (acceptance counter)

Runtime: Neon + runtime · **2026-08-08T08:49:42.906Z**

| Area | Checks | Status | Sample evidence |
|------|--------|--------|-----------------|
| Database | 1/1 | READY | `DATABASE_URL` set — Neon path active |
| Accounts / authentication | 2/2 | READY | Clerk routes; Close/Award requires mutation actor |
| Company profiles | 2/2 | READY | `sub-accept-1786178972268` recovered; `harbor-heavy-freight` verified |
| Reviews and evidence | 4/4 | READY | reviewId `30d895c7-bd0d-4130-89b4-6fe6f80db296` |
| RFQ marketplace | 6/6 | READY | rfqId `88368e03-159c-4c03-bc37-1dabc7b12126` awarded |
| Billing / credits | 4/4 | READY | balance=24652 · ledgerSum=24652 |

**Milestone counter: 6/6 areas ready · 19/19 automated checks passed**

## 5. Database UAT (Step 1)

Generated: **2026-08-08T08:49:32.593Z** · Result: **READY**

| Step | Result | Detail |
|------|--------|--------|
| 1a Migrate inventory | PASS | 43 versions applied (latest: `0090_platform_bridge`) |
| 1a Schema present | PASS | 276 tables in schema `rq` |
| 1b Seed verification | PASS | companies=12,999 · requests=42 · schema_migrations=43 |
| 1c Forward change | PASS | Created `rq.uat_rollback_marker_1786178970319` |
| 1d Rollback | PASS | Marker dropped; table no longer exists |
| 1e Migrations intact | PASS | schema_migrations still 43 rows |

Artifact: `docs/evidence-videos/uat-step1-db.json`

## 6. Playwright acceptance audit

**31 passed** (chromium, ~33s) against `https://ratequip-web.vercel.app`

| Suite | Count | Result |
|-------|------:|--------|
| Public pages smoke | 12 | PASS |
| Protected routes deny guests | 10 | PASS |
| API security probes | 8 | PASS |
| Accessibility basics | 1 | PASS |

Report: `docs/evidence-videos/audit-artifacts/playwright-report/`

## 7. Stripe / billing UAT

Target: production. Result: **PASS**

| Step | Result |
|------|--------|
| Health + Stripe config | PASS |
| Premium subscription (`tok_visa`) | PASS — `sub_1U25wfCxL4uR5nl0TuGLLRKz` active |
| Webhook subscription grant | PASS — wallet +100 · plan `buyer-premium` |
| Credit pack charge | PASS — `pi_3U25woCxL4uR5nl01NXuMHI7` succeeded |
| Webhook pack grant | PASS — wallet +100 |
| RFQ debit (−25) / refund (+25) / reconcile | PASS — balanced 24752 / 24752 |
| Hosted Checkout Session URL | PASS — `cs_test_a1IzmVJQ5t8AKHFx…` |

Mutation smoke also passed: RFQ create, trust score 84, Harbor claim, free-tier monthly RFQ block, revise, reconcile balanced (wallet 24912 after subsequent runs).

## 8. Live production probes

### Health

```json
{
  "status": "ok",
  "service": "ratequip-api",
  "version": "v1",
  "demoMode": false,
  "database": true
}
```

### Public surfaces

| Path | HTTP |
|------|-----:|
| `/` | 200 |
| `/pricing` | 200 |
| `/companies/search` | 200 |
| `/requests` | 200 |
| `/sign-in` | 200 |
| `/search?q=harbor` | 200 |
| `/companies/harbor-heavy-freight` | 200 (Verified · Claimed) |

### Guest / RBAC negatives

| Check | Result |
|-------|--------|
| `/dashboard`, `/dashboard/buyer`, `/onboarding`, `/reviews/new`, `/requests/new` | **307 → `/sign-in`** |
| `POST /api/v1/billing/refund` (anonymous) | **401** Authentication required |
| Guest RFQ detail “Close RFQ” / “Mark awarded” | **Hidden** |
| Company API `GET /api/v1/companies?q=harbor` | Harbor Heavy Freight · verified=true · claimed=true |

## 9. Known caveats (non-blocking)

1. **Clerk-hosted auth flows** — email verification, password reset, and MFA enrollment/challenge are platform-provided; this run verified entry surfaces and session gating, not a full inbox-driven MFA drill.
2. **`/billing` as bare path** — returns 404 at the exact URL probed; billing is exercised via authenticated product paths and Stripe UAT APIs (not a P0 for this milestone).
3. **Company search UI** — `/companies/search?q=harbor` is client-driven; Harbor is confirmed via `/search?q=harbor`, company profile page, and companies API.
4. **Walkthrough video** — refreshed 2026-08-08 (~4m 37s) at `docs/evidence-videos/uat-full-walkthrough.mp4` via `npm run evidence:uat`.

## 10. Reproduce

```bash
npm run smoke:phase2:acceptance
npm run smoke:phase2
npm run uat:db
npm run stripe:uat-smoke
npx playwright test e2e/acceptance-audit.spec.ts
# optional video refresh:
npm run evidence:uat
```

## 11. Artifacts

| Artifact | Path |
|----------|------|
| This report | `docs/acceptance-phase2/UAT-Report-2026-08-08.md` |
| DB UAT JSON | `docs/evidence-videos/uat-step1-db.json` |
| Playwright HTML report | `docs/evidence-videos/audit-artifacts/playwright-report/` |
| Prior full walkthrough video | `docs/evidence-videos/uat-full-walkthrough.mp4` |
| Prior acceptance package | `docs/acceptance-phase2/` |
| Evidence counter (how-to) | `docs/phase2-mvp-evidence-counter.md` |

## 12. Formal statement

I certify that, as of **8 August 2026**, the RateQuip Phase 2 MVP Core full UAT suite against the live deployment (https://ratequip-web.vercel.app) **PASSED**: acceptance **19/19**, Playwright **31/31**, database UAT **6/6**, Stripe UAT **PASS**, mutation smoke **PASS**, and guest-security probes **PASS**.

Formal written acceptance and payment release remain at the client’s authority after independent verification of the live site.

Respectfully,  
**Touy Smith**  
8 August 2026
