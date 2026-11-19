/** DEMO ONLY. In-memory repo used when ?demo=1 so the UI can be reviewed without a backend. Nothing is saved. */
import { addDaysKey, todayKey, zonedToUtc, DEFAULT_TZ } from '@/domain/dates';
import type { AvenEvent, InboxItem, Note, Profile, Project, Repo, Task } from './types';

const uid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

export function createDemoRepo(): Repo {
  const tz = DEFAULT_TZ; const today = todayKey(tz); const U = 'demo-user';
  const t = (o: Partial<Task> & { title: string }): Task => ({ id: uid(), user_id: U, project_id: null, parent_task_id: null, notes: null, status: 'todo', priority: 2, category: null, due_at: null, due_date: null,
    snoozed_until: null, recurrence_rule: null, waiting_on_text: null, follow_up_at: null, is_top_priority: false, completed_at: null, source: 'manual', created_at: nowIso(), updated_at: nowIso(), deleted_at: null, ...o });
  const p1: Project = { id: uid(), user_id: U, title: 'Website redesign', description: null, category: 'Work', status: 'active', due_date: addDaysKey(today, 20), created_at: nowIso(), archived_at: null };
  const p2: Project = { id: uid(), user_id: U, title: 'Home renovation', description: null, category: 'Personal', status: 'active', due_date: null, created_at: nowIso(), archived_at: null };
  let projects = [p1, p2];
  let tasks: Task[] = [
    t({ title: 'Finish proposal draft', due_date: today, priority: 1, is_top_priority: true, project_id: p1.id }),
    t({ title: 'Book Delhi flight', due_date: today, priority: 2, is_top_priority: true }),
    t({ title: 'Follow up with Rahul', status: 'waiting', waiting_on_text: 'Rahul', follow_up_at: zonedToUtc(today, '09:00', tz).toISOString(), is_top_priority: true }),
    t({ title: 'Send invoice to client', due_date: addDaysKey(today, -2), priority: 1 }),
    t({ title: 'Renew car insurance', due_date: addDaysKey(today, -1) }),
    t({ title: 'Review project plan', due_date: addDaysKey(today, 3), project_id: p1.id }),
    t({ title: 'Pick tile samples', project_id: p2.id, status: 'done', completed_at: nowIso() }),
    t({ title: 'Water plants', due_date: today, recurrence_rule: 'FREQ=WEEKLY', priority: 3 }),
  ];
  let events: AvenEvent[] = [
    { id: uid(), user_id: U, title: 'Team sync', description: null, location: 'Google Meet', starts_at: zonedToUtc(today, '10:00', tz).toISOString(), ends_at: zonedToUtc(today, '11:00', tz).toISOString(), all_day: false, deleted_at: null },
    { id: uid(), user_id: U, title: 'Client proposal review', description: null, location: null, starts_at: zonedToUtc(today, '14:00', tz).toISOString(), ends_at: zonedToUtc(today, '15:00', tz).toISOString(), all_day: false, deleted_at: null },
    { id: uid(), user_id: U, title: 'Dentist', description: null, location: 'Malviya Nagar', starts_at: zonedToUtc(addDaysKey(today, 2), '17:00', tz).toISOString(), ends_at: zonedToUtc(addDaysKey(today, 2), '17:45', tz).toISOString(), all_day: false, deleted_at: null },
  ];
  let inbox: InboxItem[] = [
    { id: uid(), user_id: U, raw_text: 'Remind me to get a gift for Mom\'s birthday', raw_kind: 'text', status: 'new', resolved_entity_type: null, resolved_entity_id: null, created_at: nowIso(), resolved_at: null },
    { id: uid(), user_id: U, raw_text: 'Idea: weekly review every Sunday evening', raw_kind: 'text', status: 'new', resolved_entity_type: null, resolved_entity_id: null, created_at: nowIso(), resolved_at: null },
  ];
  let notes: Note[] = [{ id: uid(), user_id: U, title: 'Trip checklist', body: 'Passport, charger, tickets', kind: 'note', url: null, tags: [], created_at: nowIso(), updated_at: nowIso(), archived_at: null }];
  let profile: Profile = { user_id: U, display_name: 'Devarsh', timezone: tz, locale: 'en-IN', week_starts_on: 1 };
  const reminders: import('./types').Reminder[] = [];
  const upd = <T extends { id: string }>(arr: T[], id: string, patch: Partial<T>): T => { const i = arr.findIndex((x) => x.id === id); arr[i] = { ...arr[i], ...patch, ...('updated_at' in arr[i] ? { updated_at: nowIso() } : {}) }; return arr[i]; };
  return {
    getProfile: async () => profile,
    updateProfile: async (p) => (profile = { ...profile, ...p }),
    listTasks: async () => tasks.filter((x) => !x.deleted_at),
    createTask: async (i) => { const n = t(i); tasks = [n, ...tasks]; return n; },
    updateTask: async (id, patch) => upd(tasks, id, patch),
    deleteTask: async (id) => { upd(tasks, id, { deleted_at: nowIso() }); },
    listProjects: async () => projects,
    createProject: async (i) => { const n: Project = { id: uid(), user_id: U, description: null, category: null, status: 'active', due_date: null, created_at: nowIso(), archived_at: null, ...i }; projects = [n, ...projects]; return n; },
    updateProject: async (id, patch) => upd(projects, id, patch),
    listEvents: async (from, to) => events.filter((e) => !e.deleted_at && e.starts_at < to && e.ends_at > from).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    createEvent: async (i) => { const n: AvenEvent = { id: uid(), user_id: U, description: null, location: null, all_day: false, deleted_at: null, ...i }; events = [...events, n]; return n; },
    deleteEvent: async (id) => { upd(events, id, { deleted_at: nowIso() }); },
    createReminder: async (i) => { const r = { id: uid(), task_id: null, event_id: null, title: null, status: 'scheduled' as const, ...i }; reminders.push(r); return r; },
    listReminders: async () => reminders,
    listInbox: async () => inbox.filter((x) => x.status === 'new' || x.status === 'needs_review'),
    captureInbox: async (text) => { const n: InboxItem = { id: uid(), user_id: U, raw_text: text, raw_kind: 'text', status: 'new', resolved_entity_type: null, resolved_entity_id: null, created_at: nowIso(), resolved_at: null }; inbox = [n, ...inbox]; return n; },
    resolveInbox: async (id, status, et, eid) => { upd(inbox, id, { status, resolved_entity_type: et ?? null, resolved_entity_id: eid ?? null, resolved_at: nowIso() }); },
    listNotes: async () => notes.filter((n) => !n.archived_at),
    createNote: async (i) => { const n: Note = { id: uid(), user_id: U, title: null, kind: 'note', url: null, tags: [], created_at: nowIso(), updated_at: nowIso(), archived_at: null, ...i }; notes = [n, ...notes]; return n; },
    updateNote: async (id, patch) => upd(notes, id, patch),
    deleteNote: async (id) => { upd(notes, id, { archived_at: nowIso() }); },
    exportAll: async () => ({ demo: true, tasks, projects, events, notes, inbox }),
  };
}
