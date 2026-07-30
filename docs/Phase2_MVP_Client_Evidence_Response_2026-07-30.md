# RateQuip Phase 2 — Client Evidence Response

**To:** Robin Lionstone  
**From:** Touy Smith  
**Date:** 30 July 2026  
**About:** Invoice 2026-010 · Phase 2 Milestone 1 (MVP Core) · THB 20,000  
**Reply to:** Phase 2 Payment Audit dated 30 July 2026  
**Live site:** https://ratequip-web.vercel.app

---

## Plain summary

Hi Robin,

Thank you for the Phase 2 audit. Your feedback was fair.

The earlier build was **not ready** for Phase 2 acceptance. The problems you found were real. Those problems have now been fixed, re-tested, and recorded on the live website.

**Phase 2 MVP is ready and working.**

What we can show you today:
- **6 of 6** Phase 2 areas ready
- **19 of 19** automated checks passed
- Full **User Acceptance Test** walked on the live site (about 6 minutes)
- Database migrate / seed / rollback demo: **6 of 6** passed
- Short evidence videos for each major workflow

Please use this pack for your new Phase 2 audit. If you are happy with the result, please confirm written acceptance so Phase 2 payment can be released.

---

## What Invoice 2026-010 asked for — and where we are now

| What was promised | Your earlier audit | Status now |
|-------------------|--------------------|------------|
| Working database | Not shown | Ready |
| Sign-up / login / permissions | Partial / Fail | Ready* |
| Add / claim / approve companies | Fail | Ready |
| Reviews with proof files + moderation | Not shown | Ready |
| Basic RFQ create → manage → award | Fail | Ready |
| Billing / credits that balance | Not shown | Ready |

\*Email verification, password reset, and MFA are provided by Clerk (our secure login partner). RateQuip now correctly hides and blocks private actions when someone is not signed in.

---

## What was broken — and what is fixed

### 1) “Submission not found” when adding a company
**What you saw:** The Add Company journey stopped at Contacts.

**What we fixed:** The form recovers the saved draft if the server briefly lost it. Continue works again. If someone does not know an email, they can save an **unclaimed draft**. No invitation is sent unless a real business email is provided.

**Proof:** Automated check CO-01 · Video `02-add-company-contacts.mp4` · Full UAT Step 3

---

### 2) Close RFQ / Mark awarded shown while signed out
**What you saw:** Visitors who were not logged in could see owner controls.

**What we fixed:** Those buttons are hidden unless the user is signed in. The server also rejects the action if someone tries anyway.

**Proof:** Automated check AUTH-02 · Video `01-signed-out-rfq-controls.mp4` · Full UAT Step 9

---

### 3) RFQs accepted bad data and then disappeared
**What you saw:** Extreme budgets and nonsense titles were published. New RFQs could not be found or edited from the buyer dashboard.

**What we fixed:**
- Stronger checks on title, description, and budget
- Buyer dashboard lists and links RFQs
- Edit / Revise page for open RFQs
- Quote and award steps covered in tests and video

**Proof:** Automated checks RFQ-01 to RFQ-06 · Videos `03`, `04`, `07`, `18`, `19` · Full UAT Steps 6–7

---

### 4) Reviews were only a link
**What you saw:** “Write review” existed, but the full process was not shown.

**What we fixed:** The full path now works:
1. Submit review with a proof file  
2. Admin approve / reject  
3. Supplier can reply  
4. Reviewer can appeal  

**Proof:** Automated checks REV-01 to REV-04 · Videos `06`, `09`, `10` · Full UAT Step 5

---

### 5) Billing looked like a price list only
**What you saw:** Plans and checkout links were visible, but no real credit proof.

**What we fixed:** We can now show:
- Credits removed when an RFQ is posted (−25)
- Credits added when Premium activates (+100)
- Refund / adjustment
- A reconciliation report that balances

**Proof:** Automated checks BILL-01 to BILL-04 · Video `05-billing-reconciliation.mp4` · Full UAT Step 8

---

### 6) Database not evidenced
**What you saw:** Screens alone do not prove a real database.

**What we fixed:** The live system uses a real database. We also ran a safe migrate / seed / rollback demo for UAT Step 1.

**Proof:**
- Automated check DB-01
- `uat-step1-db.json` — **6/6 READY**
  - 42 migration versions applied
  - Schema present
  - Seed data present (companies and requests)
  - Temporary change created, then rolled back safely
  - Production migrations left intact

---

## How we proved it (simple list)

### A) Automated checks (machine-run)
Latest result: **6/6 areas ready · 19/19 checks passed**

| Check ID | What it proves | Result |
|----------|----------------|--------|
| DB-01 | Database / storage path works | PASS |
| AUTH-01 | Sign-up / sign-in available | PASS |
| AUTH-02 | Close / Award blocked when not signed in | PASS |
| CO-01 | Add Company draft recovers (fixes “Submission not found”) | PASS |
| CO-02 | Claim + admin approve works | PASS |
| REV-01 | Review submitted with proof | PASS |
| REV-02 | Admin approved review | PASS |
| REV-03 | Supplier response published | PASS |
| REV-04 | Appeal sent back to moderation | PASS |
| RFQ-01 | RFQ created and 25 credits removed | PASS |
| RFQ-02 | Bad RFQ data rejected | PASS |
| RFQ-03 | RFQ revised | PASS |
| RFQ-04 | RFQ appears on buyer dashboard list | PASS |
| RFQ-05 | Supplier quote submitted | PASS |
| RFQ-06 | RFQ awarded with audit | PASS |
| BILL-01 | Credit debit matches wallet | PASS |
| BILL-02 | Plan activation adds credits | PASS |
| BILL-03 | Refund / adjustment works | PASS |
| BILL-04 | Ledger report balances | PASS |

Companion log: `docs/evidence-videos/uat-acceptance-counter.txt`

### B) Full live UAT walkthrough (Robin’s 10 steps)
Recorded on the **live website** https://ratequip-web.vercel.app on **30 July 2026** (about 6 minutes).

**Main video:** `docs/evidence-videos/uat-full-walkthrough.mp4`

| Step | What Robin asked to see | Covered |
|------|-------------------------|---------|
| 1 | Database migrate, seed, rollback | Yes · `uat-step1-db.json` |
| 2 | Buyer register / verify / login / reset / MFA | Yes · Clerk sign-up & sign-in |
| 3 | Create / claim company → approve → edit | Yes |
| 4 | Supplier account + role separation | Yes |
| 5 | Review evidence → moderate → respond → appeal | Yes |
| 6 | RFQ validate, attach, publish, dashboard, revise | Yes |
| 7 | Invite → quote → compare → award / close | Yes |
| 8 | Billing grants / debits / refunds / reconcile | Yes |
| 9 | Protected actions denied | Yes |
| 10 | Attach evidence + written acceptance | Yes · this pack |

Guide: `docs/evidence-videos/UAT-README.md`

### C) Short evidence clips (20 videos)
Also recorded on the live site. Folder: `docs/evidence-videos/`

| Video | What it shows |
|-------|----------------|
| `01-signed-out-rfq-controls.mp4` | Signed-out user does **not** see Close RFQ / Mark awarded |
| `02-add-company-contacts.mp4` | Add Company continues past Contacts (no “Submission not found”) |
| `03-buyer-dashboard-rfqs.mp4` | Buyer dashboard lists and links RFQs |
| `04-rfq-validation-and-edit.mp4` | Bad RFQ data is rejected; Edit / Revise is available |
| `05-billing-reconciliation.mp4` | Credits, refund, and balanced ledger |
| `06-reviews-lifecycle.mp4` | Reviews path |
| `07-create-valid-rfq.mp4` | Valid RFQ created end-to-end |
| `08-signed-in-rfq-owner-controls.mp4` | Signed-in owner RFQ controls available |
| `09-submit-review-with-evidence.mp4` | Review submitted with proof file |
| `10-admin-moderation-queue.mp4` | Admin moderation approve queue |
| `11-company-claim-submit.mp4` | Company claim submitted with evidence |
| `12-supplier-quote-builder.mp4` | Supplier leads + quote builder |
| `13-compare-quotes.mp4` | Buyer quote comparison |
| `14-pricing-and-checkout.mp4` | Pricing plans + checkout path |
| `15-rfq-marketplace-list.mp4` | Public RFQ marketplace |
| `16-supplier-directory-profile.mp4` | Supplier directory + company profile |
| `17-auth-signup-entry.mp4` | Sign-up / sign-in entry |
| `18-revise-rfq-save.mp4` | RFQ revision saved |
| `19-award-or-close-rfq.mp4` | Award / close by signed-in buyer |
| `20-onboarding-roles.mp4` | Onboarding / role selection |

---

## What this Phase 2 payment covers

This pack proves the original Phase 2 MVP scope only:
- Database
- Authentication and permissions
- Company create / claim / admin approve
- Reviews and evidence
- Basic RFQ lifecycle
- Billing / credits

It does **not** claim completion of later V11 / V12 features.

---

## Suggested next step for Robin

1. Open the live site: https://ratequip-web.vercel.app  
2. Watch `uat-full-walkthrough.mp4` (best single overview)  
3. Spot-check any short clips that match your earlier concerns  
4. Confirm written acceptance of Phase 2 MVP Core (Invoice 2026-010)

---

## Short message ready to send

Hi Robin,

Thank you for the Phase 2 audit. The problems you listed were real, and I have fixed them.

Phase 2 MVP is now ready and working on the live site:

https://ratequip-web.vercel.app

What is fixed:
- Add Company no longer fails with “Submission not found”
- Owner RFQ buttons are hidden when signed out
- RFQs are validated, listed on the buyer dashboard, and can be edited
- Reviews support proof upload, moderation, supplier reply, and appeal
- Credits can be granted, spent, refunded, and checked on a balanced ledger
- Database migrate / seed / rollback has been demonstrated

Proof attached / available in the evidence pack:
- Full live UAT walkthrough video (about 6 minutes) covering your 10 acceptance steps
- 20 short evidence videos
- Automated checks: **6/6 areas ready · 19/19 checks passed**
- Database demo result: **6/6 ready**
- This written evidence response

Please run your new Phase 2 audit against the updated live build and this evidence. If everything looks good, please send written acceptance so Phase 2 payment can be released.

Regards,  
Touy

---

## Bottom line

Phase 2 MVP Core has been fixed, tested, and evidenced on the live site.  
**It is ready for your acceptance.**
