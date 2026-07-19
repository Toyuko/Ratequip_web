-- V12 Part 1 migration 0003: taxonomy, questions, capability and knowledge graph
BEGIN;
CREATE TABLE rq.taxonomy_schemes (
 id text PRIMARY KEY, name text NOT NULL, description text, current_release integer NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'active'
);
CREATE TABLE rq.taxonomy_releases (
 scheme_id text NOT NULL REFERENCES rq.taxonomy_schemes(id), release integer NOT NULL, status text NOT NULL CHECK(status IN ('draft','published','withdrawn')),
 published_at timestamptz, checksum text, PRIMARY KEY(scheme_id,release)
);
CREATE TABLE rq.taxonomy_nodes (
 id uuid PRIMARY KEY, stable_key text UNIQUE NOT NULL, scheme_id text NOT NULL REFERENCES rq.taxonomy_schemes(id), node_type text NOT NULL,
 status text NOT NULL CHECK(status IN ('draft','published','deprecated','retired')) DEFAULT 'draft', visibility text NOT NULL DEFAULT 'public',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rq.taxonomy_node_versions (
 node_id uuid NOT NULL REFERENCES rq.taxonomy_nodes(id) ON DELETE CASCADE, version integer NOT NULL, preferred_label text NOT NULL,
 description text, locale text NOT NULL DEFAULT 'en', search_weight numeric(6,3) NOT NULL DEFAULT 1, ai_keywords text[] NOT NULL DEFAULT '{}',
 metadata jsonb NOT NULL DEFAULT '{}', valid_from timestamptz NOT NULL DEFAULT now(), valid_to timestamptz, PRIMARY KEY(node_id,version,locale)
);
CREATE TABLE rq.taxonomy_labels (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), node_id uuid NOT NULL REFERENCES rq.taxonomy_nodes(id) ON DELETE CASCADE,
 locale text NOT NULL, region_code text, label text NOT NULL, label_type text NOT NULL CHECK(label_type IN ('preferred','synonym','alias','regional','acronym','misspelling')),
 search_weight numeric(6,3) NOT NULL DEFAULT 1, UNIQUE(node_id,locale,region_code,label,label_type)
);
CREATE TABLE rq.taxonomy_edges (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), from_node_id uuid NOT NULL REFERENCES rq.taxonomy_nodes(id), to_node_id uuid NOT NULL REFERENCES rq.taxonomy_nodes(id),
 edge_type text NOT NULL, status text NOT NULL DEFAULT 'published', confidence numeric(5,4) NOT NULL DEFAULT 1, evidence jsonb NOT NULL DEFAULT '{}',
 valid_from timestamptz NOT NULL DEFAULT now(), valid_to timestamptz, UNIQUE(from_node_id,to_node_id,edge_type,valid_from)
);
CREATE TABLE rq.taxonomy_deprecations (
 node_id uuid PRIMARY KEY REFERENCES rq.taxonomy_nodes(id), replacement_node_id uuid REFERENCES rq.taxonomy_nodes(id), reason text NOT NULL, effective_at timestamptz NOT NULL
);
CREATE TABLE rq.other_entry_mapping_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid REFERENCES rq.companies(id), submitted_by uuid REFERENCES rq.users(id),
 raw_value text NOT NULL, context jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'pending', mapped_node_id uuid REFERENCES rq.taxonomy_nodes(id),
 created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz
);
CREATE TABLE rq.question_packs (
 id text NOT NULL, version integer NOT NULL, name text NOT NULL, scope jsonb NOT NULL, status text NOT NULL CHECK(status IN ('draft','published','retired')),
 checksum text, published_at timestamptz, PRIMARY KEY(id,version)
);
CREATE TABLE rq.question_definitions (
 id text NOT NULL, version integer NOT NULL, pack_id text NOT NULL, pack_version integer NOT NULL, prompt text NOT NULL, help_text text,
 answer_type text NOT NULL, answer_schema jsonb NOT NULL, visibility_rule jsonb NOT NULL DEFAULT '{}', required_rule jsonb NOT NULL DEFAULT '{}',
 dependency_ids text[] NOT NULL DEFAULT '{}', consequence_map jsonb NOT NULL DEFAULT '{}', sensitivity text NOT NULL DEFAULT 'internal', display_order integer NOT NULL,
 PRIMARY KEY(id,version), FOREIGN KEY(pack_id,pack_version) REFERENCES rq.question_packs(id,version)
);
CREATE TABLE rq.question_resolution_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES rq.users(id), company_id uuid REFERENCES rq.companies(id), site_id uuid REFERENCES rq.sites(id),
 context jsonb NOT NULL, configuration_snapshot jsonb NOT NULL, status text NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz
);
CREATE TABLE rq.answers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), resolution_session_id uuid NOT NULL REFERENCES rq.question_resolution_sessions(id) ON DELETE CASCADE,
 question_id text NOT NULL, question_version integer NOT NULL, scope_type text NOT NULL, scope_id uuid, value jsonb NOT NULL, source text NOT NULL,
 confirmed_by_user boolean NOT NULL DEFAULT true, visibility text NOT NULL DEFAULT 'private', updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(question_id,question_version) REFERENCES rq.question_definitions(id,version), UNIQUE(resolution_session_id,question_id,scope_type,scope_id)
);
CREATE TABLE rq.capability_definitions (
 id uuid PRIMARY KEY, stable_key text UNIQUE NOT NULL, action_node_id uuid NOT NULL REFERENCES rq.taxonomy_nodes(id), object_node_id uuid REFERENCES rq.taxonomy_nodes(id),
 constraints_schema jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'published'
);
CREATE TABLE rq.capability_assertions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES rq.companies(id), site_id uuid REFERENCES rq.sites(id),
 capability_id uuid NOT NULL REFERENCES rq.capability_definitions(id), subject_constraints jsonb NOT NULL DEFAULT '{}', verification_status text NOT NULL DEFAULT 'self_declared',
 confidence numeric(5,4) NOT NULL DEFAULT 0.6, public_visibility boolean NOT NULL DEFAULT true, valid_from date, valid_to date,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rq.capability_evidence (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), assertion_id uuid NOT NULL REFERENCES rq.capability_assertions(id) ON DELETE CASCADE,
 evidence_type text NOT NULL, object_ref text NOT NULL, status text NOT NULL DEFAULT 'pending', issued_at date, expires_at date, reviewed_by uuid REFERENCES rq.users(id)
);
CREATE TABLE rq.graph_assertions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), subject_type text NOT NULL, subject_id uuid NOT NULL, predicate text NOT NULL,
 object_type text NOT NULL, object_id uuid NOT NULL, source_type text NOT NULL, source_id uuid, visibility text NOT NULL DEFAULT 'private',
 confidence numeric(5,4) NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'active', valid_from timestamptz NOT NULL DEFAULT now(), valid_to timestamptz
);
CREATE INDEX idx_taxonomy_labels_trgm ON rq.taxonomy_labels USING gin(label gin_trgm_ops);
CREATE INDEX idx_taxonomy_edges_from ON rq.taxonomy_edges(from_node_id,edge_type);
CREATE INDEX idx_taxonomy_edges_to ON rq.taxonomy_edges(to_node_id,edge_type);
CREATE INDEX idx_capability_company ON rq.capability_assertions(company_id,capability_id,verification_status);
CREATE INDEX idx_graph_subject ON rq.graph_assertions(subject_type,subject_id,predicate);
CREATE INDEX idx_graph_object ON rq.graph_assertions(object_type,object_id,predicate);
COMMIT;
