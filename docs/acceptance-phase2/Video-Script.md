# Phase 2 Acceptance Video Script (Narration)

**Target length:** 15–25 minutes  
**Resolution:** 1920×1080 @ 60fps  
**Output:** `videos/phase2-acceptance-narrated.mp4`  
**Commit shown on screen:** `0f0280d9d8b8ca95f539b09b41f6e960a1b0b42e`  
**Deploy URL:** https://ratequip-web.vercel.app

## Chapter map (approximate timestamps)

| Timestamp | Chapter | Narration |
|-----------|---------|-------------|
| 00:00 | Introduction | “This is the RateQuip Phase 2 MVP Core acceptance demonstration for Robin Lionstone’s audit. We will walk repository identity, remediation evidence, and live workflows.” |
| 00:45 | Repository / Commit / Tag / Deploy | “Repository RateQuip_web. Commit 0f0280d. Release identifier phase2-mvp-m1-2026-07-30. Live deployment https://ratequip-web.vercel.app.” |
| 02:00 | Authentication | “Clerk-hosted registration and sign-in. Email verification, password reset, and MFA are platform-provided. App enforces session gating for private routes.” |
| 04:00 | Database | “Neon Postgres: forty-two migrations applied, schema present, seed counts verified, temporary change rolled back safely.” |
| 06:00 | Company | “Create company recovers drafts after store miss — the Submission not found defect is closed. Claim and admin approval demonstrated.” |
| 08:00 | Reviews | “Review with evidence upload, admin moderation, supplier response, and appeal.” |
| 10:00 | RFQ | “Validated RFQ create, dashboard list, revise, supplier quote, compare, award and close with audit.” |
| 13:00 | Billing | “Stripe Test Mode checkout, webhook credit grant, RFQ debit, refund, and ledger reconciliation. Note any pre-existing demo-wallet drift as a medium hygiene item.” |
| 16:00 | Security / RBAC / Tenant | “Signed-out users cannot manage RFQs. Protected dashboards redirect. Unauthenticated billing refund and procurement APIs are rejected.” |
| 18:00 | Automated tests / Playwright / Lighthouse | “Acceptance counter nineteen of nineteen. Playwright thirty-one of thirty-one. Lighthouse reports attached for homepage, dashboard, RFQ, company, profile, and pricing.” |
| 20:00 | Final summary | “All original P0 defects closed on evidence. Status: READY FOR CLIENT UAT. Please verify independently before written acceptance.” |

## Source media assembly

1. Title cards (ffmpeg drawtext)  
2. `uat-full-walkthrough.mp4` (primary live demo)  
3. Selected short clips 01–20 for P0 close-ups  
4. TTS narration bed (macOS `say` / Daniel) mixed under video  

## Integrity note

No workflow is claimed PASS without corresponding screenshot, video chapter, Playwright result, commit, or console log in this package.


## Assembled runtime

Verified: `videos/phase2-acceptance-narrated.mp4` — 1920×1080, 60fps.

**Narration voice:** `Shelley (English (US))` at rate 165 (natural macOS neural/enhanced voice; script rewritten to avoid spelled-out initials).
