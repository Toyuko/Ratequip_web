# Authoritative V12 Charter

## Mission
RateQuip is an industrial operating network connecting discovery, procurement, project delivery, service, asset lifecycle and commercial ecosystem services. V12 converts prior architecture into versioned, testable contracts.

## Product invariants
1. Relevance before volume.
2. Value before monetisation.
3. Structured records with flexible evidence.
4. Privacy and company boundaries enforced server-side.
5. Human approval for consequential AI output.
6. Lifecycle continuity: an awarded requirement can become a project, asset, maintenance record and repeat demand signal.
7. Transparent economics: price, credit or entitlement impact is displayed before commitment.
8. Explainability: matching, recommendations, trust and risk decisions expose reason codes.

## Architectural style
- Modular domain architecture with explicit bounded contexts.
- PostgreSQL as transactional system of record; object storage for binary evidence.
- Event outbox for reliable publication.
- Search index and graph projection are rebuildable read models.
- OpenAPI 3.1 is the external contract; internal event schemas are versioned JSON Schema.
- Policy-as-code for RBAC, ABAC and record-level authorization.
- Tenant context is explicit on every protected request.

## Delivery rule
A domain is not complete until schema, API, events, screens, permissions, observability, migrations, tests, acceptance criteria and operational runbooks are present.
