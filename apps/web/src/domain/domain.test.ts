import { describe, expect, it } from 'vitest';
import { addDaysKey, addMonthsKey, dayKey, dayRangeUtc, formatTime, greeting, zonedToUtc } from './dates';
import { followUpsDue, isDueToday, isOverdue, nextRecurrence, projectProgress, topPriorities } from './tasks';
import type { Task } from '@/data/types';

const TZ = 'Asia/Kolkata';
const mk = (o: Partial<Task>): Task => ({ id: 'x', user_id: 'u', project_id: null, parent_task_id: null, title: 't', notes: null, status: 'todo', priority: 2, category: null,
  due_at: null, due_date: null, snoozed_until: null, recurrence_rule: null, waiting_on_text: null, follow_up_at: null, is_top_priority: false,
  completed_at: null, source: 'manual', created_at: '2026-11-01T00:00:00Z', updated_at: '2026-11-01T00:00:00Z', deleted_at: null, ...o });

describe('dates in Asia/Kolkata', () => {
  it('day key rolls over at IST midnight, not UTC', () => {
    expect(dayKey('2026-11-19T18:29:00Z', TZ)).toBe('2026-11-19');
    expect(dayKey('2026-11-19T18:31:00Z', TZ)).toBe('2026-11-20');
  });
  it('zonedToUtc converts IST wall time', () => {
    expect(zonedToUtc('2026-11-20', '10:00', TZ).toISOString()).toBe('2026-11-20T04:30:00.000Z');
    expect(zonedToUtc('2026-11-20', '00:00', TZ).toISOString()).toBe('2026-11-19T18:30:00.000Z');
  });
  it('handles DST zones too (New York spring forward)', () => {
    expect(zonedToUtc('2026-03-08', '12:00', 'America/New_York').toISOString()).toBe('2026-03-08T16:00:00.000Z');
  });
  it('day range spans 24h in IST', () => {
    const r = dayRangeUtc('2026-11-20', TZ);
    expect(r.to.getTime() - r.from.getTime()).toBe(24 * 3600 * 1000);
  });
  it('month add clamps end of month', () => {
    expect(addMonthsKey('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsKey('2028-01-31', 1)).toBe('2028-02-29');
    expect(addDaysKey('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('formats time and greeting', () => {
    expect(formatTime('2026-11-20T04:30:00Z', TZ)).toBe('10:00 AM');
    expect(greeting(new Date('2026-11-19T05:40:00Z'), TZ)).toBe('Good morning');
    expect(greeting(new Date('2026-11-19T13:00:00Z'), TZ)).toBe('Good evening');
  });
});

describe('task logic', () => {
  const now = new Date('2026-11-19T06:00:00Z'); // 11:30 IST on 19 Nov
  it('date-only overdue only after the day passes', () => {
    expect(isOverdue(mk({ due_date: '2026-11-18' }), TZ, now)).toBe(true);
    expect(isOverdue(mk({ due_date: '2026-11-19' }), TZ, now)).toBe(false);
    expect(isDueToday(mk({ due_date: '2026-11-19' }), TZ, now)).toBe(true);
  });
  it('timed task overdue once time passes', () => {
    expect(isOverdue(mk({ due_at: '2026-11-19T05:00:00Z' }), TZ, now)).toBe(true);
    expect(isOverdue(mk({ due_at: '2026-11-19T10:00:00Z' }), TZ, now)).toBe(false);
  });
  it('done, deleted and snoozed are never overdue', () => {
    expect(isOverdue(mk({ due_date: '2026-11-01', status: 'done' }), TZ, now)).toBe(false);
    expect(isOverdue(mk({ due_date: '2026-11-01', deleted_at: '2026-11-02T00:00:00Z' }), TZ, now)).toBe(false);
    expect(isOverdue(mk({ due_date: '2026-11-01', snoozed_until: '2026-11-20T00:00:00Z' }), TZ, now)).toBe(false);
  });
  it('follow-ups due include today and past, only waiting', () => {
    const ts = [mk({ id: 'a', status: 'waiting', follow_up_at: '2026-11-19T06:00:00Z' }), mk({ id: 'b', status: 'waiting', follow_up_at: '2026-11-25T06:00:00Z' }), mk({ id: 'c', status: 'todo', follow_up_at: '2026-11-18T06:00:00Z' })];
    expect(followUpsDue(ts, TZ, now).map((t) => t.id)).toEqual(['a']);
  });
  it('top priorities capped at 3 and exclude subtasks', () => {
    const ts = [1, 2, 3, 4].map((i) => mk({ id: String(i), is_top_priority: true })).concat(mk({ id: 'sub', is_top_priority: true, parent_task_id: '1' }));
    expect(topPriorities(ts)).toHaveLength(3);
  });
  it('recurrence', () => {
    expect(nextRecurrence('FREQ=DAILY', '2026-11-19')).toBe('2026-11-20');
    expect(nextRecurrence('FREQ=WEEKLY;INTERVAL=2', '2026-11-19')).toBe('2026-12-03');
    expect(nextRecurrence('FREQ=MONTHLY', '2026-01-31')).toBe('2026-02-28');
    expect(nextRecurrence(null, '2026-11-19')).toBeNull();
    expect(nextRecurrence('FREQ=YEARLY', '2026-11-19')).toBeNull();
  });
  it('project progress ignores subtasks and cancelled', () => {
    const ts = [mk({ project_id: 'p', status: 'done' }), mk({ project_id: 'p' }), mk({ project_id: 'p', status: 'cancelled' }), mk({ project_id: 'p', parent_task_id: 'z' })];
    expect(projectProgress(ts, 'p')).toEqual({ done: 1, total: 2, pct: 50 });
  });
});
