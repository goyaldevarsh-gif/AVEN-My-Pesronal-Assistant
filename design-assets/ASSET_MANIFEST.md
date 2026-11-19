# AVEN Asset Manifest (v2, ChatGPT-board crops)

Source: the third reference board ("Complete Visual Asset Library"), cut out into individual transparent WebP files. Machine-readable version: `manifest.json`.

## 1. What is shipped as an image (40 files)

Only artwork that cannot be done with CSS or Lucide. Everything is lazy-loaded except the Assistant orb and onboarding.

### Onboarding (5 slides)

| Asset | Screen | Component | Size | Source px | Note |
|---|---|---|---|---|---|
| `illustrations/onboarding/onboarding-01-meet-aven.webp` | Onboarding (first launch only) | Slide 1 "Meet AVEN" | 200 px | 119x118 |  |
| `illustrations/onboarding/onboarding-02-plan-organise.webp` | Onboarding (first launch only) | Slide 2 "Plan & Organise" | 200 px | 119x109 |  |
| `illustrations/onboarding/onboarding-03-capture-everything.webp` | Onboarding (first launch only) | Slide 3 "Capture Everything" | 200 px | 117x106 |  |
| `illustrations/onboarding/onboarding-04-stay-proactive.webp` | Onboarding (first launch only) | Slide 4 "Stay Proactive" | 200 px | 117x115 |  |
| `illustrations/onboarding/onboarding-05-your-life-in-sync.webp` | Onboarding (first launch only) | Slide 5 "Your Life, in Sync" | 200 px | 120x101 |  |

### Module headers

| Asset | Screen | Component | Size | Source px | Note |
|---|---|---|---|---|---|
| `illustrations/modules/module-today.webp` | Morning Briefing detail | Trailing image in large-title header (hides on scroll) | 48 px | 122x84 |  |
| `illustrations/modules/module-tasks.webp` | Plan > My Tasks | Trailing image in large-title header (hides on scroll) | 48 px | 110x79 |  |
| `illustrations/modules/module-calendar.webp` | Plan > Calendar | Trailing image in large-title header (hides on scroll) | 48 px | 101x83 |  |
| `illustrations/modules/module-projects.webp` | Plan > Projects | Trailing image in large-title header (hides on scroll) | 48 px | 91x81 |  |
| `illustrations/modules/module-finance.webp` | Vault > Finance | Trailing image in large-title header (hides on scroll) | 48 px | 102x84 |  |
| `illustrations/modules/module-people.webp` | Vault > People & Contacts | Trailing image in large-title header (hides on scroll) | 48 px | 107x78 |  |
| `illustrations/modules/module-travel.webp` | Vault > Travel | Trailing image in large-title header (hides on scroll) | 48 px | 94x81 |  |
| `illustrations/modules/module-knowledge.webp` | Vault > Notes & Knowledge | Trailing image in large-title header (hides on scroll) | 48 px | 103x66 |  |
| `illustrations/modules/module-memory.webp` | Vault > Memory | Trailing image in large-title header (hides on scroll) | 48 px | 73x63 |  |

### Empty states

| Asset | Screen | Component | Size | Source px | Note |
|---|---|---|---|---|---|
| `illustrations/empty-states/empty-tasks.webp` | Plan > Tasks (0 tasks, no filter) | Empty state + one Add Task button | 120 px | 133x88 |  |
| `illustrations/empty-states/empty-events.webp` | Today calendar block / Plan day view (0 events) | Empty state + Add Event | 96-120 px | 127x89 |  |
| `illustrations/empty-states/empty-search.webp` | Global search, Vault search, Assistant memory search (0 results) | Empty state | 120 px | 123x87 |  |

### Notification categories

| Asset | Screen | Component | Size | Source px | Note |
|---|---|---|---|---|---|
| `notifications/notif-reminder.webp` | Notification Centre + Settings > Notifications | Category row icon: Reminder | 36 px | 42x46 |  |
| `notifications/notif-birthday.webp` | Notification Centre + Settings > Notifications | Category row icon: Birthday | 36 px | 62x56 |  |
| `notifications/notif-bill-due.webp` | Notification Centre + Settings > Notifications | Category row icon: Bill due (EMI, bills) | 36 px | 70x50 |  |
| `notifications/notif-subscription.webp` | Notification Centre + Settings > Notifications | Category row icon: Subscription renewal | 36 px | 64x49 |  |
| `notifications/notif-goal-progress.webp` | Notification Centre + Settings > Notifications | Category row icon: Goal progress | 36 px | 57x55 |  |

### Category illustrations (life areas)

| Asset | Screen | Component | Size | Source px | Note |
|---|---|---|---|---|---|
| `illustrations/categories/category-work.webp` | Category: Work | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 65x53 |  |
| `illustrations/categories/category-personal.webp` | Category: Personal | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 72x55 |  |
| `illustrations/categories/category-health.webp` | Category: Health & Fitness | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 76x50 |  |
| `illustrations/categories/category-shopping.webp` | Category: Shopping | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 58x57 |  |
| `illustrations/categories/category-investments.webp` | Category: Investments | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 53x51 | Same art reused for Finance > Investments category |
| `illustrations/categories/category-family.webp` | Category: Family | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 78x57 |  |
| `illustrations/categories/category-goals.webp` | Category: Goals | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 52x53 |  |
| `illustrations/categories/category-learning.webp` | Category: Learning | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 75x52 |  |
| `illustrations/categories/category-travel.webp` | Category: Travel | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 52x46 | Also used for the Trip update notification (no separate asset) |
| `illustrations/categories/category-lifestyle.webp` | Category: Lifestyle | Inbox AI-classification sheet, category picker (task / note / project), Vault filter chips | 40 px | 61x52 |  |

### AI assistant

| Asset | Screen | Component | Size | Source px | Note |
|---|---|---|---|---|---|
| `assistant/ai-orb-idle.webp` | Assistant tab | Idle hero orb; 28 px as message avatar. Listening / processing / speaking are CSS states on top (css/ai-states.css) | 96 px / 28 px | 99x104 |  |

### Lifestyle and context banners

| Asset | Screen | Component | Size | Source px | Note |
|---|---|---|---|---|---|
| `banners/banner-work-productivity.webp` | Category landing header (Work & Productivity) and dismissible Today "focus area" card | Photographic banner, one visible at a time, text drawn over a navy gradient | 390 x 110 pt | 221x85 |  |
| `banners/banner-health-fitness.webp` | Category landing header (Health & Fitness) and dismissible Today "focus area" card | Photographic banner, one visible at a time, text drawn over a navy gradient | 390 x 110 pt | 201x85 |  |
| `banners/banner-travel-leisure.webp` | Category landing header (Travel & Leisure) and dismissible Today "focus area" card | Photographic banner, one visible at a time, text drawn over a navy gradient | 390 x 110 pt | 195x85 |  |
| `banners/banner-learning-growth.webp` | Category landing header (Learning & Growth) and dismissible Today "focus area" card | Photographic banner, one visible at a time, text drawn over a navy gradient | 390 x 110 pt | 193x85 |  |
| `banners/banner-money-investments.webp` | Category landing header (Money & Investments) and dismissible Today "focus area" card | Photographic banner, one visible at a time, text drawn over a navy gradient | 390 x 110 pt | 187x85 |  |
| `banners/banner-family-relationships.webp` | Category landing header (Family & Relationships) and dismissible Today "focus area" card | Photographic banner, one visible at a time, text drawn over a navy gradient | 390 x 110 pt | 202x85 |  |
| `banners/banner-goals-growth.webp` | Category landing header (Goals & Personal Growth) and dismissible Today "focus area" card | Photographic banner, one visible at a time, text drawn over a navy gradient | 390 x 110 pt | 203x85 |  |

## 2. What the board shows but is NOT an image file (build with CSS / SVG / Lucide)

| Board item | Implementation | Screen / component |
|---|---|---|
| AI states: idle | `ai-orb-idle.webp` | Assistant tab |
| AI states: listening | CSS rings around the orb + 9-bar SVG/CSS waveform (`css/ai-states.css`) | Voice capture overlay |
| AI states: processing | CSS rotating arc on the orb (`.aven-orb--processing`); `Loader` for inline | Assistant while a tool call runs |
| AI states: speaking | Orb pulse + Lucide `Pause` / `Square` controls | Assistant voice reply |
| Status icons (Completed, In Progress, Snoozed, Waiting For, Syncing, Offline, Attention, Info) | Lucide `CircleCheck`, `RefreshCw`, `AlarmClock`, `Hourglass`, `RefreshCw` + spin, `CloudOff`, `TriangleAlert`, `Info` in a 28 px tinted circle (tokens: teal / warning `#D97757` / secondary `#718096`) | Task rows, project cards, sync pill, offline banner |
| Task and project status | Same Lucide set plus status pill (CSS) and a CSS progress bar | Plan > Tasks, Plan > Projects |
| Success / error / upload / offline states | Lucide icon (`CircleCheck`, `CircleAlert`, `CloudUpload`, `CloudOff`) in a 48 px tinted circle + one line of text. No illustration | Toasts, upload sheet, form errors, offline screen |
| Common UI (Create New, Documents, Photos, Links, Folder, Private) | Lucide `FilePlus`, `FileText`, `Image`, `Link`, `Folder`, `Lock` | Capture sheet, Vault rows |
| Dashboard summary graphics / data visualisation (bars, donut, line, area, 75% ring) | Small inline-SVG components: `<ProgressRing>` (circle + `stroke-dasharray`), `<Donut>`, `<Sparkline>` (`polyline`), `<MiniBars>` (rects). Teal `#20A69A` on `#E6F5F3` | Finance summary, Today progress, Weekly review |
| Backgrounds / textures | CSS gradients (`css/aven-surfaces.css`), no image requests | Splash, Assistant hero, Finance header |
| Home Screen widgets (Today, Next Up, Capture) | Build as in-app summary cards (HTML/CSS) now. **A PWA cannot place widgets on the iPhone Home Screen.** Real widgets need native WidgetKit, so they belong to Phase 6 (native iOS) | Today tab cards for now |
| Expense categories (food, transport, bills, rent, EMI...) | The board has none. Use Lucide in a tinted circle, not illustrations | Expense capture, Finance lists |
| Logo lockups, app icons, favicon, badge | Primary brand deliverable. Board versions are ~70 px, too small to export | Manifest icons, splash |

## 3. Duplicates removed

- Trip update notification = `category-travel.webp` (same plane, not shipped twice).
- `category-investments.webp` also serves Finance > Investments.
- `module-calendar` and `empty-events` are similar calendars: never show both on one screen.

## 4. Missing assets (not on any board)

| Needed | Where | Interim |
|---|---|---|
| Today banner without baked-in text (sunrise / dusk) | Today header | CSS gradient from `aven-surfaces.css` |
| `module-documents` | Vault > Documents header | Lucide `FileText` |
| `empty-inbox`, `empty-vault` | Inbox, Vault sections | Lucide `Inbox` / `ShieldCheck` + text |

## 5. Quality limits (read this)

The board is 1536 x 1024, so each icon in it is only about 40 to 120 px. I cut them out cleanly and upscaled 3-4x with Lanczos + light sharpening, but no real detail is added. Good enough for the intended sizes (40-48 px category and module art, 36 px notifications). Soft or slightly blurry at the larger sizes:
- Onboarding (shown at 200 px) and empty states (120 px): acceptable on iPhone, soft on iPad.
- Lifestyle banners: source is only ~200 x 85 px, so they look blurry at full width. Treat as placeholders.
- The transparent cut-outs keep a faint light halo, so they are for **light theme**. On dark theme put them on a light rounded tile.

For production-sharp versions, regenerate each asset alone in ChatGPT at 1024 px using the board as style reference ("same style as the attached board, single asset, transparent background, no text"). The filenames here can stay the same.
