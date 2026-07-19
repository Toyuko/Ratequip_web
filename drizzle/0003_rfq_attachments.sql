-- Optional RFQ document/photo attachment columns.
-- Apply via: npm run db:push (preferred) or run this SQL on Neon.

alter table requests
  add column if not exists attachment_url text,
  add column if not exists attachment_name varchar(255),
  add column if not exists attachment_mime_type varchar(128);
