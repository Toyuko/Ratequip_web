# READ ME FIRST

**Repository:** RateQuip Enterprise Master Repository V12.1 - Add-On 01 / Part 4  
**Release:** `12.1.0-addon.1-part4`  
**Predecessor:** `12.0.0-part3`  
**Distribution:** Delta-only overlay, now integrated into the consolidated V12 master  
**Prepared:** 2026-07-20

## Purpose
Part 4 adds deterministic add-on release management, transparent entitlement and usage protection, privacy-preserving support, governed company import and claim campaigns, taxonomy and question simulation, and a controlled Australian food manufacturing and packaging pilot.

## Canonical identifier allocation
- Features: **141-160**
- Migrations: **0024-0028**
- ADRs: **ADR-0039-ADR-0048**
- UI screens: **17**
- Additive entities: **32**

## Safety boundaries
No chargeable action starts without a policy-required preview and confirmation. No support content is accessed without scoped consent. No inferred contact is labelled verified. No claim campaign bypasses suppression. No pilot feature is globally enabled without evidence and approval.

## Integration outcome
This module is inserted between the V12 Part 3 foundation and V12 Part 5. Part 5 identifiers were shifted to remove the collision caused by the previously missing Part 4 package.
