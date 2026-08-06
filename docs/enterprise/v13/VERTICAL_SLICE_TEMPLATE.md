# Vertical Slice Template (Enterprise Overlay)

Use this checklist for each archive domain. A domain is not “done” until all boxes pass (V12 charter).

## 1. Scope

- [ ] Domain ID + name
- [ ] Feature IDs (if any)
- [ ] Explicit **out of scope** for Phase 2 (list frozen surfaces)

## 2. Schema

- [ ] Additive SQL under `drizzle/v12/` (or `drizzle/v13/`)
- [ ] Tenant column + RLS policy
- [ ] No ALTER of Phase 2 tables

## 3. API

- [ ] Route under `/api/v1/v12/*` or `/api/v1/v13/*`
- [ ] Command envelope (`requestId`, `idempotencyKey`, `tenantId`, `actorId`)
- [ ] Fail closed auth via `gateApiUser` / role checks

## 4. UI

- [ ] Screen under `/v12/*` or `/v13/*`
- [ ] Human confirm for AI-derived / publish / billing actions
- [ ] Explainability (reason codes) for rankings

## 5. Feature flag

- [ ] Env flag default **off**
- [ ] Documented in `PHASE2_COMPATIBILITY.md`
- [ ] Phase 2 smoke passes with flag off

## 6. Tests

- [ ] Unit/smoke for happy path + tenant isolation
- [ ] `npm run smoke:phase2:acceptance` green
- [ ] `npx playwright test e2e/acceptance-audit.spec.ts` green

## 7. Ops

- [ ] Runbook note (enable/disable, kill switch)
- [ ] Observability: correlation id on errors
