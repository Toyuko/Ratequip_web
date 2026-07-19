# RateQuip.com Web Platform

B2B trust, procurement, and RFQ marketplace — Phase 1–2 MVP with **Organic Growth Engine Phase 1** (v10.1).

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind · Clerk · Neon (Drizzle) · Stripe · Vercel Blob · Resend · Vercel

## Quick start (demo mode)

Demo mode works without Clerk/Neon/Stripe — UI and workflows use embedded seed data.

```bash
cp .env.example .env.local
# DEMO_MODE=true is fine for local UI

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## V12 Enterprise Layer (Parts 1 & 2)

Imported from RateQuip Enterprise Master Repository **V12 Part 1 + Part 2** (19 Jul 2026).

| Layer | What landed in this app |
|-------|-------------------------|
| Seeds | Taxonomy, question packs/definitions, capabilities, roles → `src/data/v12/` |
| Migrations (reference) | Part 1 `0001–0005` + Part 2 commercial/asset → `drizzle/v12/` |
| Engines | DQE resolver, explainable matcher, ranker, AI confirmation → `src/lib/v12/` |
| UI | `/v12` hub + activation, taxonomy, builders, matching, intelligence, procurement, RFQ, SRM, CRM |
| API | `/api/v1/v12`, `/api/v1/v12/procurement` |
| Docs | `docs/v12/` charter, backlog, READMEs |

**Part 1 vertical slice:** activation (DQE) → builders → explainable match → AI draft/confirm.  
**Part 2 Release 2A:** procurement requisitions → RFQ immutable revisions → award with reason codes → SRM/CRM spines.

```bash
npm run smoke:v12
```

Remaining Part 2 releases (2B–2F) and Part 3 domains stay as contracts under `drizzle/v12` + `docs/v12` until scheduled.

## Phase 2 persistence (working MVP)

Mutations are no longer toast-only:

| Workflow | Behaviour |
|----------|-----------|
| Onboarding | Creates org + user + wallet (Neon when `DATABASE_URL` set; else runtime store + cookies) |
| Company claim | Queues claim; admin approve sets `claimed` + `verified` |
| Reviews | Queues for moderation; approve recalculates Trust Score |
| RFQ create | Debits **25 credits** (org wallet or enterprise pool); free tier max **1 RFQ/month** |
| Quotes | Persists against RFQ; increments quote count |
| RFQ close/award | Status transitions; records marketplace **commission** ledger |
| Stripe checkout | Subscriptions + one-time **credit packs**; demo grants immediately |
| Stripe portal / cancel | `/api/billing/portal`, `/api/billing/cancel` |
| Clerk webhook | Upserts `users` on create/update |
| Stripe webhook | Subscription upsert, credit packs, **invoice.paid** renewal credits |

### Subscriptions & RateQuip credits

| Plan | Monthly price | Credits on activate / renewal |
|------|--------------:|------------------------------:|
| Buyer Free | $0 | 0 (starter wallet **250**; **1 RFQ/month** cap) |
| Buyer Premium | $39 | **100** |
| Supplier Silver | $49 | **50** |
| Supplier Gold | $199 | **200** |
| Supplier Platinum | $799 | **500** |

**Credit packs (one-time):** 100 / 500 / 2000 credits (`credits-100`, `credits-500`, `credits-2000`).

**Enterprise:** pooled credits + commission bps (`enterprise_accounts`). Member orgs debit the pool when funded; awards write `commission_ledger_entries` (default **2.5%**).

Runtime store: `src/lib/db/runtime-store.ts` · Dual-path writes: `src/lib/db/phase2.ts`

## Production bootstrap (Vercel)

1. Authenticate: `npx vercel login`
2. Link the project: `npx vercel link`
3. Add Marketplace integrations: Clerk, Neon, Blob (Stripe + Resend via env)
4. Pull env: `npx vercel env pull .env.local`
5. Set `DEMO_MODE=false` in production env
6. Push schema: `npm run db:push`
7. Seed: `npm run db:seed`
8. Deploy: `npx vercel --prod`

Required env vars are listed in `.env.example`.

## Key routes

| Area | Paths |
|------|--------|
| Public | `/`, `/suppliers`, `/companies/[slug]`, `/search`, `/categories/[slug]`, `/requests`, `/pricing` |
| Organic Growth (v10.1 Phase 1) | `/companies/search` → `/companies/add/*`, `/companies/add/success/[id]`, `/claim/[token]`, `/email/preferences/[token]` |
| Auth | `/sign-in`, `/sign-up`, `/onboarding` |
| App | `/dashboard/buyer`, `/dashboard/supplier`, `/dashboard/contractor`, `/dashboard/admin` |
| Workflows | `/requests/new`, `/reviews/new`, `/companies/claim`, `/quotes/compare`, `/workspaces/[id]` |
| Shells | `/modules/[slug]` (v10 modules — coming soon) |

## Organic Growth Engine (v10.1)

Authoritative module: `RateQuip_Enterprise_Master_Repository_v10.1/07_Organic_Growth_Engine/`.

**Current milestone:** Phase 1 vertical slice — search/dedupe, Add Company wizard (OG-001–OG-007), private contact masking, atomic publish + claim-invite enqueue, unclaimed public profile (OG-009), claim landing (OG-010).

SQL migration: `drizzle/0001_organic_growth_v10_1.sql` (apply via migration framework when leaving demo mode).

Phases 2–5 (delivery webhooks, full claim verification, attribution/rewards, review loops) are specified but not marked complete.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run db:push` — push Drizzle schema to Neon
- `npm run db:seed` — seed demo companies/reviews/RFQs
- `npm run smoke` — hit core routes (server must be running)

## Brand

Logo: `public/brand/ratequip-logo.png`  
Colors: navy `#0F172A`, orange `#F97316`  
Tagline: Rate. Compare. Connect. Grow.

## Mobile API (`/api/v1`)

JSON API for the RateQuip companion app (Expo). Envelope: `{ data, error }`. CORS enabled for Expo / localhost. In demo mode, send `X-Demo-Role: buyer|supplier|contractor|admin`.

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/health` | public |
| GET | `/api/v1/me` | optional |
| POST | `/api/v1/onboarding` | required |
| GET | `/api/v1/categories` | public |
| GET | `/api/v1/companies` | public |
| GET | `/api/v1/companies/[slug]` | public |
| GET/POST | `/api/v1/requests` | GET public / POST auth |
| GET | `/api/v1/requests/[id]` | public |
| POST | `/api/v1/requests/[id]/status` | required |
| POST | `/api/v1/quotes` | required |
| POST | `/api/v1/claims` | required |
| POST | `/api/v1/reviews` | required |
| GET | `/api/v1/dashboard` | required |
| GET | `/api/v1/billing/plans` | public |
| GET | `/api/v1/billing/packs` | public |
| GET | `/api/v1/billing/wallet` | required |
| GET/POST | `/api/v1/billing/enterprise` | required |
| GET | `/api/v1/admin/queue` | admin |
| POST | `/api/v1/admin/moderate` | admin |

## Spec source

Built from RateQuip Enterprise Master Repository **v10.1** (Organic Growth Engine supersedes v9/v10.0 for Add Company, claim invitations and related privacy rules). Platform Phase 1–2 MVP remains the delivery frame for this slice.
