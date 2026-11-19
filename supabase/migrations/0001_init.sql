-- AVEN initial schema (PROPOSAL for review; not yet applied anywhere)
-- Every user-owned table: user_id default auth.uid() + RLS user_id = auth.uid().
create extension if not exists "pgcrypto";
create extension if not exists vector;

-- ---------- profiles ----------
create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text,
  timezone text not null default 'Asia/Kolkata',
  locale text not null default 'en-IN',
  week_starts_on smallint not null default 1,           -- 1 = Monday (open decision)
  autonomy jsonb not null default '{}'::jsonb,           -- per-tool autonomy overrides
  ai_access jsonb not null default '{"tasks":true,"notes":true,"memory":true,"finance":false}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- planning ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null check (length(title) between 1 and 200),
  description text,
  category text,
  status text not null default 'active' check (status in ('active','on_hold','completed','archived')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  phone text, email text, notes text,
  birthday date, anniversary date,
  last_interaction_at timestamptz, last_interaction_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  project_id uuid references projects on delete set null,
  parent_task_id uuid references tasks on delete cascade,      -- subtasks
  title text not null check (length(title) between 1 and 300),
  notes text,
  status text not null default 'todo' check (status in ('todo','in_progress','waiting','done','cancelled')),
  priority smallint not null default 2 check (priority between 1 and 4),   -- 1 highest
  category text,
  due_at timestamptz, due_date date,                           -- date-only vs timed
  snoozed_until timestamptz,
  recurrence_rule text,                                        -- RFC 5545 RRULE
  waiting_on_contact_id uuid references contacts on delete set null,
  waiting_on_text text, follow_up_at timestamptz,
  is_top_priority boolean not null default false,
  is_milestone boolean not null default false,
  completed_at timestamptz,
  source text not null default 'manual' check (source in ('manual','assistant','inbox','integration')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index on tasks (user_id, status, due_at);
create index on tasks (user_id, project_id);
create index on tasks (user_id, follow_up_at) where status = 'waiting';

create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null, description text, location text,
  starts_at timestamptz not null, ends_at timestamptz not null check (ends_at >= starts_at),
  all_day boolean not null default false,
  recurrence_rule text, travel_buffer_min int,
  external_provider text, external_id text,                    -- Phase 4 sync
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index on events (user_id, starts_at);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  task_id uuid references tasks on delete cascade,
  event_id uuid references events on delete cascade,
  title text,
  remind_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','sent','dismissed','snoozed')),
  created_at timestamptz not null default now()
);
create index on reminders (status, remind_at);

-- ---------- knowledge ----------
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text, body text not null default '',
  kind text not null default 'note' check (kind in ('note','idea','link','shopping','reference','important')),
  url text, tags text[] not null default '{}',
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
create index on notes using gin (to_tsvector('simple', coalesce(title,'') || ' ' || body));

create table memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  category text not null check (category in ('profile','preference','professional','personal','decision','project','routine','person','note')),
  content text not null,
  source text not null check (source in ('user_stated','ai_inferred','imported')),
  confidence real check (confidence between 0 and 1),
  status text not null default 'active' check (status in ('proposed','active','archived')),  -- AI inferences start 'proposed'
  source_ref text,                                             -- e.g. message id
  embedding vector(1536),
  last_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- capture ----------
create table inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  raw_text text, raw_kind text not null default 'text' check (raw_kind in ('text','voice','link','photo','document')),
  attachment_id uuid,
  suggested_type text, suggested_payload jsonb, suggestion_confidence real,
  status text not null default 'new' check (status in ('new','needs_review','confirmed','dismissed')),
  resolved_entity_type text, resolved_entity_id uuid,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------- finance / travel ----------
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null default 'expense' check (kind in ('expense','income')),
  amount_minor bigint not null check (amount_minor >= 0), currency text not null default 'INR',
  category text, merchant text, note text, spent_on date not null default current_date,
  ai_category_suggestion text, source text not null default 'manual',
  created_at timestamptz not null default now()
);
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null, amount_minor bigint, currency text not null default 'INR',
  cycle text check (cycle in ('weekly','monthly','quarterly','yearly')),
  next_due_on date, kind text not null default 'subscription' check (kind in ('subscription','emi','bill')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null, destination text, starts_on date, ends_on date,
  itinerary jsonb not null default '[]', packing jsonb not null default '[]', bookings jsonb not null default '[]',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- files / integrations ----------
create table attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  entity_type text, entity_id uuid,
  storage_path text not null, file_name text, mime_type text, size_bytes bigint,
  expires_on date,
  created_at timestamptz not null default now()
);
create table integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  provider text not null check (provider in ('google_calendar','gmail','google_drive')),
  status text not null default 'connected' check (status in ('connected','error','revoked')),
  scopes text[] not null default '{}',
  token_ciphertext bytea,                                      -- encrypted server-side; never selectable by client
  sync_settings jsonb not null default '{}', last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);

-- ---------- assistant ----------
create table assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table assistant_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  conversation_id uuid not null references assistant_conversations on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content text, tool_calls jsonb, used_memory_ids uuid[],
  created_at timestamptz not null default now()
);
create index on assistant_messages (conversation_id, created_at);

create table action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  conversation_id uuid references assistant_conversations on delete set null,
  actor text not null check (actor in ('user','assistant','proactive_engine')),
  tool text not null, args jsonb not null default '{}', result jsonb,
  status text not null check (status in ('suggested','prepared','approved','executed','failed','reverted','rejected')),
  autonomy_level smallint check (autonomy_level between 1 and 3),
  entity_type text, entity_id uuid, reverts_action_id uuid references action_logs,
  created_at timestamptz not null default now(), decided_at timestamptz
);
create index on action_logs (user_id, created_at desc);

-- ---------- notifications / proactive ----------
create table notification_preferences (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  push_enabled boolean not null default false,
  quiet_start time not null default '22:00', quiet_end time not null default '07:00',
  digest_time time not null default '08:00', daily_push_cap smallint not null default 5,
  types jsonb not null default '{"reminder":"push","deadline":"push","followup":"digest","suggestion":"digest","birthday":"digest","renewal":"digest"}',
  updated_at timestamptz not null default now()
);
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint text not null unique, p256dh text not null, auth text not null, user_agent text,
  created_at timestamptz not null default now()
);
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  type text not null, priority text not null default 'normal' check (priority in ('urgent','normal','digest')),
  title text not null, body text, rule_id text, dedupe_key text,
  entity_type text, entity_id uuid,
  delivered_via text check (delivered_via in ('push','in_app','digest')),
  read_at timestamptz, created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);
create table briefings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  for_date date not null, kind text not null default 'morning' check (kind in ('morning','weekly')),
  content text not null, facts jsonb, created_at timestamptz not null default now(),
  unique (user_id, for_date, kind)
);

-- ---------- RLS ----------
do $$
declare t text;
begin
  foreach t in array array['projects','contacts','tasks','events','reminders','notes','memories','inbox_items','expenses',
    'subscriptions','trips','attachments','integrations','assistant_conversations','assistant_messages',
    'notification_preferences','push_subscriptions','notifications','briefings'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "%1$s_owner" on %1$I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

alter table profiles enable row level security;
create policy profiles_owner on profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- action_logs: users can read and insert their own, but never edit/delete (audit integrity)
alter table action_logs enable row level security;
create policy action_logs_select on action_logs for select using (user_id = auth.uid());
create policy action_logs_insert on action_logs for insert with check (user_id = auth.uid());

-- integrations: hide token column from clients (use a view / column privileges in the real migration)
revoke select (token_ciphertext) on integrations from authenticated;

-- auto-create profile + prefs on signup
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (user_id) values (new.id);
  insert into notification_preferences (user_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
