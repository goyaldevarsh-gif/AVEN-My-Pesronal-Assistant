import type { SupabaseClient } from '@supabase/supabase-js';
import type { AvenEvent, EventInput, InboxItem, Note, NoteInput, Profile, Project, ProjectInput, Reminder, ReminderInput, Repo, Task, TaskInput } from './types';

function ok<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export function createSupabaseRepo(sb: SupabaseClient, userId: string): Repo {
  const touch = <T extends object>(p: T) => ({ ...p, updated_at: new Date().toISOString() });
  return {
    async getProfile() {
      const r = await sb.from('profiles').select('*').eq('user_id', userId).maybeSingle();
      if (r.error) throw new Error(r.error.message);
      if (r.data) return r.data as Profile;
      return ok(await sb.from('profiles').insert({ user_id: userId }).select('*').single()) as Profile; // safety net if signup trigger missed
    },
    async updateProfile(p) { return ok(await sb.from('profiles').update(touch(p)).eq('user_id', userId).select('*').single()) as Profile; },

    async listTasks() { return ok(await sb.from('tasks').select('*').is('deleted_at', null).order('created_at', { ascending: false }).limit(2000)) as Task[]; },
    async createTask(i: TaskInput) { return ok(await sb.from('tasks').insert(i).select('*').single()) as Task; },
    async updateTask(id, patch) { return ok(await sb.from('tasks').update(touch(patch)).eq('id', id).select('*').single()) as Task; },
    async deleteTask(id) { ok(await sb.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', id)); },

    async listProjects() { return ok(await sb.from('projects').select('*').is('archived_at', null).order('created_at', { ascending: false })) as Project[]; },
    async createProject(i: ProjectInput) { return ok(await sb.from('projects').insert(i).select('*').single()) as Project; },
    async updateProject(id, patch) { return ok(await sb.from('projects').update(touch(patch)).eq('id', id).select('*').single()) as Project; },

    async listEvents(from, to) {
      return ok(await sb.from('events').select('*').is('deleted_at', null).lt('starts_at', to).gt('ends_at', from).order('starts_at')) as AvenEvent[];
    },
    async createEvent(i: EventInput) { return ok(await sb.from('events').insert(i).select('*').single()) as AvenEvent; },
    async deleteEvent(id) { ok(await sb.from('events').update({ deleted_at: new Date().toISOString() }).eq('id', id)); },

    async createReminder(i: ReminderInput) { return ok(await sb.from('reminders').insert(i).select('*').single()) as Reminder; },
    async listReminders() { return ok(await sb.from('reminders').select('*').eq('status', 'scheduled').order('remind_at')) as Reminder[]; },

    async listInbox() { return ok(await sb.from('inbox_items').select('*').in('status', ['new', 'needs_review']).order('created_at', { ascending: false })) as InboxItem[]; },
    async captureInbox(text) { return ok(await sb.from('inbox_items').insert({ raw_text: text, raw_kind: 'text' }).select('*').single()) as InboxItem; },
    async resolveInbox(id, status, entityType, entityId) {
      ok(await sb.from('inbox_items').update({ status, resolved_entity_type: entityType ?? null, resolved_entity_id: entityId ?? null, resolved_at: new Date().toISOString() }).eq('id', id));
    },

    async listNotes() { return ok(await sb.from('notes').select('*').is('archived_at', null).order('updated_at', { ascending: false })) as Note[]; },
    async createNote(i: NoteInput) { return ok(await sb.from('notes').insert(i).select('*').single()) as Note; },
    async updateNote(id, patch) { return ok(await sb.from('notes').update(touch(patch)).eq('id', id).select('*').single()) as Note; },
    async deleteNote(id) { ok(await sb.from('notes').update({ archived_at: new Date().toISOString() }).eq('id', id)); },

    async exportAll() {
      const tables = ['profiles', 'projects', 'tasks', 'events', 'reminders', 'notes', 'inbox_items'];
      const out: Record<string, unknown> = { exported_at: new Date().toISOString() };
      for (const t of tables) out[t] = ok(await sb.from(t).select('*'));
      return out;
    },
  };
}
