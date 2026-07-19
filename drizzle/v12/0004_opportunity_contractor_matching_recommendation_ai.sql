-- V12 Part 1 migration 0004: opportunity, contractor, matching, recommendations and AI
BEGIN;
CREATE TABLE rq.opportunity_profiles (
 company_id uuid PRIMARY KEY REFERENCES rq.companies(id), status text NOT NULL DEFAULT 'draft', target_industries uuid[] NOT NULL DEFAULT '{}',
 target_company_types text[] NOT NULL DEFAULT '{}', target_regions jsonb NOT NULL DEFAULT '[]', project_value_min numeric(18,2), project_value_max numeric(18,2),
 currency char(3), preferred_requirement_types text[] NOT NULL DEFAULT '{}', lead_time_profile jsonb NOT NULL DEFAULT '{}', capacity_profile jsonb NOT NULL DEFAULT '{}',
 private_preferences jsonb NOT NULL DEFAULT '{}', published_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1
);
CREATE TABLE rq.contractor_profiles (
 company_id uuid PRIMARY KEY REFERENCES rq.companies(id), status text NOT NULL DEFAULT 'draft', service_radius jsonb NOT NULL DEFAULT '{}',
 work_preferences jsonb NOT NULL DEFAULT '{}', rate_summary jsonb NOT NULL DEFAULT '{}', emergency_available boolean NOT NULL DEFAULT false,
 fifo_available boolean NOT NULL DEFAULT false, roster jsonb NOT NULL DEFAULT '{}', owned_equipment jsonb NOT NULL DEFAULT '[]', updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rq.contractor_licences (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES rq.companies(id), licence_node_id uuid NOT NULL REFERENCES rq.taxonomy_nodes(id),
 licence_number_ciphertext bytea, jurisdiction text, issued_at date, expires_at date, status text NOT NULL DEFAULT 'pending', evidence_ref text,
 UNIQUE(company_id,licence_node_id,jurisdiction)
);
CREATE TABLE rq.match_policies (
 id text NOT NULL, version integer NOT NULL, name text NOT NULL, target_type text NOT NULL, eligibility_rules jsonb NOT NULL,
 feature_weights jsonb NOT NULL, thresholds jsonb NOT NULL, status text NOT NULL DEFAULT 'draft', published_at timestamptz, PRIMARY KEY(id,version)
);
CREATE TABLE rq.match_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), requester_company_id uuid REFERENCES rq.companies(id), request_type text NOT NULL,
 target_ref_type text NOT NULL, target_ref_id uuid NOT NULL, policy_id text NOT NULL, policy_version integer NOT NULL, context_snapshot jsonb NOT NULL,
 status text NOT NULL DEFAULT 'queued', created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 FOREIGN KEY(policy_id,policy_version) REFERENCES rq.match_policies(id,version)
);
CREATE TABLE rq.match_results (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), match_request_id uuid NOT NULL REFERENCES rq.match_requests(id) ON DELETE CASCADE,
 candidate_type text NOT NULL, candidate_id uuid NOT NULL, eligible boolean NOT NULL, score numeric(6,3), confidence numeric(5,4),
 feature_ledger jsonb NOT NULL DEFAULT '[]', reason_codes text[] NOT NULL DEFAULT '{}', exclusion_codes text[] NOT NULL DEFAULT '{}', rank integer,
 UNIQUE(match_request_id,candidate_type,candidate_id)
);
CREATE TABLE rq.match_feedback (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), match_result_id uuid REFERENCES rq.match_results(id), actor_user_id uuid REFERENCES rq.users(id),
 scope_type text NOT NULL, scope_id uuid, signal text NOT NULL, reason_code text, metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rq.recommendation_sets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES rq.users(id), company_id uuid REFERENCES rq.companies(id), site_id uuid REFERENCES rq.sites(id),
 lane text NOT NULL, policy_version text NOT NULL, context_snapshot jsonb NOT NULL, random_seed bigint, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz
);
CREATE TABLE rq.recommendation_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), set_id uuid NOT NULL REFERENCES rq.recommendation_sets(id) ON DELETE CASCADE,
 item_type text NOT NULL, item_id uuid NOT NULL, organic_score numeric(6,3) NOT NULL, final_rank integer NOT NULL, sponsored boolean NOT NULL DEFAULT false,
 reason_codes text[] NOT NULL DEFAULT '{}', match_result_id uuid REFERENCES rq.match_results(id), UNIQUE(set_id,final_rank)
);
CREATE TABLE rq.recommendation_exposures (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), recommendation_item_id uuid NOT NULL REFERENCES rq.recommendation_items(id) ON DELETE CASCADE,
 user_id uuid REFERENCES rq.users(id), event_type text NOT NULL CHECK(event_type IN ('impression','open','save','hide','dismiss','contact','convert')),
 metadata jsonb NOT NULL DEFAULT '{}', occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rq.ai_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid REFERENCES rq.companies(id), requested_by uuid REFERENCES rq.users(id),
 job_type text NOT NULL, status text NOT NULL CHECK(status IN ('queued','running','completed','failed','cancelled','confirmation_required')),
 input_refs jsonb NOT NULL DEFAULT '[]', policy_snapshot jsonb NOT NULL, model_descriptor jsonb NOT NULL, started_at timestamptz, completed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rq.ai_output_drafts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), ai_job_id uuid NOT NULL REFERENCES rq.ai_jobs(id) ON DELETE CASCADE, output_type text NOT NULL,
 content jsonb NOT NULL, citations jsonb NOT NULL DEFAULT '[]', uncertainty jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'draft',
 confirmed_by uuid REFERENCES rq.users(id), confirmed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_match_results_rank ON rq.match_results(match_request_id,eligible,rank);
CREATE INDEX idx_recommendation_lane ON rq.recommendation_sets(company_id,lane,created_at DESC);
CREATE INDEX idx_ai_jobs_company ON rq.ai_jobs(company_id,created_at DESC);
COMMIT;
