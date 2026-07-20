# Part 4 Schema Reference

The five migrations add exactly 32 additive tenant-scoped entities:

- Release management: 5
- Entitlement accounting: 6
- Support privacy: 4
- Growth governance: 7
- Pilot operations: 10

All tenant-scoped tables enable PostgreSQL RLS and use `app.tenant_id`. Production deployment must also set `FORCE ROW LEVEL SECURITY` after validating privileged maintenance roles.
