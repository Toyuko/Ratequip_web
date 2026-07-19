-- Part 2 operational read models. Refresh concurrently through jobs; never treat as commercial source of truth.
BEGIN;
CREATE MATERIALIZED VIEW IF NOT EXISTS rq.mv_open_commercial_work AS
SELECT company_id, 'rfq'::text AS kind, id, status, updated_at FROM rq.rfqs WHERE deleted_at IS NULL AND status NOT IN ('closed','cancelled')
UNION ALL SELECT company_id, 'purchase_order', id, status, updated_at FROM rq.purchase_orders WHERE deleted_at IS NULL AND status NOT IN ('completed','cancelled');
CREATE UNIQUE INDEX IF NOT EXISTS ux_mv_open_commercial_work ON rq.mv_open_commercial_work(kind,id);
CREATE MATERIALIZED VIEW IF NOT EXISTS rq.mv_asset_service_summary AS
SELECT a.company_id,a.id AS asset_id,count(s.id) AS service_count,max(s.updated_at) AS last_service_at
FROM rq.assets a LEFT JOIN rq.asset_service_records s ON s.data->>'assetId'=a.id::text GROUP BY a.company_id,a.id;
CREATE UNIQUE INDEX IF NOT EXISTS ux_mv_asset_service_summary ON rq.mv_asset_service_summary(asset_id);
COMMIT;
