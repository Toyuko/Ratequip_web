# Identifier Collision Resolution

| Package | Corrected feature range | Corrected migrations | Corrected ADRs |
|---|---:|---|---|
| Part 4 | 141-160 | 0024-0028 (app: **0030-0034**) | ADR-0039-ADR-0048 |
| Part 5 | 161-185 | 0029-0035 (app: **0024-0029**) | ADR-0049-ADR-0062 |
| Part 6 | provisional 186-190 (6A) | local 0001-0006 (app: **0035-0040**, schema `catalog_factory`) | (none in source pack) |

The Part 5 source report originally reused Part 4 identifiers because Part 4 was absent. Part 6 ships its own `0001–0006` filenames — **never copy those names into `drizzle/v12/`** without remapping.
