-- Structured RFQ fields: commercial terms, ship-to, line items, quote availability.
-- Apply via: npm run db:push (preferred) or run this SQL on Neon.

do $$ begin
  create type tax_treatment as enum ('inclusive', 'exclusive');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type stock_availability as enum ('in_stock', 'on_order', 'unavailable');
exception
  when duplicate_object then null;
end $$;

alter table requests
  add column if not exists tax_treatment tax_treatment not null default 'inclusive',
  add column if not exists quote_validity_days integer not null default 30,
  add column if not exists delivery_city varchar(120),
  add column if not exists delivery_address text;

create table if not exists request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  product_name varchar(255) not null,
  product_code varchar(128),
  quantity integer not null default 1,
  unit varchar(32),
  oem_only boolean not null default false,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists request_items_request_id_idx on request_items (request_id);

alter table quotes
  add column if not exists delivery_period_days integer,
  add column if not exists stock_availability stock_availability;
