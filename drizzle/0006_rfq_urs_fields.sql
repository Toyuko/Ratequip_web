-- URS-inspired RFQ fields and quote compliance response.
-- Apply via: npm run db:push (preferred) or run this SQL on Neon.

alter table requests
  add column if not exists reference_model varchar(255),
  add column if not exists compliance_standards jsonb default '[]'::jsonb,
  add column if not exists material_of_construction text,
  add column if not exists utilities_notes text,
  add column if not exists warranty_months_required integer,
  add column if not exists delivery_weeks_required integer,
  add column if not exists scope_of_supply jsonb default '[]'::jsonb,
  add column if not exists technical_requirements jsonb default '[]'::jsonb;

alter table quotes
  add column if not exists meets_requirements boolean not null default true,
  add column if not exists deviations text;
