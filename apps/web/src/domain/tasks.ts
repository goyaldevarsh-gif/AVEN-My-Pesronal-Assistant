import type { Task } from '@/data/types';
import { addDaysKey, addMonthsKey, dayKey, todayKey } from './dates';

export const isOpen = (t: Task) => !t.deleted_at && t.status !== 'done' && t.status !== 'cancelled';
export const dueKey = (t: Task, tz: string): string | null => t.due_date ?? (t.due_at ? dayKey(t.due_at, tz) : null);
export const isSnoozed = (t: Task, now: Date) => !!t.snoozed_until && new Date(t.snoozed_until) > now;

/** Timed tasks become overdue when the time passes; date-only tasks when the day has passed. */
export function isOverdue(t: Task, tz: string, now = new Date()): boolean {
  if (!isOpen(t) || isSnoozed(t, now)) return false;
  if (t.due_at && !t.due_date) return new Date(t.due_at) < now;
  const k = dueKey(t, tz);
  return !!k && k < todayKey(tz, now);
}
export const isDueToday = (t: Task, tz: string, now = new Date()) =>
  isOpen(t) && !isSnoozed(t, now) && !isOverdue(t, tz, now) && dueKey(t, tz) === todayKey(tz, now);

export const followUpsDue = (tasks: Task[], tz: string, now = new Date()) =>
  tasks.filter((t) => isOpen(t) && t.status === 'waiting' && t.follow_up_at && dayKey(t.follow_up_at, tz) <= todayKey(tz, now));

export const topPriorities = (tasks: Task[]) => tasks.filter((t) => isOpen(t) && t.is_top_priority && !t.parent_task_id).slice(0, 3);
export const MAX_TOP = 3;

const byPriorityThenDue = (tz: string) => (a: Task, b: Task) =>
  a.priority - b.priority || (dueKey(a, tz) ?? '9999').localeCompare(dueKey(b, tz) ?? '9999') || a.created_at.localeCompare(b.created_at);
export const sortTasks = (tasks: Task[], tz: string) => [...tasks].sort(byPriorityThenDue(tz));

/** Supported RRULE subset: FREQ=DAILY|WEEKLY|MONTHLY[;INTERVAL=n]. Returns next date key after `fromKey`. */
export function nextRecurrence(rule: string | null, fromKey: string): string | null {
  if (!rule) return null;
  const p = Object.fromEntries(rule.replace(/^RRULE:/, '').split(';').map((kv) => kv.split('=')));
  const n = Math.max(1, parseInt(p.INTERVAL ?? '1', 10) || 1);
  if (p.FREQ === 'DAILY') return addDaysKey(fromKey, n);
  if (p.FREQ === 'WEEKLY') return addDaysKey(fromKey, 7 * n);
  if (p.FREQ === 'MONTHLY') return addMonthsKey(fromKey, n);
  return null;
}
export const RECURRENCE_OPTIONS = [
  { label: 'Does not repeat', value: '' }, { label: 'Every day', value: 'FREQ=DAILY' },
  { label: 'Every week', value: 'FREQ=WEEKLY' }, { label: 'Every month', value: 'FREQ=MONTHLY' },
];

export function projectProgress(tasks: Task[], projectId: string) {
  const own = tasks.filter((t) => t.project_id === projectId && !t.deleted_at && t.status !== 'cancelled' && !t.parent_task_id);
  const done = own.filter((t) => t.status === 'done').length;
  return { done, total: own.length, pct: own.length ? Math.round((done / own.length) * 100) : 0 };
}
