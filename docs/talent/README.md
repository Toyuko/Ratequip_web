# RateQuip operator talent pool

Job board integration Phase 1 + Indeed 2a (direct-employer XML). SEEK and LinkedIn adapters are not in this slice.

Spec: `RateQuip_Job_Board_Integration_Spec.docx` (12 Aug 2026).

## What shipped

- Canonical operator / gig domain under `src/lib/talent` (`JobBoardAdapter`, identity merge, credentials, matching)
- Operators are Collaborate `INDIVIDUAL` parties, persisted to Neon (`collaborate_parties` extras + talent_* tables)
- Collaborate in-memory engine now hydrates/flushes a Neon snapshot (`collaborate_runtime`)
- Indeed XML feed, Apply webhook (HMAC-SHA1), screener questions, disposition outbox
- Daily cron at `/api/v1/talent/cron` (expiry sweep, inbound replay, outbox)
- Operator signup UI, APP 5 collection notice, wet-hire RFQ → gig

## API

- `GET/POST /api/v1/talent`
- `GET /api/v1/talent/indeed/feed` — Indeed XML
- `GET /api/v1/talent/indeed/questions?gigId=`
- `POST /api/webhooks/indeed` — Indeed Apply
- `GET /api/v1/talent/cron` — `Authorization: Bearer $CRON_SECRET`

Env: `INDEED_APPLY_SECRET`, `INDEED_APPLY_API_TOKEN`, `INDEED_EMPLOYER_NAME`, `INDEED_DISPOSITION_URL`, `CRON_SECRET`.

## Smoke

```bash
npm run smoke:talent
```

## Schema

`drizzle/0012_talent_pool.sql` — apply with your usual Neon SQL workflow (or `drizzle-kit migrate` once journaled).

## Out of scope here

SEEK GraphQL, LinkedIn Apply Connect, labour-hire licensing product surface, NSW HRW register lookup.
