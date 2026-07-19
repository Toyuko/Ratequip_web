-- RateQuip V12.2 Add-On 02 / Part 5
-- Delta migration; apply after 0023 and Part 4 migrations.
BEGIN;
CREATE SCHEMA IF NOT EXISTS rq_intelligence;
CREATE SCHEMA IF NOT EXISTS rq_ecosystem;
CREATE SCHEMA IF NOT EXISTS rq_marketplace_ext;
CREATE INDEX IF NOT EXISTS idx_clause_document_page ON rq_intelligence.intelligence_document_clause(document_version_id,page_number);
CREATE INDEX IF NOT EXISTS idx_req_run_class ON rq_intelligence.intelligence_extracted_requirement(analysis_run_id,classification);
CREATE INDEX IF NOT EXISTS idx_node_graph_type ON rq_ecosystem.project_ecosystem_node(graph_version_id,node_type);
CREATE INDEX IF NOT EXISTS idx_edge_graph_relation ON rq_ecosystem.project_ecosystem_edge(graph_version_id,relationship_type);
CREATE INDEX IF NOT EXISTS idx_wp_project_status ON rq_ecosystem.project_work_package(project_id,status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_confirmation_subject ON rq_intelligence.intelligence_confirmation(company_id,subject_type,subject_id,confirmation_type) WHERE deleted_at IS NULL;
COMMIT;
