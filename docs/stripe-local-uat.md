# Stripe UAT (Phase 2 billing) — production target

All UAT and smoke tests target **https://ratequip-web.vercel.app** (not localhost).

## Prerequisites

1. Claim the Test sandbox if needed: `stripe sandbox claim`
2. Stripe Test keys + `STRIPE_PRICE_*` are set on Vercel Production (already pushed)
3. `NEXT_PUBLIC_APP_URL=https://ratequip-web.vercel.app` on Production

## Webhooks (credits land only after Stripe confirms)

Keep this running while testing Checkout on the live site:

```bash
npm run stripe:listen
# forwards → https://ratequip-web.vercel.app/api/webhooks/stripe
```

Copy the printed `whsec_...` into Vercel `STRIPE_WEBHOOK_SECRET` (Production + Preview) if it changed, then redeploy.

Permanent option after claiming the sandbox: Dashboard → Webhooks →  
`https://ratequip-web.vercel.app/api/webhooks/stripe`  
Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`

## Automated smoke (production)

```bash
npm run stripe:listen   # terminal 1 — required for real Checkout events
npm run stripe:uat-smoke
```

Covers: Premium subscription charge (tok_visa/4242) → webhook on production → credit pack charge → RFQ −25 → refund → session net → hosted Checkout URL with production success/cancel URLs.

## Manual browser UAT (Step 8) on production

1. Open https://ratequip-web.vercel.app and sign in as buyer
2. https://ratequip-web.vercel.app/dashboard/buyer/billing — note wallet
3. **Upgrade to Premium** → Stripe Checkout → `4242 4242 4242 4242`
4. Return to billing `?success=1` — plan active, **+100** credits
5. Create an RFQ → **−25** debit
6. Buy credit pack → pack credits
7. Refund / reconcile → ledger balances
8. Optional: Stripe portal / Cancel

Decline card: `4000 0000 0000 0002`. Never use live cards in Test mode.

## npm scripts

```bash
npm run stripe:setup      # create/list Test Mode price IDs
npm run stripe:listen     # forward webhooks to production
npm run stripe:uat-smoke  # automated Test Mode smoke vs production
```
