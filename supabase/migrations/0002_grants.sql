-- Newer Supabase projects do not auto-grant table privileges to API roles.
-- RLS (0001) still restricts every row to its owner; this only lets the role reach the tables.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
