-- V12 Part 2 migration 0010: engagement_marketplaces

BEGIN;

CREATE TABLE IF NOT EXISTS rq.advertisers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_advertisers_company_status ON rq.advertisers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_advertisers_data_gin ON rq.advertisers USING gin(data);

DROP TRIGGER IF EXISTS trg_advertisers_updated_at ON rq.advertisers; CREATE TRIGGER trg_advertisers_updated_at BEFORE UPDATE ON rq.advertisers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.advertising_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_advertising_accounts_company_status ON rq.advertising_accounts(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_advertising_accounts_data_gin ON rq.advertising_accounts USING gin(data);

DROP TRIGGER IF EXISTS trg_advertising_accounts_updated_at ON rq.advertising_accounts; CREATE TRIGGER trg_advertising_accounts_updated_at BEFORE UPDATE ON rq.advertising_accounts FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_campaigns_company_status ON rq.campaigns(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_campaigns_data_gin ON rq.campaigns USING gin(data);

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON rq.campaigns; CREATE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON rq.campaigns FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.ad_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_ad_groups_company_status ON rq.ad_groups(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_ad_groups_data_gin ON rq.ad_groups USING gin(data);

DROP TRIGGER IF EXISTS trg_ad_groups_updated_at ON rq.ad_groups; CREATE TRIGGER trg_ad_groups_updated_at BEFORE UPDATE ON rq.ad_groups FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_ad_creatives_company_status ON rq.ad_creatives(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_ad_creatives_data_gin ON rq.ad_creatives USING gin(data);

DROP TRIGGER IF EXISTS trg_ad_creatives_updated_at ON rq.ad_creatives; CREATE TRIGGER trg_ad_creatives_updated_at BEFORE UPDATE ON rq.ad_creatives FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.targeting_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_targeting_rules_company_status ON rq.targeting_rules(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_targeting_rules_data_gin ON rq.targeting_rules USING gin(data);

DROP TRIGGER IF EXISTS trg_targeting_rules_updated_at ON rq.targeting_rules; CREATE TRIGGER trg_targeting_rules_updated_at BEFORE UPDATE ON rq.targeting_rules FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.ad_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_ad_placements_company_status ON rq.ad_placements(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_ad_placements_data_gin ON rq.ad_placements USING gin(data);

DROP TRIGGER IF EXISTS trg_ad_placements_updated_at ON rq.ad_placements; CREATE TRIGGER trg_ad_placements_updated_at BEFORE UPDATE ON rq.ad_placements FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.ad_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_ad_impressions_company_status ON rq.ad_impressions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_ad_impressions_data_gin ON rq.ad_impressions USING gin(data);

DROP TRIGGER IF EXISTS trg_ad_impressions_updated_at ON rq.ad_impressions; CREATE TRIGGER trg_ad_impressions_updated_at BEFORE UPDATE ON rq.ad_impressions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.ad_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_ad_clicks_company_status ON rq.ad_clicks(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_ad_clicks_data_gin ON rq.ad_clicks USING gin(data);

DROP TRIGGER IF EXISTS trg_ad_clicks_updated_at ON rq.ad_clicks; CREATE TRIGGER trg_ad_clicks_updated_at BEFORE UPDATE ON rq.ad_clicks FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.ad_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_ad_conversions_company_status ON rq.ad_conversions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_ad_conversions_data_gin ON rq.ad_conversions USING gin(data);

DROP TRIGGER IF EXISTS trg_ad_conversions_updated_at ON rq.ad_conversions; CREATE TRIGGER trg_ad_conversions_updated_at BEFORE UPDATE ON rq.ad_conversions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.ad_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_ad_budgets_company_status ON rq.ad_budgets(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_ad_budgets_data_gin ON rq.ad_budgets USING gin(data);

DROP TRIGGER IF EXISTS trg_ad_budgets_updated_at ON rq.ad_budgets; CREATE TRIGGER trg_ad_budgets_updated_at BEFORE UPDATE ON rq.ad_budgets FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.quality_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_quality_scores_company_status ON rq.quality_scores(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_quality_scores_data_gin ON rq.quality_scores USING gin(data);

DROP TRIGGER IF EXISTS trg_quality_scores_updated_at ON rq.quality_scores; CREATE TRIGGER trg_quality_scores_updated_at BEFORE UPDATE ON rq.quality_scores FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.community_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_community_profiles_company_status ON rq.community_profiles(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_community_profiles_data_gin ON rq.community_profiles USING gin(data);

DROP TRIGGER IF EXISTS trg_community_profiles_updated_at ON rq.community_profiles; CREATE TRIGGER trg_community_profiles_updated_at BEFORE UPDATE ON rq.community_profiles FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_follows_company_status ON rq.follows(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_follows_data_gin ON rq.follows USING gin(data);

DROP TRIGGER IF EXISTS trg_follows_updated_at ON rq.follows; CREATE TRIGGER trg_follows_updated_at BEFORE UPDATE ON rq.follows FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_posts_company_status ON rq.posts(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_posts_data_gin ON rq.posts USING gin(data);

DROP TRIGGER IF EXISTS trg_posts_updated_at ON rq.posts; CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON rq.posts FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.post_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_post_versions_company_status ON rq.post_versions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_post_versions_data_gin ON rq.post_versions USING gin(data);

DROP TRIGGER IF EXISTS trg_post_versions_updated_at ON rq.post_versions; CREATE TRIGGER trg_post_versions_updated_at BEFORE UPDATE ON rq.post_versions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_media_items_company_status ON rq.media_items(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_media_items_data_gin ON rq.media_items USING gin(data);

DROP TRIGGER IF EXISTS trg_media_items_updated_at ON rq.media_items; CREATE TRIGGER trg_media_items_updated_at BEFORE UPDATE ON rq.media_items FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_comments_company_status ON rq.comments(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_comments_data_gin ON rq.comments USING gin(data);

DROP TRIGGER IF EXISTS trg_comments_updated_at ON rq.comments; CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON rq.comments FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_reactions_company_status ON rq.reactions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_reactions_data_gin ON rq.reactions USING gin(data);

DROP TRIGGER IF EXISTS trg_reactions_updated_at ON rq.reactions; CREATE TRIGGER trg_reactions_updated_at BEFORE UPDATE ON rq.reactions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_communities_company_status ON rq.communities(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_communities_data_gin ON rq.communities USING gin(data);

DROP TRIGGER IF EXISTS trg_communities_updated_at ON rq.communities; CREATE TRIGGER trg_communities_updated_at BEFORE UPDATE ON rq.communities FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.community_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_community_memberships_company_status ON rq.community_memberships(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_community_memberships_data_gin ON rq.community_memberships USING gin(data);

DROP TRIGGER IF EXISTS trg_community_memberships_updated_at ON rq.community_memberships; CREATE TRIGGER trg_community_memberships_updated_at BEFORE UPDATE ON rq.community_memberships FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.moderation_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_moderation_cases_company_status ON rq.moderation_cases(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_moderation_cases_data_gin ON rq.moderation_cases USING gin(data);

DROP TRIGGER IF EXISTS trg_moderation_cases_updated_at ON rq.moderation_cases; CREATE TRIGGER trg_moderation_cases_updated_at BEFORE UPDATE ON rq.moderation_cases FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_content_reports_company_status ON rq.content_reports(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_content_reports_data_gin ON rq.content_reports USING gin(data);

DROP TRIGGER IF EXISTS trg_content_reports_updated_at ON rq.content_reports; CREATE TRIGGER trg_content_reports_updated_at BEFORE UPDATE ON rq.content_reports FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.academy_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_academy_providers_company_status ON rq.academy_providers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_academy_providers_data_gin ON rq.academy_providers USING gin(data);

DROP TRIGGER IF EXISTS trg_academy_providers_updated_at ON rq.academy_providers; CREATE TRIGGER trg_academy_providers_updated_at BEFORE UPDATE ON rq.academy_providers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_courses_company_status ON rq.courses(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_courses_data_gin ON rq.courses USING gin(data);

DROP TRIGGER IF EXISTS trg_courses_updated_at ON rq.courses; CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON rq.courses FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.course_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_course_versions_company_status ON rq.course_versions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_course_versions_data_gin ON rq.course_versions USING gin(data);

DROP TRIGGER IF EXISTS trg_course_versions_updated_at ON rq.course_versions; CREATE TRIGGER trg_course_versions_updated_at BEFORE UPDATE ON rq.course_versions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_learning_modules_company_status ON rq.learning_modules(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_learning_modules_data_gin ON rq.learning_modules USING gin(data);

DROP TRIGGER IF EXISTS trg_learning_modules_updated_at ON rq.learning_modules; CREATE TRIGGER trg_learning_modules_updated_at BEFORE UPDATE ON rq.learning_modules FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.enrolments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_enrolments_company_status ON rq.enrolments(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_enrolments_data_gin ON rq.enrolments USING gin(data);

DROP TRIGGER IF EXISTS trg_enrolments_updated_at ON rq.enrolments; CREATE TRIGGER trg_enrolments_updated_at BEFORE UPDATE ON rq.enrolments FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_learning_progress_company_status ON rq.learning_progress(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_learning_progress_data_gin ON rq.learning_progress USING gin(data);

DROP TRIGGER IF EXISTS trg_learning_progress_updated_at ON rq.learning_progress; CREATE TRIGGER trg_learning_progress_updated_at BEFORE UPDATE ON rq.learning_progress FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_assessments_company_status ON rq.assessments(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_assessments_data_gin ON rq.assessments USING gin(data);

DROP TRIGGER IF EXISTS trg_assessments_updated_at ON rq.assessments; CREATE TRIGGER trg_assessments_updated_at BEFORE UPDATE ON rq.assessments FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_assessment_attempts_company_status ON rq.assessment_attempts(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_assessment_attempts_data_gin ON rq.assessment_attempts USING gin(data);

DROP TRIGGER IF EXISTS trg_assessment_attempts_updated_at ON rq.assessment_attempts; CREATE TRIGGER trg_assessment_attempts_updated_at BEFORE UPDATE ON rq.assessment_attempts FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_credentials_company_status ON rq.credentials(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_credentials_data_gin ON rq.credentials USING gin(data);

DROP TRIGGER IF EXISTS trg_credentials_updated_at ON rq.credentials; CREATE TRIGGER trg_credentials_updated_at BEFORE UPDATE ON rq.credentials FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.credential_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_credential_verifications_company_status ON rq.credential_verifications(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_credential_verifications_data_gin ON rq.credential_verifications USING gin(data);

DROP TRIGGER IF EXISTS trg_credential_verifications_updated_at ON rq.credential_verifications; CREATE TRIGGER trg_credential_verifications_updated_at BEFORE UPDATE ON rq.credential_verifications FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.cpd_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_cpd_records_company_status ON rq.cpd_records(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_cpd_records_data_gin ON rq.cpd_records USING gin(data);

DROP TRIGGER IF EXISTS trg_cpd_records_updated_at ON rq.cpd_records; CREATE TRIGGER trg_cpd_records_updated_at BEFORE UPDATE ON rq.cpd_records FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.event_organisers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_event_organisers_company_status ON rq.event_organisers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_event_organisers_data_gin ON rq.event_organisers USING gin(data);

DROP TRIGGER IF EXISTS trg_event_organisers_updated_at ON rq.event_organisers; CREATE TRIGGER trg_event_organisers_updated_at BEFORE UPDATE ON rq.event_organisers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_events_company_status ON rq.events(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_events_data_gin ON rq.events USING gin(data);

DROP TRIGGER IF EXISTS trg_events_updated_at ON rq.events; CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON rq.events FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.event_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_event_sessions_company_status ON rq.event_sessions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_event_sessions_data_gin ON rq.event_sessions USING gin(data);

DROP TRIGGER IF EXISTS trg_event_sessions_updated_at ON rq.event_sessions; CREATE TRIGGER trg_event_sessions_updated_at BEFORE UPDATE ON rq.event_sessions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_venues_company_status ON rq.venues(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_venues_data_gin ON rq.venues USING gin(data);

DROP TRIGGER IF EXISTS trg_venues_updated_at ON rq.venues; CREATE TRIGGER trg_venues_updated_at BEFORE UPDATE ON rq.venues FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.event_exhibitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_event_exhibitors_company_status ON rq.event_exhibitors(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_event_exhibitors_data_gin ON rq.event_exhibitors USING gin(data);

DROP TRIGGER IF EXISTS trg_event_exhibitors_updated_at ON rq.event_exhibitors; CREATE TRIGGER trg_event_exhibitors_updated_at BEFORE UPDATE ON rq.event_exhibitors FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.event_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_event_sponsors_company_status ON rq.event_sponsors(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_event_sponsors_data_gin ON rq.event_sponsors USING gin(data);

DROP TRIGGER IF EXISTS trg_event_sponsors_updated_at ON rq.event_sponsors; CREATE TRIGGER trg_event_sponsors_updated_at BEFORE UPDATE ON rq.event_sponsors FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_event_registrations_company_status ON rq.event_registrations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_event_registrations_data_gin ON rq.event_registrations USING gin(data);

DROP TRIGGER IF EXISTS trg_event_registrations_updated_at ON rq.event_registrations; CREATE TRIGGER trg_event_registrations_updated_at BEFORE UPDATE ON rq.event_registrations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.event_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_event_tickets_company_status ON rq.event_tickets(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_event_tickets_data_gin ON rq.event_tickets USING gin(data);

DROP TRIGGER IF EXISTS trg_event_tickets_updated_at ON rq.event_tickets; CREATE TRIGGER trg_event_tickets_updated_at BEFORE UPDATE ON rq.event_tickets FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_attendance_records_company_status ON rq.attendance_records(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_attendance_records_data_gin ON rq.attendance_records USING gin(data);

DROP TRIGGER IF EXISTS trg_attendance_records_updated_at ON rq.attendance_records; CREATE TRIGGER trg_attendance_records_updated_at BEFORE UPDATE ON rq.attendance_records FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.event_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_event_leads_company_status ON rq.event_leads(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_event_leads_data_gin ON rq.event_leads USING gin(data);

DROP TRIGGER IF EXISTS trg_event_leads_updated_at ON rq.event_leads; CREATE TRIGGER trg_event_leads_updated_at BEFORE UPDATE ON rq.event_leads FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.event_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_event_feedback_company_status ON rq.event_feedback(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_event_feedback_data_gin ON rq.event_feedback USING gin(data);

DROP TRIGGER IF EXISTS trg_event_feedback_updated_at ON rq.event_feedback; CREATE TRIGGER trg_event_feedback_updated_at BEFORE UPDATE ON rq.event_feedback FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

COMMIT;
