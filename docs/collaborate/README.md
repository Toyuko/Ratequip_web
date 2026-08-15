# RateQuip Collaborate

Work, Teams and Venture Creation Engine (Features 61–70).

Spec: `RateQuip-Collaborate-Technical-Build-Spec.docx` (10 Aug 2026).

## What shipped

**Phase 0 foundation** (in-process store + Neon snapshot + SQL schema):

- Party (Individual / Organisation) + memberships + acting-as on writes
- Capability (Skill / Credential / Asset / Capacity) + verifiedState ladder
- Requirement + Engagement aggregate (`JOB | POD | SESSION | VENTURE`)
- Milestone with multi-party `PayoutAllocation` (FIXED basis)
- Hash-chained domain event log
- ReputationEvent store (transaction-linked only)
- Money as integer minor units + currency
- `PaymentProvider` + `PayoutRouter` + sandbox PSP
- Versioned immutable `FeeQuote` with pre-accept disclosure
- Verification stubs + manual admin queue
- Document generation (structured JSON + hash)
- Workspace primitives (threads, messages, access log, pre-award masking)
- Capability taxonomy seed + pending curation queue

**Phase 1 launch surface — Remote Expert Support:**

- Session offerings, booking, funding hold, written deliverable, accept → pay
- UI at `/collaborate`, `/collaborate/sessions`, `/collaborate/experts`
- Job path UI for Phase 0 exit criterion at `/collaborate/jobs`

## API

`GET/POST /api/v1/collaborate` — action-based. Money-moving transitions require `Idempotency-Key`.

## Smoke

```bash
npm run smoke:collaborate
```

## Non-goals (not built)

Escrowed equity, token issuance, RateQuip wallets, automated incorporation, profit-share %, crypto payout (enum present, rail disabled).
