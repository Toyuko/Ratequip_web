# RateQuip.com Web Platform

B2B trust, procurement, and RFQ marketplace — Phase 1–2 MVP.

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
| Public | `/`, `/suppliers`, `/suppliers/[slug]`, `/search`, `/categories/[slug]`, `/requests`, `/pricing` |
| Auth | `/sign-in`, `/sign-up`, `/onboarding` |
| App | `/dashboard/buyer`, `/dashboard/supplier`, `/dashboard/contractor`, `/dashboard/admin` |
| Workflows | `/requests/new`, `/reviews/new`, `/companies/claim`, `/quotes/compare`, `/workspaces/[id]` |
| Shells | `/modules/[slug]` (v10 modules — coming soon) |

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

Built from RateQuip Enterprise Master Repository v10.0 (ClickUp Phase 1–2 / MVP Definition).
