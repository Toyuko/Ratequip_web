# RateQuip V13 Enterprise Overlay

Authoritative integration notes for the V13 Enterprise Master Repository (Part 7 send-ready R1) into the live Next.js platform.

## Source archive

`RateQuip_Enterprise_Master_Repository_V13_PART7_ENTERPRISE_SEND_READY_R1`

Read the archive `DEVELOPER_COVER_NOTE_V13.md` first: most numbered domains are **specification only**. Executable foundations are Postgres migrations, Module 68 catalogue factory (Python), and thin backend stubs.

## What this folder contains

| Doc | Purpose |
|-----|---------|
| [PHASE2_COMPATIBILITY.md](./PHASE2_COMPATIBILITY.md) | Frozen Phase 2 surfaces and merge gates |
| [DOMAIN_INVENTORY.md](./DOMAIN_INVENTORY.md) | Archive domain → live app mapping |
| [PART7_OVERVIEW.md](./PART7_OVERVIEW.md) | Business DNA / intelligent onboarding slice |
| [DOMAIN_BACKLOG.md](./DOMAIN_BACKLOG.md) | Domains 14–69 vertical-slice backlog |
| [VERTICAL_SLICE_TEMPLATE.md](./VERTICAL_SLICE_TEMPLATE.md) | Checklist for each enterprise domain |

## Runtime locations

- Feature flags: `src/lib/v13/flags.ts`
- Part 7 services: `src/lib/v13/part7/`
- Part 7 seeds: `src/data/v13/`
- Schema: `drizzle/v12/0041_part7_business_dna.sql`
- UI entry: `/v12/activation` (Part 7 panel) and `/v13` (enterprise index)
- APIs: `/api/v1/v12/company-setup` Part 7 actions; `/api/v1/v13/*`

## Delivery waves

0. Docs + CI gate + flags  
1. Part 7 Business DNA thin slice  
2. Deepen Domains 02–10 thin slices  
3. Module 68 catalogue parity (TS)  
4. Remaining domains as flagged overlays  
