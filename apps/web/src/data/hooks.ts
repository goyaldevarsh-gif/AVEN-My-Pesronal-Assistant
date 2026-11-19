import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from './context';
import type { AvenEvent, EventInput, InboxItem, Note, NoteInput, Project, ProjectInput, Task, TaskInput } from './types';
import { dayKey, hhmmInTz, zonedToUtc } from '@/domain/dates';
import { nowTick } from '@/domain/clock';
import { nextRecurrence } from '@/domain/tasks';

export const keys = { tasks: ['tasks'], projects: ['projects'], inbox: ['inbox'], notes: ['notes'], events: (a: string, b: string) => ['events', a, b], reminders: ['reminders'] };

export const useTasks = () => { const { repo } = useApp(); return useQuery({ queryKey: keys.tasks, queryFn: () => repo.listTasks() }); };
export const useProjects = () => { const { repo } = useApp(); return useQuery({ queryKey: keys.projects, queryFn: () => repo.listProjects() }); };
export const useInbox = () => { const { repo } = useApp(); return useQuery({ queryKey: keys.inbox, queryFn: () => repo.listInbox() }); };
export const useNotes = () => { const { repo } = useApp(); return useQuery({ queryKey: keys.notes, queryFn: () => repo.listNotes() }); };
export const useEvents = (from: string, to: string) => { const { repo } = useApp(); return useQuery({ queryKey: keys.events(from, to), queryFn: () => repo.listEvents(from, to) }); };

/** Optimistic helper: apply `fn` to a cached list immediately, roll back on error, refetch after. */
function useListMutation<A, T extends { id: string }>(key: readonly unknown[], run: (a: A) => Promise<unknown>, optimistic: (list: T[], a: A) => T[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: run,
    onMutate: async (a: A) => { await qc.cancelQueries({ queryKey: key }); const prev = qc.getQueryData<T[]>(key); if (prev) qc.setQueryData(key, optimistic(prev, a)); return { prev }; },
    onError: (_e, _a, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); },
    onSettled: () => { void qc.invalidateQueries({ queryKey: key }); },
  });
}

export function useTaskActions() {
  const { repo, tz } = useApp(); const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: keys.tasks });
  const update = useListMutation<{ id: string; patch: Partial<Task> }, Task>(keys.tasks, ({ id, patch }) => repo.updateTask(id, patch), (l, { id, patch }) => l.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = useListMutation<string, Task>(keys.tasks, (id) => repo.deleteTask(id), (l, id) => l.filter((t) => t.id !== id));
  return {
    update: update.mutateAsync, remove: remove.mutateAsync,
    create: async (i: TaskInput) => { const t = await repo.createTask(i); await refresh(); return t; },
    /** Completing a recurring task closes this occurrence (kept as history) and creates the next one. */
    complete: async (t: Task) => {
      const done = new Date().toISOString();
      await update.mutateAsync({ id: t.id, patch: { status: 'done', completed_at: done, is_top_priority: false } });
      const base = t.due_date ?? (t.due_at ? dayKey(t.due_at, tz) : null);
      const next = base ? nextRecurrence(t.recurrence_rule, base) : null;
      if (next) {
        
        await repo.createTask({ title: t.title, notes: t.notes, priority: t.priority, category: t.category, project_id: t.project_id, recurrence_rule: t.recurrence_rule,
          due_date: t.due_date ? next : null, due_at: t.due_at ? zonedToUtc(next, hhmmInTz(t.due_at, tz), tz).toISOString() : null, source: t.source });
        await refresh();
      }
    },
    reopen: (t: Task) => update.mutateAsync({ id: t.id, patch: { status: 'todo', completed_at: null } }),
  };
}
export function useProjectActions() {
  const { repo } = useApp(); const qc = useQueryClient();
  return { create: async (i: ProjectInput): Promise<Project> => { const p = await repo.createProject(i); await qc.invalidateQueries({ queryKey: keys.projects }); return p; },
    update: async (id: string, patch: Partial<Project>) => { await repo.updateProject(id, patch); await qc.invalidateQueries({ queryKey: keys.projects }); } };
}
export function useEventActions() {
  const { repo } = useApp(); const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['events'] });
  return { create: async (i: EventInput): Promise<AvenEvent> => { const e = await repo.createEvent(i); await refresh(); return e; }, remove: async (id: string) => { await repo.deleteEvent(id); await refresh(); } };
}
export function useInboxActions() {
  const { repo } = useApp(); const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: keys.inbox });
  return {
    capture: async (text: string): Promise<InboxItem> => { const i = await repo.captureInbox(text.trim()); await refresh(); return i; },
    resolve: async (id: string, status: 'confirmed' | 'dismissed', et?: string, eid?: string) => { await repo.resolveInbox(id, status, et, eid); await refresh(); },
  };
}
export function useNoteActions() {
  const { repo } = useApp(); const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: keys.notes });
  return { create: async (i: NoteInput): Promise<Note> => { const n = await repo.createNote(i); await refresh(); return n; },
    update: async (id: string, p: Partial<Note>) => { await repo.updateNote(id, p); await refresh(); }, remove: async (id: string) => { await repo.deleteNote(id); await refresh(); } };
}
export { nowTick };
