# AVEN web (Phase 2 foundation)

React + TS + Vite + Tailwind PWA. Supabase backend (Auth email OTP, Postgres + RLS).

## Run
```
cd apps/web
cp .env.example .env.local   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (anon key only, never service key)
npm install
npm run dev
```
Try without a backend: open `/?demo=1` (sample in-memory data, nothing saved).

## Supabase setup
1. Run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Auth → Email: enable email OTP; the "Magic Link" template must include `{{ .Token }}` (iOS PWA uses the 6-digit code).
3. Put URL + anon key in `.env.local` / Vercel env vars.

## Status (honest)
Tested: domain logic (13 unit tests: timezone, overdue, recurrence, top-3), type-check, production build, PWA generation, demo-mode UI at 390px (Today, Plan/Tasks/Projects/Calendar, Inbox, Vault, Assistant, Settings, light + dark, complete-task + undo) with zero console errors.
NOT tested yet: real Supabase auth/RLS/sync (needs your project keys), push notifications, install-to-home-screen on a real iPhone, offline cache restore on device.
Not built (later phases): assistant/tool-calling, voice, Google Calendar/Gmail, finance/contacts/travel/documents, proactive engine, push, offline write queue, account deletion.
