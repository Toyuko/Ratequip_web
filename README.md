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

## Spec source

Built from RateQuip Enterprise Master Repository **v10.1** (Organic Growth Engine supersedes v9/v10.0 for Add Company, claim invitations and related privacy rules). Platform Phase 1–2 MVP remains the delivery frame for this slice.
