# RateQuip — Portfolio Package

Ready-to-paste copy + screenshots for your personal portfolio site.

**Live demo:** https://ratequip-web.vercel.app  
**Repo:** https://github.com/Toyuko/Ratequip_web  
**Role:** Founder / Full-stack product engineer  
**Year:** 2026

---

## One-liner (card / grid)

B2B trust and procurement platform for industrial equipment — supplier discovery, RFQs, verified reviews, and credit-based marketplace economics.

---

## Short description (~40 words)

RateQuip is a B2B marketplace that helps plant buyers rate, compare, and connect with industrial equipment suppliers. I designed and built the full web platform: Trust Score reputation, RFQ workflows, Stripe billing, Neon Postgres, and an organic growth engine for unclaimed supplier listings.

---

## Medium description (~90 words) — recommended for case studies

RateQuip is an independent B2B trust and procurement platform for industrial equipment buyers across ASEAN and beyond. Buyers search a structured supplier taxonomy, post RFQs, compare quotes, and leave evidence-backed reviews that feed a Trust Score. Suppliers claim profiles, respond to demand, and grow through subscription tiers and RateQuip credits.

I built the product end-to-end on Next.js 16, TypeScript, Clerk, Neon (Drizzle), Stripe, and Vercel — including public directory UX, RFQ marketplace, SaaS billing, an organic “add company / claim invite” growth loop, and a V12 enterprise layer for procurement matching, document vaults, and catalogue factory workflows.

---

## Long case study (~180 words)

### Problem
Industrial buyers still procure capital equipment through fragmented directories, WhatsApp threads, and word-of-mouth. Supplier quality is hard to verify, RFQs scatter across inboxes, and there is no shared reputation layer for plant-scale purchases.

### Solution
RateQuip is a marketplace where reputation and procurement live together:
- Discover suppliers by category, location, and Trust Score
- Post structured RFQs and collect comparable quotes
- Verify purchases with review evidence that updates Trust Score
- Grow the directory organically via contributor-added, claimable company profiles

### What I built
- Full-stack Next.js 16 App Router product with role-based buyer / supplier / contractor / admin surfaces
- Neon Postgres schema + Drizzle ORM, dual-path demo/live persistence
- Clerk auth, Stripe subscriptions + credit packs, Resend email, Vercel Blob
- Organic Growth Engine: search/dedupe → add-company wizard → publish → claim invite
- V12 enterprise modules: procurement RFQ, matching, workflow, requirement ledger, catalogue factory
- Public JSON API for a companion mobile client

### Outcome
Shipped a production deployment on Vercel with a live supplier directory (~13k imported companies), RFQ marketplace UX, monetization plans, and an extensible enterprise architecture for industrial procurement.

---

## Bullet features (portfolio UI chips)

- Trust Score reputation from verified reviews
- Industrial supplier directory + taxonomy search
- Structured RFQ marketplace (budget, compliance, scope)
- Quote comparison workspaces
- Company claim / organic growth invitations
- Stripe billing + RateQuip credit wallets
- Multi-role dashboards (buyer, supplier, contractor, admin)
- Enterprise V12: matching, vault, catalogue factory
- i18n + light/dark theme
- Mobile-ready `/api/v1` JSON API

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, Radix UI, Lucide |
| Auth | Clerk |
| Database | Neon Serverless Postgres + Drizzle ORM |
| Payments | Stripe (subscriptions + one-time credit packs) |
| Storage / email | Vercel Blob, Resend |
| AI | Vercel AI SDK / AI Gateway (RFQ assist) |
| Deploy | Vercel (Fluid Compute) |

---

## Suggested screenshot set (featured)

Use these 5–7 images on the case-study page, in this order:

| # | File | Caption |
|---|------|---------|
| 1 | `screenshots/featured/01-hero.png` | Marketing hero — brand-led landing |
| 2 | `screenshots/featured/02-supplier-directory.png` | Supplier directory with Trust Score cards |
| 3 | `screenshots/featured/06-search-results.png` | Search results for packaging suppliers |
| 4 | `screenshots/featured/03-rfq-marketplace.png` | Open RFQ marketplace (ASEAN demand) |
| 5 | `screenshots/featured/04-rfq-detail.png` | Structured RFQ with compliance & scope |
| 6 | `screenshots/featured/05-pricing.png` | Buyer / supplier SaaS pricing |
| 7 | `screenshots/featured/07-enterprise-guide.png` | Enterprise V12 plain-language product guide |

Supporting shots live in `screenshots/supporting/` (categories, company profile, add-company, V12 modules, full-page pricing/home).

Brand logo: `brand/ratequip-logo.png`

---

## Meta for your portfolio CMS

```yaml
title: RateQuip
subtitle: B2B trust & procurement for industrial equipment
url: https://ratequip-web.vercel.app
github: https://github.com/Toyuko/Ratequip_web
tags: [Next.js, TypeScript, Neon, Stripe, Clerk, Marketplace, B2B]
role: Founder / Full-stack
cover: screenshots/featured/01-hero.png
```
