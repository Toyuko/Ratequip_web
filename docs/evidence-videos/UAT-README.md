# RateQuip Phase 2 — Full UAT Walkthrough

**Recorded:** 2026-08-08T09:02:26.044Z  
**Target:** https://ratequip-web.vercel.app  
**Video:** `uat-full-walkthrough.mp4`

## Robin's 10-step UAT checklist

| # | Workflow | Covered in video |
|---|----------|------------------|
| 1 | Database migrate, seed, rollback | Opening report + `uat-step1-db.json` |
| 2 | Buyer register / verify / login / reset / MFA | Clerk sign-up & sign-in (platform-hosted verify/MFA) |
| 3 | Create/claim company → approve → edit | Add company + claim + admin approve |
| 4 | Supplier account + role/tenant isolation | Supplier vs buyer/admin dashboards |
| 5 | Review evidence → moderate → respond → appeal | Full review path |
| 6 | RFQ validate, attach, publish, dashboard, revise | New RFQ → buyer dashboard → edit |
| 7 | Invite → quote → compare → award/close | Supplier quote + compare + award |
| 8 | Billing grants / debits / refunds / reconcile | Buyer billing + refund |
| 9 | Protected actions denied | Signed-out + wrong-role checks |
| 10 | Attach evidence + written acceptance | Closing checklist + acceptance counter |

## Companion files

- `uat-full-walkthrough.mp4` / `.webm` (**~4m 37s**, recorded 2026-08-08)
- `uat-step1-db.json`
- `uat-acceptance-counter.txt`
- `../Phase2_MVP_Client_Evidence_Response_2026-07-30.md`
- Full UAT report: [`../acceptance-phase2/UAT-Report-2026-08-08.md`](../acceptance-phase2/UAT-Report-2026-08-08.md)

## Reproduce

```bash
npm run evidence:uat
```
