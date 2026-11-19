# AVEN — Product Blueprint (Phase 1, for review)

Status tags used throughout: **[C]** confirmed in your brief · **[R]** my recommendation · **[O]** open decision for you.
Nothing here is implemented yet. Implementation starts only after you approve this.

---

## 1. Vision and positioning

**Vision [C]:** AVEN is one calm place from which you run your personal and professional life: it remembers, organises, anticipates and (with approval) executes.

**Positioning statement [R]:** For a busy professional who juggles clinics, study, projects and family, AVEN is a personal intelligence layer that turns everything you say or capture into organised, scheduled, remembered action. Unlike to-do apps (you manage them) and chatbots (they only talk), AVEN manages your commitments and asks before it acts.

**Five pillars [C]:** Remember · Organise · Anticipate · Execute · Control.
**Design principle [C]:** the user should not have to manage the assistant; the assistant helps manage the user.

**Primary user [C]:** you (personal use first). **Future [C]:** architecture must allow commercial multi-user, so every record is owned by a user and protected by RLS from day one.

---

## 2. PRD

### Goals
1. Morning open → know today's commitments, top 3 priorities, what's overdue, what to do next, in under 5 seconds.
2. Capture anything in under 3 seconds (text now, voice next) and never lose it.
3. Assistant that *does* things (tasks, events, reminders, memory lookups) through real tools, with visible, reversible actions.
4. Feels native on iPhone (installed PWA): fast, safe-area aware, bottom nav, offline-readable.

### Non-goals (explicit)
Banking integration, a full email client, team/collaboration features, WhatsApp automation (not possible via supported APIs for personal accounts), native iOS app in the first releases.

### Success metrics [R]
Capture-to-organised ≥ 90% without manual re-categorising after 2 weeks · Today screen interactive < 1.5 s on repeat open · zero AI actions executed without the right approval level · notification opt-out rate low (≤ 5 per day average, tunable).

### Non-functional requirements
Mobile-first (390 pt design width, safe areas) · light + dark · offline read of Today/Plan/Vault-notes · all API keys server-side · RLS on every table · every state designed (loading, empty, success, error) · accessible contrast (AA) and Dynamic Type friendly sizing.

---

## 3. Feature inventory by module

Priority: P0 must, P1 should, P2 could. Release: **MVP** or **Later** (phase in brackets).

### Today
| Feature | Purpose / user benefit | Depends on | Pri | Release |
|---|---|---|---|---|
| Greeting + date | Orientation, personal tone | Profile | P0 | MVP |
| Today's calendar | See commitments in one glance | Events | P0 | MVP |
| Top 3 priorities | Forces focus; user- or AI-picked, user confirms | Tasks | P0 | MVP |
| Pending / overdue / follow-ups due | Nothing slips | Tasks, Waiting For | P0 | MVP |
| Quick capture | Zero-friction input | Inbox | P0 | MVP |
| Morning AI briefing | One paragraph: what matters today | Assistant, tasks, events | P1 | MVP+ (Phase 3, but cheap, I'd pull it in) |
| AI suggestions strip | "Reschedule 2 overdue?" one-tap | Proactive engine | P1 | Later (Phase 3) |
| Upcoming events (next 7 days) | Look-ahead | Events | P1 | MVP |
| Context banner (time of day) | Brand feel, not decoration-heavy | Assets | P2 | Later |

### Plan
| Feature | Purpose / benefit | Depends on | Pri | Release |
|---|---|---|---|---|
| Tasks CRUD, due date, priority, category, notes | Core organisation | DB | P0 | MVP |
| Subtasks | Break down work | Tasks | P0 | MVP |
| Recurring tasks | Routines | Tasks, scheduler | P0 | MVP |
| Reminders | Be told at the right time | Push | P0 | MVP |
| Snooze / reschedule | Fast triage | Tasks | P0 | MVP |
| Projects + milestones | Group tasks toward outcomes | Tasks | P0 | MVP |
| Waiting For | Track things blocked on people | Tasks, Contacts (name text in MVP) | P0 | MVP |
| Follow-ups | Pending replies/chases with due date | Waiting For | P1 | MVP |
| Completion history | Review, weekly summary input | Tasks | P1 | MVP (data), Later (UI) |
| Attachments on tasks | Context | Storage | P2 | Later (Phase 5) |
| Calendar day / agenda view | See day | Events | P0 | MVP |
| Calendar week / month view | Planning | Events | P1 | Later (Phase 2b) |
| Time blocking, conflict detection, travel buffers | Realistic scheduling | Events | P1 | Later (Phase 3-4) |
| Weekly / monthly planning | Review + plan ahead | Assistant | P1 | Later (Phase 3) |

### Inbox
| Feature | Purpose / benefit | Depends on | Pri | Release |
|---|---|---|---|---|
| Text capture | Never lose a thought | DB | P0 | MVP |
| AI classification suggestion + confirm | Right place without effort; never silent | Assistant | P0 | MVP |
| Types: task, note, idea, reminder, link, shopping | Core types | Inbox | P0 | MVP |
| Expense capture | Finance entry | Finance | P1 | Later (Phase 5) |
| Voice note (record → transcribe → classify) | Hands-free capture | Transcription | P1 | Later (Phase 3) |
| Documents / photo capture | Store paperwork | Storage | P2 | Later (Phase 5) |
| Original always retained | Control, auditability | — | P0 | MVP |

### Assistant
| Feature | Purpose / benefit | Depends on | Pri | Release |
|---|---|---|---|---|
| Text chat with tool calling | Core brain | LLM adapter, tools | P0 | MVP |
| Action cards (suggested / prepared / done) | Transparent execution | action_logs | P0 | MVP |
| Create task / event / reminder, find free slot | Highest-value actions | Tools | P0 | MVP |
| Search memory & notes | "What did I decide about X?" | Memory, embeddings | P1 | MVP (basic keyword), Later (semantic) |
| Voice input | Natural interaction | Transcription | P1 | Later (Phase 3) |
| Email drafting / communication drafts | Save time; prepare-only | LLM | P1 | Later (Phase 4-5) |
| Daily/weekly summaries | Review | Data | P1 | Later (Phase 3) |
| Multi-step workflows | Autopilot | Tools, approvals | P2 | Later (Phase 6) |

### Vault
| Feature | Purpose / benefit | Depends on | Pri | Release |
|---|---|---|---|---|
| Personal profile | Context for the AI | Profiles | P0 | MVP |
| Memory (facts, prefs, decisions) with source, confidence, edit/delete | Remember — user-controlled | Memories | P0 | MVP |
| Notes & knowledge | Second brain | Notes | P0 | MVP |
| Global search | Find anything | All | P0 | MVP |
| People & contacts (+ birthdays, last interaction) | Relationships | Contacts | P1 | Later (Phase 5) — minimal birthdays could come earlier |
| Finance (expenses, budgets, subscriptions, EMI) | Money visibility | Expenses, subscriptions | P1 | Later (Phase 5) |
| Travel (trips, itineraries, packing) | Trip planning | Trips | P2 | Later (Phase 5) |
| Documents | Paperwork + expiry | Storage | P2 | Later (Phase 5) |
| Shopping / wishlist, important info, saved references | Convenience | Notes (tagged) | P2 | Later |
| Export / archive / delete everything | Control | — | P0 | MVP (export JSON + delete account) |

### Cross-cutting
| Feature | Purpose / benefit | Depends on | Pri | Release |
|---|---|---|---|---|
| Auth + session handling | Security | Supabase Auth | P0 | MVP |
| PWA install, manifest, service worker, offline read cache | Native feel | — | P0 | MVP |
| Offline write queue (outbox) | Capture without network | IndexedDB | P1 | MVP |
| Web push + quiet hours + daily digest + per-type prefs | Anticipate without overload | Push, prefs | P0 | MVP (basic), Later (digest tuning) |
| Action history / audit log | Control | action_logs | P0 | MVP |
| Integrations page (Google Calendar, Gmail, Drive) | Connectivity | OAuth | P1 | Later (Phase 4) — shows only what's really connected |
| Light/dark theme | Brand | Tokens | P0 | MVP |

---

## 4. Navigation and information architecture

Five bottom tabs [C]: **Today · Plan · Inbox · Assistant · Vault**.

```
Today
  Briefing → Briefing detail
  Today's calendar → Event detail
  Top 3 · Pending · Overdue · Follow-ups
  Quick capture (global)
Plan  (segmented: Tasks | Projects | Calendar)
  Tasks: All · Today · Upcoming · Waiting For  → Task detail
  Projects → Project detail (milestones, tasks)
  Calendar: Day / Agenda (week, month later)
  Weekly / Monthly plan (later)
Inbox
  Filters: All · Tasks · Notes · Ideas · Expenses
  Item → Review & confirm classification
Assistant
  Conversation · suggestion chips · voice (later)
  Action cards → Action detail / undo
Vault
  Profile · Memory · Notes & Knowledge · (later: Finance, People, Travel, Documents, ...)
  Global search (top of Vault)
Settings (profile icon, top-right of every tab)
  Notifications · Autonomy levels · Integrations · Privacy & data · Appearance · Account
```

**Global capture [R]:** a floating Capture button on Today/Plan/Inbox (not on Assistant, where the composer already is). Captures land in Inbox.

---

## 5. Key user journeys

1. **Morning open:** open AVEN → briefing + today's events + top 3 → tap a priority → start; overdue block offers "Reschedule all to tomorrow?" (prepared action, needs one tap).
2. **Quick capture:** tap Capture → type "buy gift for mom's birthday, 18 Jan" → saved to Inbox instantly → AI suggests Task + date 18 Jan → user taps Confirm → appears in Plan → reminder scheduled.
3. **Assistant action:** "Remind me to call Rahul tomorrow" → assistant resolves "tomorrow" in your timezone → if time missing it asks "What time?" (never assumes) → creates reminder → shows done-card with Undo.
4. **Waiting For:** mark task "Waiting on Dr. X" with chase date → appears in Waiting For → on chase date shows in Today follow-ups → assistant offers a draft message (prepared, not sent).
5. **Weekly planning (later):** Sunday prompt → AVEN lists overdue, unfinished projects, next week's events → suggests a plan → user edits/approves → tasks scheduled.
6. **Control:** Settings → Privacy → see every action AVEN took, memories it holds (source: you said vs AI-inferred), edit/delete, export, delete account.

---

## 6. Screen inventory

**MVP (≈ 28 screens):** Splash · Onboarding (5) · Sign in / sign up · Today · Briefing detail · Capture sheet · Plan Tasks list · Task detail/edit · Task create sheet · Projects list · Project detail · Calendar agenda/day · Event detail/create · Waiting For list · Inbox list · Inbox review sheet · Assistant conversation · Action card detail · Vault home · Profile · Memory list · Memory detail/edit · Notes list · Note editor · Global search · Settings home · Notification preferences · Autonomy levels · Privacy & data (export, delete) · Action history · Offline banner states · Error/empty states.
**Later:** Calendar week/month · Weekly planning · Voice capture overlay · Finance (dashboard, expense, budgets, subscriptions, EMI) · People (list, detail, birthdays) · Travel (trip list/detail/packing) · Documents · Integrations (+ per-service) · Widgets (native).

---

## 7. Brand identity recommendations

- **Name/tagline [C]:** AVEN — *Life, thoughtfully organised.*
- **Voice [R]:** calm, precise, quietly confident; short sentences; no exclamation marks except celebration; never "buddy" tone.
- **Logo direction [R]:** the arch-shaped "A" mark (open apex, rounded stroke, teal gradient) already shown on your boards; wordmark in SF Pro Display Semibold, wide-ish tracking. Provide: full lockup, mark-only, white/navy mono versions.
- **App icon [R]:** navy-to-deep-teal rounded square, mark in light teal gradient; no text. Must be re-exported at 1024 px (board versions are too small). **[O]** regenerate in ChatGPT at 1024 px.
- **Imagery [C/R]:** calm mountain/landscape sunrise motif, soft teal illustrations (already cropped in `design-assets/`). Illustrations only where they aid comprehension; one per screen max.
- **Iconography [C]:** Lucide, stroke 1.75.

---

## 8. Design system (tokens)

### Colour
| Token | Light | Dark (my proposal [R]) |
|---|---|---|
| `bg` | `#F6F8FA` | `#0B1722` |
| `surface` (cards) | `#FFFFFF` | `#102331` |
| `surface-2` | `#EEF2F5` | `#17303F` |
| `border` | `#E6EBEF` | `#24404F` |
| `text` | `#172B3A` | `#E8EEF2` |
| `text-2` | `#718096` | `#9FB3C2` |
| `primary` (navy) | `#102A43` | `#8FB4D6` (used for links/primary text accents) |
| `accent` (teal) | `#20A69A` | `#2CC4B6` |
| `accent-soft` | `#E6F5F3` | `#123B3A` |
| `warning` | `#D97757` | `#E58B6D` |
| `success` | `#22C55E` | `#3DD27A` |
| `info` | `#3B82A6` | `#6AB0D0` |

### Typography
SF Pro Display (headings) / SF Pro Text (body) with Inter fallback. Scale: Large title 28/34 · Title 22/28 · Headline 17/22 semibold · Body 16/24 (iOS input font ≥ 16 to prevent zoom) · Callout 15/22 · Footnote 13/18 · Caption 12/16. Avoid oversized headings.

### Shape, spacing, elevation, motion
Radii 14 (controls/cards), 18 (sheets), 999 (pills) · spacing 4-pt grid (4, 8, 12, 16, 20, 24, 32) · shadow `0 1px 2px rgba(16,42,67,.06)` (light), borders preferred over shadows in dark · motion 180–240 ms ease-out, no decorative loops, respect `prefers-reduced-motion`.

### Core components (build once, reuse)
Tab bar, large-title header, list row (icon, title, meta, trailing), card, button (primary / secondary / ghost / destructive), pill/status chip, input / textarea / date-time picker (sheet), segmented control, bottom sheet, toast, action card (suggested / prepared / done), empty state, skeleton, avatar, progress ring/bars (inline SVG).

Safe areas: `env(safe-area-inset-*)` on tab bar, sheets, headers. Tap target ≥ 44 pt.

---

## 9. MVP scope

**Included:** auth · Today (no AI suggestions yet; briefing optional) · Plan: tasks, subtasks, recurring, reminders, snooze, projects, Waiting For, follow-ups, agenda/day calendar · Inbox: text capture + AI classify-and-confirm · Assistant: text chat with tools (create/update/complete task, create event, reminder, find free slot, search notes/memory) · Vault: profile, memory, notes, search, export/delete · PWA install, offline read + write outbox · web push with quiet hours · action history · light/dark.

**Excluded from MVP:** Gmail / Google Calendar / Drive · finance, contacts, travel, documents · voice · autonomy Level 3 · multi-step workflows · week/month calendar · native widgets · multi-user/commercial features (but schema is multi-user-ready).

**Exit test:** you use AVEN for one full week as your only task/capture tool and nothing important is lost.

---

## 10. Where I disagree or want a decision

1. **Vault has 10 sections in your brief — too much for MVP.** [R] Ship Profile, Memory, Notes first; the rest appear only when their module exists (no placeholder tiles).
2. **Don't build a full calendar early.** [R] Agenda/day view only; sync Google Calendar read-only in Phase 4 instead of reinventing month views.
3. **Inbox vs Assistant overlap.** [R] Inbox = queue of unprocessed captures; Assistant = conversation. Anything typed in Assistant that implies a task is actioned there, not duplicated into Inbox.
4. **Morning briefing is cheap and high-value.** [R] Pull it into the MVP+ (one LLM call per day, cached).
5. **iOS PWA limits (confirmed by platform behaviour):** web push works only after Add to Home Screen (iOS 16.4+); no Home Screen widgets; no background sync; Web Speech API is unreliable in iOS Safari → voice must be record-and-transcribe on the server; badges/vibration limited. Widgets and rich background behaviour wait for the native phase.
5b. **WhatsApp:** no supported personal-account API; treat as "share/copy" only. Gmail scopes (restricted) need Google verification if this ever becomes commercial.
6. **[O] LLM provider for v1** (Claude, OpenAI, Gemini). Architecture is provider-independent either way; I recommend starting with one and keeping the adapter thin.
7. **[O] Timezone/locale:** assume Asia/Kolkata, 12-hour display, week starts Monday? Confirm.
8. **[O] Hosting/budget:** Supabase + Vercel free tiers are enough for personal use; pg_cron and Edge Function limits are fine at this scale.
9. **[O] Single repo vs split:** I recommend one repo, `apps/web` (Vite React) + `supabase/` (migrations, functions) + `design-assets/`.

---

## 11. Phased roadmap (each phase ends in a working, tested build)

| Phase | Deliverable | Key exit test |
|---|---|---|
| 1 Foundation | This blueprint, design tokens, schema, prototype of core screens | You approve |
| 2 Core | Auth, Today, Tasks/Projects/Calendar(day), reminders, capture, Vault foundation, PWA deploy | Daily use without AI |
| 3 Intelligence | Assistant with tools, classification, memory, briefing, voice, weekly planning | Actions correct and reversible |
| 4 Connectivity | Google Calendar, Gmail (read/draft), push tuning, sync engine | Two-way calendar correct |
| 5 Personal mgmt | Finance, contacts, travel, documents | Month closed in AVEN |
| 6 Autopilot | Proactive automation, workflows, Level-3 approved automation, native iOS | No surprise actions |

Rule from your brief: no feature is called done until tested; no mock data in production flows; integrations are shown only once real.
