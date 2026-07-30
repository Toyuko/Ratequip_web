# RateQuip Phase 2 — Evidence Response

**To:** Robin Lionstone  
**From:** Touy Smith  
**Date:** 30 July 2026  
**About:** Invoice 2026-010 · Phase 2 MVP Core · THB 20,000  
**Reply to:** Phase 2 Payment Audit dated 30 July 2026

---

## In plain words

Thank you for the Phase 2 audit feedback.

The issues you raised were valid. The earlier staging build was not complete enough for Phase 2 acceptance. Those problems have now been fixed.

**Phase 2 MVP is ready for another audit.**

Current automated proof:
- **6 out of 6** Phase 2 areas ready  
- **19 out of 19** automated checks passed  

This pack shows what was wrong, what was fixed, and where the evidence is. Please run a new audit against the updated build and this evidence.

---

## Scorecard vs the previous audit

| What Invoice 2026-010 asked for | Previous audit | Status now |
|---------------------------------|----------------|------------|
| Working database | Not shown | Ready |
| Real sign-up / login / permissions | Partial / Fail | Ready* |
| Add / claim / approve companies | Fail | Ready |
| Reviews with proof files + moderation | Not shown | Ready |
| Basic RFQ create → manage → award | Fail | Ready |
| Billing / credits that balance | Not shown | Ready |

\*Email verify, password reset, and MFA are handled by Clerk (the login provider). The app now hides and blocks owner actions when a user is not signed in.

---

## What was broken — and what is fixed

### 1) “Submission not found” when adding a company
**Previous finding:** The Add Company journey stopped at Contacts.

**Fix:** The form recovers the saved draft if the server lost it. Continue works again. If someone does not know an email, they can save an **unclaimed draft**. No invitation is sent unless a real business email is provided.

**Evidence:** CO-01, CO-02 · Video `02-add-company-contacts.mp4`

---

### 2) Close RFQ / Mark awarded shown while signed out
**Previous finding:** Visitors who were not logged in could see owner controls.

**Fix:** Those buttons are hidden unless the user is signed in. The server also rejects the action if someone tries anyway.

**Evidence:** AUTH-02 · Video `01-signed-out-rfq-controls.mp4`

---

### 3) RFQs accepted bad data and then disappeared
**Previous finding:** Extreme budgets and nonsense titles were published. The new RFQ could not be found or edited from the buyer dashboard.

**Fix:**
- Stronger checks on title, description, and budget  
- Buyer dashboard lists and links RFQs  
- Edit / Revise page for open RFQs  
- Quote and award steps covered in tests  

**Evidence:** RFQ-01 to RFQ-06 · Videos `03-buyer-dashboard-rfqs.mp4`, `04-rfq-validation-and-edit.mp4`

---

### 4) Reviews were only a link
**Previous finding:** “Write review” existed, but the full process was not shown.

**Fix:** Full path now works:
1. Submit review with proof file  
2. Admin approve / reject  
3. Supplier can reply  
4. Reviewer can appeal  

**Evidence:** REV-01 to REV-04 · Video `06-reviews-lifecycle.mp4`

---

### 5) Billing looked like a price list only
**Previous finding:** Plans and checkout links were visible, but no real credit proof.

**Fix:** Now evidenced:
- Credits removed when an RFQ is posted (−25)  
- Credits added when Premium activates (+100)  
- Refund / adjustment  
- Reconciliation report that balances  

**Evidence:** BILL-01 to BILL-04 · Video `05-billing-reconciliation.mp4`

---

### 6) Database not evidenced
**Previous finding:** Screens alone do not prove a real database.

**Fix:** Schema, migrations, seed scripts, and dual storage path are in the repo. Automated tests prove create / debit / approve / refund flows persist correctly.

**Evidence:** DB-01

---

## Evidence included for the next audit

### Automated checks
From the project folder:

```bash
npm run smoke:phase2:acceptance
npm run smoke:phase2
```

Latest result:
- Acceptance: **6/6 areas ready · 19/19 checks passed**
- Smoke test: passed  
- Code version under this pack: `b7a8b07`

### Evidence videos (20 clips)

| Video | What it shows |
|-------|----------------|
| `01-signed-out-rfq-controls.mp4` | Signed-out user does **not** see Close RFQ / Mark awarded |
| `02-add-company-contacts.mp4` | Add Company continues past Contacts (no “Submission not found”) |
| `03-buyer-dashboard-rfqs.mp4` | Buyer dashboard lists and links RFQs |
| `04-rfq-validation-and-edit.mp4` | Bad RFQ data is rejected; Edit / Revise is available |
| `05-billing-reconciliation.mp4` | Credits, refund, and balanced ledger |
| `06-reviews-lifecycle.mp4` | Reviews / write-review path |
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

Video folder: `docs/evidence-videos/`

---

## Scope of this update

This work covers the original Phase 2 MVP scope only:
- Database  
- Authentication and permissions  
- Company create / claim / admin approve  
- Reviews and evidence  
- Basic RFQ lifecycle  
- Billing / credits  

It does not claim completion of later V11/V12 features.

---

## Short message ready to send

Hi Robin,

Thank you for the Phase 2 audit. The problems you listed were real, and I have fixed them.

Phase 2 MVP is now ready for another audit. The updated build addresses:

- Add Company no longer fails with “Submission not found”
- Owner RFQ buttons are hidden when signed out
- RFQs are validated, listed on the buyer dashboard, and can be edited
- Reviews support proof upload, moderation, supplier reply, and appeal
- Credits can be granted, spent, refunded, and checked on a balanced ledger

Automated checks show **6/6 areas ready** and **19/19 checks passed**. Twenty short evidence videos and a written evidence pack are attached.

Please run a new Phase 2 audit against the updated build and evidence pack.

Regards,  
Touy

---

## Full automated check list (latest run)

| ID | What was checked | Result |
|----|------------------|--------|
| DB-01 | Database / storage path works | PASS |
| AUTH-01 | Sign-up / sign-in loading state | PASS |
| AUTH-02 | Close / Award blocked when not signed in | PASS |
| CO-01 | Add Company draft recovers (fixes Submission not found) | PASS |
| CO-02 | Claim + admin approve works | PASS |
| REV-01 | Review submitted with proof | PASS |
| REV-02 | Admin approved review | PASS |
| REV-03 | Supplier response published | PASS |
| REV-04 | Appeal sent back to moderation | PASS |
| RFQ-01 | RFQ created and 25 credits removed | PASS |
| RFQ-02 | Bad RFQ data rejected | PASS |
| RFQ-03 | RFQ revised | PASS |
| RFQ-04 | RFQ appears in list used by buyer dashboard | PASS |
| RFQ-05 | Supplier quote submitted | PASS |
| RFQ-06 | RFQ awarded with audit | PASS |
| BILL-01 | Credit debit matches wallet | PASS |
| BILL-02 | Plan activation adds credits | PASS |
| BILL-03 | Refund / adjustment works | PASS |
| BILL-04 | Ledger report balances | PASS |

**Bottom line:** Phase 2 has been fixed and is ready for another audit.
