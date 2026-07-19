-- V12 Part 1 migration 0001: extensions, schemas, common functions
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE SCHEMA IF NOT EXISTS rq;
CREATE SCHEMA IF NOT EXISTS rq_audit;
CREATE SCHEMA IF NOT EXISTS rq_outbox;

CREATE OR REPLACE FUNCTION rq.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE IF NOT EXISTS rq.schema_migrations (
  version text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  execution_ms integer,
  applied_by text NOT NULL DEFAULT current_user
);
COMMIT;
