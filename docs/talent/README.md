# RateQuip operator talent pool

Job board integration Phase 1 + Indeed 2a (direct-employer XML) + LinkedIn Apply Connect adapter. SEEK GraphQL is still out of this slice.

Spec: `RateQuip_Job_Board_Integration_Spec.docx` (12 Aug 2026).

## What shipped

- Canonical operator / gig domain under `src/lib/talent` (`JobBoardAdapter`, identity merge, credentials, matching)
- Operators are Collaborate `INDIVIDUAL` parties, persisted to Neon (`collaborate_parties` extras + talent_* tables)
- Collaborate in-memory engine now hydrates/flushes a Neon snapshot (`collaborate_runtime`)
- Indeed XML feed, Apply webhook (HMAC-SHA1), screener questions, disposition outbox
- LinkedIn Simple Job Postings (async task + poll), application webhook (HMAC-SHA256), screener questions
- Sign In with LinkedIn on `/operators/join` via Clerk `oauth_linkedin_oidc` + `/sso-callback`
- Daily cron at `/api/v1/talent/cron` (expiry sweep, inbound replay, outbox)
- Operator signup UI, APP 5 collection notice, wet-hire RFQ → gig

## API

- `GET/POST /api/v1/talent`
- `GET /api/v1/talent/indeed/feed` — Indeed XML
- `GET /api/v1/talent/indeed/questions?gigId=`
- `POST /api/webhooks/indeed` — Indeed Apply
- `POST /api/webhooks/linkedin` — LinkedIn job applications
- `GET /api/v1/talent/cron` — `Authorization: Bearer $CRON_SECRET`

### Indeed env

`INDEED_APPLY_SECRET`, `INDEED_APPLY_API_TOKEN`, `INDEED_EMPLOYER_NAME`, `INDEED_DISPOSITION_URL`, `CRON_SECRET`.

### LinkedIn env

| Variable | Purpose |
| --- | --- |
| `LINKEDIN_ACCESS_TOKEN` | Apply Connect / Job Posting API token |
| `LINKEDIN_ORG_URN` | Preferred `urn:li:organization:…` integration context |
| `LINKEDIN_COMPANY_PAGE_URL` | Fallback when org URN unset |
| `LINKEDIN_POSTER_EMAIL` | Poster email on Simple Job Postings |
| `LINKEDIN_WEBHOOK_SECRET` | HMAC-SHA256 for application webhooks |

Without credentials, non-production / demo mode records a demo LinkedIn publish task so local smoke still works. Live Apply Connect needs LinkedIn partner approval.

### Clerk (Sign In with LinkedIn)

Enable **LinkedIn** / `oauth_linkedin_oidc` in the Clerk dashboard. Operators use **Continue with LinkedIn** on `/operators/join`.

## Smoke

```bash
npm run smoke:talent
```

## Schema

`drizzle/0012_talent_pool.sql` — apply with your usual Neon SQL workflow (or `drizzle-kit migrate` once journaled).

## Out of scope here

SEEK GraphQL, LinkedIn disposition / RSC middleware sync, labour-hire licensing product surface, NSW HRW register lookup.
