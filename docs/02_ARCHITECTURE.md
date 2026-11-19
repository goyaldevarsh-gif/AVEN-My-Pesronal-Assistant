# AVEN — Technical Architecture, AI, Proactive Engine, Privacy

Tags: **[C]** from your brief · **[R]** recommendation · **[O]** open.

## 1. System overview [C stack, R details]

```
iPhone PWA (React + TS + Vite + Tailwind + Lucide)
  ├─ IndexedDB: cache + outbox (offline writes)
  ├─ Service worker: app shell, runtime cache, web push
  └─ Supabase JS (anon key + user JWT only)
          │ HTTPS
Supabase
  ├─ Auth (email magic link / Apple later)
  ├─ Postgres + RLS + pgvector + pg_cron
  ├─ Storage (private buckets, signed URLs)
  └─ Edge Functions (Deno)
        ├─ assistant-chat      (LLM orchestration + tool execution)
        ├─ classify-inbox      (structured-output classification)
        ├─ transcribe          (voice → text, later)
        ├─ briefing-generate   (daily briefing)
        ├─ proactive-tick      (rules engine, run by pg_cron)
        ├─ push-send           (Web Push)
        └─ oauth-* / sync-*    (Google, Phase 4)
LLM provider (via adapter)  ·  Vercel (static hosting)
```

**Why this shape:** the browser never holds an LLM key or a service-role key; every AI action goes through an Edge Function that authenticates the user, enforces approvals, and writes an audit log. Everything is user-scoped by RLS so it can become multi-user without redesign.

**Repo layout [R]:** `apps/web/`, `supabase/migrations/`, `supabase/functions/`, `design-assets/`, `docs/`.

**Client data flow [R]:** TanStack Query for server state; IndexedDB persisted cache for Today/Plan/Notes; mutations go to an outbox when offline and replay in order (idempotency key per mutation, last-write-wins with `updated_at` for simple fields). Assistant requires network.

**Future native [C]:** logic lives in Edge Functions and Postgres, not in the web client, so a SwiftUI app can reuse everything. Keep domain types in a shared `packages/types`.

## 2. Database

See `supabase/migrations/0001_init.sql` (tables, indexes, RLS). Entities from your brief plus four I added: `inbox_items`, `push_subscriptions`, `notifications`, `briefings`.

Key design points:
- Every table has `user_id uuid not null default auth.uid()` and RLS `user_id = auth.uid()` for all operations.
- Times: `timestamptz` in UTC; `profiles.timezone` (default `Asia/Kolkata`); date-only fields use `date`.
- Soft delete via `archived_at` / `deleted_at` where user-facing; hard delete on explicit user request and account deletion (cascade).
- Memory: `source` (`user_stated | ai_inferred | imported`), `confidence`, `embedding vector(1536)` (dimension configurable), `user_editable`, `last_confirmed_at`. AI-inferred memories are *proposals* until the user confirms.
- `action_logs`: every tool call with `status` (`suggested | prepared | approved | executed | failed | reverted`), `tool`, `args`, `result`, `autonomy_level`, `reverts_action_id`.

ER (summary): profiles 1—n {tasks, projects, events, reminders, notes, memories, contacts, expenses, subscriptions, trips, attachments, integrations, conversations, inbox_items, action_logs}; projects 1—n tasks; tasks 1—n tasks (subtasks); conversations 1—n messages; any entity 1—n attachments (polymorphic `entity_type, entity_id`); contacts referenced by tasks (`waiting_on_contact_id`).

## 3. AI assistant architecture [R]

**Provider-independent adapter:** one interface `LLM.generate({messages, tools, schema})` with provider modules behind it; model name from env/config. Tool definitions are JSON Schema, shared by all providers.

**Request flow (`assistant-chat`):**
1. Verify JWT; load `profiles` (timezone, autonomy settings).
2. Build context: system prompt (role, rules, current date/time in the user's timezone) + recent messages + retrieved context (pinned profile facts, top-k memories by embedding, today's tasks/events summary).
3. Call model with tools. Loop (max N steps).
4. For each tool call: validate args (zod) → look up the tool's *risk class* and the user's autonomy setting → either **execute**, or **prepare** (create `action_logs` row `prepared`, return an action card for approval).
5. Stream final answer + action cards to the client.

**Tool set (v1):** `create_task`, `update_task`, `complete_task`, `snooze_task`, `list_tasks`, `create_event`, `find_free_slots`, `create_reminder`, `capture_to_inbox`, `search_notes`, `search_memory`, `propose_memory`. Later: `log_expense`, `draft_message`, `create_trip`, calendar/email tools.

**Risk classes and autonomy [C levels, R mapping]:**
| Class | Examples | Default |
|---|---|---|
| Read (L1) | list/search | auto |
| Low-risk write (L2→L3 optional) | create task/reminder, snooze, capture | execute immediately with Undo card (user can switch to "ask first") |
| Consequential | delete, bulk reschedule, anything external (send email/message, calendar invite to others, payments) | always *prepared*, needs explicit approval |
| Never automatic | sending to other people, spending money, deleting data | approval every time, cannot be switched to auto |

**Distinguish states [C]:** every action card shows one of *Suggestion* (idea only), *Prepared* (ready, waiting for approval), *Done* (executed, with Undo where possible).

**Rules baked into the system prompt and enforced in code:**
- Resolve relative dates in `profiles.timezone`; if a date or time is ambiguous, ask — never guess [C].
- Never invent commitments, memories or facts; save a memory only as a proposal with source.
- Prefer one clarifying question over a wrong action.
- Never expose keys or tool internals.

**Classification (`classify-inbox`):** a single structured-output call returning `{type, title, due_at?, project?, category?, confidence, reasoning_short}`; the item is stored first, classification is a suggestion; the user confirms or edits. Low confidence → stays "Needs review".

**Memory retrieval:** embeddings on `memories` and `notes` (pgvector); hybrid with keyword search; the context builder includes only what is relevant and shows "used memories" in the UI for transparency [R].

**Evaluation [R]:** a small fixture set of ~40 utterances (dates, ambiguity, Hinglish phrases like "kal subah 10 baje yaad dilana") with expected tool calls, run before each prompt/model change.

**Voice (later) [R]:** record with MediaRecorder → upload → `transcribe` → same pipeline as text. Not the Web Speech API (unreliable on iOS Safari).

## 4. Proactive automation architecture [R]

Principle: **deterministic rules first, LLM only to phrase.**

```
pg_cron (every 5 min) → proactive-tick
   for each user in their local time:
     evaluate rules → candidate suggestions (with dedupe_key)
     apply gating: quiet hours, daily cap, priority, "already shown", user mutes
     write notifications rows
     send urgent ones via Web Push; batch the rest into the daily digest
daily at user's briefing time → briefing-generate (LLM composes from facts; cached in briefings)
```

**Rules (v1):** overdue tasks; deadline within 24 h; calendar conflicts; follow-up due; birthday in N days (Phase 5); subscription renewal (Phase 5); unfinished project with no activity 7 days; weekly planning prompt.
**Overload controls [C]:** quiet hours, per-type toggles, priority levels (urgent / normal / digest-only), daily cap (default 5 pushes), digest time, snooze-all.
**Safety:** proactive engine only *reads and suggests*; any action it proposes goes through the same prepare/approve path as the Assistant. It never creates commitments or dates by itself.
**Observability:** each fired suggestion logged with rule id, so you can see why you were notified.

## 5. Privacy and security plan

| Area | Plan |
|---|---|
| Auth | Supabase Auth, email magic link (Apple/Google sign-in later), short-lived JWT + refresh, sign-out everywhere |
| Authorisation | RLS on every table (`user_id = auth.uid()`), Storage policies per user folder, no service-role key in the client; Edge Functions use service role only after verifying the JWT |
| Secrets | LLM and OAuth secrets only as Edge Function secrets; nothing sensitive in `VITE_*` env vars (anon key is public by design) |
| Transport/storage | HTTPS/TLS everywhere; Supabase encrypts at rest; sensitive free-text (documents, finance notes) can later get app-level encryption **[O]** |
| AI data handling | User toggle "Allow AI to read: tasks / notes / memory / finance"; per-conversation context shown; provider zero-retention settings where available; no data sent to third parties without authorisation [C] |
| OAuth | Authorisation-code + PKCE, minimal scopes, tokens encrypted in `integrations`, disconnect revokes and deletes tokens |
| Audit | `action_logs` immutable for users (insert-only policy), viewable in Settings |
| User control | Inspect / edit / delete memories; export all data (JSON + files); delete account (cascade + storage purge); backup via Supabase daily backups (PITR on paid tier) |
| Client | CSP, no inline scripts, sanitize rendered notes (markdown), service worker caches only non-sensitive shells + user data in IndexedDB cleared on sign-out |
| Prompt injection | Content from emails/web/documents is treated as data, never as instructions; tools that act on it require approval |
| Abuse/limits | Per-user rate limits on Edge Functions, token budgets, cost guard |

## 6. Tech decisions to confirm [O]
1. LLM provider and embedding model for v1.
2. Magic link only, or Apple/Google sign-in from day one.
3. Hosted Supabase region (closest to India for latency).
4. Whether to adopt Supabase CLI migrations in the repo (recommended) — yes → matches your "maintain migration history" rule.
