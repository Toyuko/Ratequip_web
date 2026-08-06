# Phase 2 Compatibility Contract

Enterprise (V12/V13) work must never regress Phase 2 MVP acceptance.

## Frozen Phase 2 surfaces

Do **not** rewrite or change contracts for:

| Area | Routes / APIs |
|------|----------------|
| Auth | Clerk sign-in/up, session guards, role assignment |
| Company | `/companies/search`, `/companies/add/*`, `/companies/claim*`, organic-growth actions |
| Reviews | Review create / moderate / respond / appeal |
| RFQ | Draft / publish / quote / compare / award + `/api/rfq/*` |
| Billing | Stripe checkout, webhooks, credit ledger, wallet |
| Security | Guest block, wrong-role, admin-only API probes |

## Allowed enterprise locations

- `/v12/*`, `/v13/*`
- `src/lib/v12/*`, `src/lib/v13/*`
- `drizzle/v12/*` (additive only), `src/data/v12/*`, `src/data/v13/*`
- `/api/v1/v12/*`, `/api/v1/v13/*`

## Feature flags

| Flag | Default | Meaning |
|------|---------|---------|
| `ENTERPRISE_PART7_ENABLED` | off (`false` / unset) | Business DNA facts on company setup |
| `ENTERPRISE_GRAPH_MATCH_ENABLED` | off | Graph adjacency in matching |
| `ENTERPRISE_CATALOGUE_LEDGER_ENABLED` | off | Module 68 credit reservation ledger |

Phase 2 UAT paths must succeed with all enterprise flags off.

## Merge gate (required)

Every PR that touches app code must pass:

```bash
npm run smoke:phase2:acceptance
npx playwright test e2e/acceptance-audit.spec.ts
```

CI workflow: `.github/workflows/phase2-acceptance.yml`

## AI policy (enterprise overlays)

- Deterministic interview packs first.
- AI-derived facts are `inferred` until human `confirmed`.
- No publication, outbound RFQ, or irreversible billing from unconfirmed AI output.
