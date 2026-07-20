# Part 5 (V12.2 Add-On 02) Prioritised Backlog

Delta Features 161–185 / migrations 0024–0029. Install after Part 3 (and Part 4 where present).

## Release 5A — document intelligence & requirement ledger
URS/RFQ upload → clause extraction → evidence-linked requirements → confirm/reject → gaps & questions.
Domains 66, 67, 70. Migration `0024` (+ RLS from `0028`).

**Status in web app:** thin slice landed — `/v12/requirement-ledger`, `/api/v1/v12/intelligence/ledger`, migration `0024`–`0029` in `drizzle/v12/`.

## Release 5B — project ecosystem & work packages
Graph, adjacency, work packages, interfaces, options/TCO/schedule (Domains 68–74). Migrations `0025`–`0026`.

## Release 5C — operating profile & extended marketplaces
Business operating profile + workforce/lab/freight/capacity/innovation (Domains 75–80). Migration `0027`.

## Release 5D — hardening
Full RLS/outbox (`0028`), projections (`0029`), disclosure grants, workspace bootstrap, analytics.

## Known gaps from prior repositories
- Part 3 migrations `0015`–`0023` (3B–3F) not product-landed — schema contracts deferred.
- Part 4 landed (app `0030–0034`). Feature IDs for Part 5 product surface are **161–185**.
