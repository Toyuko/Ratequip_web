# Part 7 — AI Intelligent Onboarding / Business DNA

## Contract (from archive)

1. Every persisted fact includes tenant ID, source, confidence, created time, last verified time, responsible actor.
2. AI-derived assertions are distinguishable from user-confirmed data.
3. Side effects are idempotent and auditable.
4. Fail closed for authorisation; fail safely for enrichment.
5. Human approval before public publication, outbound RFQ, or irreversible billing.

## Live thin slice

| Concern | Implementation |
|---------|----------------|
| Schema | `onboarding.business_profile`, `onboarding.business_fact` (+ RLS) |
| Runtime store | `src/lib/v13/part7/store.ts` (serverless-safe global + session mirror) |
| Fact API | `ingest_fact`, `confirm_fact`, `reject_fact`, `resume_session` on company-setup |
| Packs | `src/data/v13/user_type_packs.json`, `industry_packs.json` |
| UI | Inferred vs confirmed facts on `/v12/activation` when Part 7 enabled |
| Bridge | Confirmed facts enrich operating profile answers used by company suggester |

## Status values

- Profile: `draft` → `in_review` → `confirmed` → `archived`
- Fact confirmation: `observed` | `inferred` | `confirmed` | `rejected` | `superseded`
