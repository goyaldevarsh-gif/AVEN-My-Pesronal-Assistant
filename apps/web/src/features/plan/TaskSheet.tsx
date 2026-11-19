import { useEffect, useMemo, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useApp } from '@/data/context';
import { keys, useProjects, useTaskActions, useTasks } from '@/data/hooks';
import { useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/data/types';
import { addDaysKey, dayKey, hhmmInTz, todayKey, zonedToUtc } from '@/domain/dates';
import { MAX_TOP, RECURRENCE_OPTIONS, dueKey, isOpen } from '@/domain/tasks';
import { Button, Chip, Field, Input, Select, Sheet, Textarea, cx } from '@/ui/kit';
import { Check_ } from '@/ui/kit';
import { useToast } from '@/ui/toast';

const REMIND = [{ v: '', l: 'No reminder' }, { v: '0', l: 'At due time' }, { v: '15', l: '15 minutes before' }, { v: '60', l: '1 hour before' }, { v: '1440', l: '1 day before' }];

export function TaskSheet({ open, onClose, task, defaults }: { open: boolean; onClose: () => void; task?: Task | null; defaults?: Partial<Task> }) {
  const { repo, tz } = useApp(); const toast = useToast();
  const { data: projects = [] } = useProjects(); const { data: all = [] } = useTasks();
  const actions = useTaskActions(); const qc = useQueryClient();
  const [f, setF] = useState({ title: '', notes: '', date: '', time: '', priority: 2 as 1 | 2 | 3 | 4, projectId: '', repeat: '', waiting: false, waitingOn: '', followUp: '', top: false, remind: '' });
  const [sub, setSub] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const subs = useMemo(() => (task ? all.filter((t) => t.parent_task_id === task.id) : []), [all, task]);

  useEffect(() => {
    if (!open) return; setErr(''); setSub('');
    const src = task ?? (defaults as Task | undefined);
    setF({
      title: src?.title ?? '', notes: src?.notes ?? '', date: src ? (dueKey(src as Task, tz) ?? '') : '', time: src?.due_at && !src.due_date ? hhmmInTz(src.due_at, tz) : '',
      priority: (src?.priority as 1 | 2 | 3 | 4) ?? 2, projectId: src?.project_id ?? '', repeat: src?.recurrence_rule ?? '', waiting: src?.status === 'waiting',
      waitingOn: src?.waiting_on_text ?? '', followUp: src?.follow_up_at ? dayKey(src.follow_up_at, tz) : '', top: !!src?.is_top_priority, remind: '',
    });
  }, [open, task, defaults, tz]);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  async function save() {
    if (!f.title.trim()) { setErr('Give the task a title.'); return; }
    if (f.remind && !f.date) { setErr('A reminder needs a due date.'); return; }
    if (f.top && !task?.is_top_priority && all.filter((t) => isOpen(t) && t.is_top_priority && t.id !== task?.id).length >= MAX_TOP) { setErr('Top 3 is full. Un-star one first.'); return; }
    if (f.repeat && !f.date) { setErr('Repeating tasks need a due date.'); return; }
    setBusy(true); setErr('');
    try {
      const timed = f.date && f.time;
      const due_at = timed ? zonedToUtc(f.date, f.time, tz).toISOString() : null;
      const patch = {
        title: f.title.trim(), notes: f.notes.trim() || null, priority: f.priority, project_id: f.projectId || null, recurrence_rule: f.repeat || null,
        due_date: f.date && !timed ? f.date : null, due_at, is_top_priority: f.top,
        status: f.waiting ? ('waiting' as const) : task?.status === 'waiting' ? ('todo' as const) : task?.status ?? ('todo' as const),
        waiting_on_text: f.waiting ? f.waitingOn.trim() || null : null,
        follow_up_at: f.waiting && f.followUp ? zonedToUtc(f.followUp, '09:00', tz).toISOString() : null,
      };
      const saved = task ? (await actions.update({ id: task.id, patch }), task) : await actions.create({ ...patch, source: defaults?.source ?? 'manual' });
      if (f.remind) {
        const base = timed ? zonedToUtc(f.date, f.time, tz) : zonedToUtc(f.date, '09:00', tz);
        await repo.createReminder({ task_id: saved.id, title: patch.title, remind_at: new Date(base.getTime() - Number(f.remind) * 60000).toISOString() });
        toast('Reminder saved. Push delivery arrives with notifications.');
      }
      onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not save.'); } finally { setBusy(false); }
  }
  async function reschedule(days: number) { if (!task) return; const base = dueKey(task, tz) ?? todayKey(tz); const k = addDaysKey(days === 0 ? todayKey(tz) : base < todayKey(tz) ? todayKey(tz) : base, days);
    await actions.update({ id: task.id, patch: task.due_at && !task.due_date ? { due_at: zonedToUtc(k, hhmmInTz(task.due_at, tz), tz).toISOString() } : { due_date: k } }); onClose(); toast(`Moved to ${k}`); }
  async function snooze() { if (!task) return; await actions.update({ id: task.id, patch: { snoozed_until: zonedToUtc(addDaysKey(todayKey(tz), 1), '09:00', tz).toISOString() } }); onClose(); toast('Snoozed until tomorrow 9 AM'); }
  async function remove() { if (!task) return; await actions.remove(task.id); onClose(); toast('Task deleted', () => { void repo.updateTask(task.id, { deleted_at: null }).then(() => qc.invalidateQueries({ queryKey: keys.tasks })); }); }

  return (
    <Sheet open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'} footer={
      <div>{err && <p className="text-warn text-[13px] mb-2" role="alert">{err}</p>}<Button block busy={busy} onClick={save}>{task ? 'Save' : 'Add task'}</Button></div>}>
      <Field label="Title"><Input autoFocus={!task} value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="What needs to be done?" maxLength={300} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Due date"><Input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
        <Field label="Time (optional)"><Input type="time" value={f.time} disabled={!f.date} onChange={(e) => set('time', e.target.value)} /></Field>
      </div>
      <div className="flex gap-2 -mt-2 mb-4 overflow-x-auto">
        <Chip onClick={() => set('date', todayKey(tz))}>Today</Chip><Chip onClick={() => set('date', addDaysKey(todayKey(tz), 1))}>Tomorrow</Chip>
        <Chip onClick={() => set('date', addDaysKey(todayKey(tz), 7))}>Next week</Chip>{f.date && <Chip onClick={() => { set('date', ''); set('time', ''); }}>Clear</Chip>}
      </div>
      <Field label="Priority">
        <div className="grid grid-cols-4 gap-2">{([1, 2, 3, 4] as const).map((p) => <Chip key={p} active={f.priority === p} onClick={() => set('priority', p)}>{['High', 'Medium', 'Low', 'None'][p - 1]}</Chip>)}</div>
      </Field>
      <Field label="Project"><Select value={f.projectId} onChange={(e) => set('projectId', e.target.value)}><option value="">No project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</Select></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Repeat"><Select value={f.repeat} onChange={(e) => set('repeat', e.target.value)}>{RECURRENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></Field>
        <Field label="Remind me"><Select value={f.remind} onChange={(e) => set('remind', e.target.value)}>{REMIND.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</Select></Field>
      </div>
      <button onClick={() => set('top', !f.top)} className={cx('w-full h-11 mb-4 rounded-ctl border flex items-center gap-2 px-3 text-[15px]', f.top ? 'border-accent text-accent bg-accentSoft' : 'border-line text-ink bg-surface')}><Star size={18} strokeWidth={1.75} fill={f.top ? 'currentColor' : 'none'} />Top 3 priority for today</button>
      <button onClick={() => set('waiting', !f.waiting)} className={cx('w-full h-11 mb-2 rounded-ctl border px-3 text-left text-[15px]', f.waiting ? 'border-accent text-accent bg-accentSoft' : 'border-line bg-surface')}>Waiting on someone</button>
      {f.waiting && <div className="grid grid-cols-2 gap-3 mt-2"><Field label="Waiting on"><Input value={f.waitingOn} onChange={(e) => set('waitingOn', e.target.value)} placeholder="Name" /></Field><Field label="Follow up on"><Input type="date" value={f.followUp} onChange={(e) => set('followUp', e.target.value)} /></Field></div>}
      <Field label="Notes"><Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Details, links, context" /></Field>
      {task && (
        <>
          <Field label="Subtasks">
            <div className="rounded-ctl border border-line bg-surface">
              {subs.map((s) => <div key={s.id} className="flex items-center gap-2 px-3 border-b border-line"><Check_ done={s.status === 'done'} label={`Toggle ${s.title}`} onChange={() => (s.status === 'done' ? actions.reopen(s) : actions.complete(s))} /><span className={cx('text-[15px] flex-1', s.status === 'done' && 'line-through text-ink2')}>{s.title}</span></div>)}
              <form className="flex" onSubmit={async (e) => { e.preventDefault(); if (!sub.trim()) return; await actions.create({ title: sub.trim(), parent_task_id: task.id, project_id: task.project_id }); setSub(''); }}>
                <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="Add subtask" className="flex-1 h-11 px-3 bg-transparent outline-none text-[16px]" /><button className="px-4 text-accent font-semibold text-[15px]">Add</button>
              </form>
            </div>
          </Field>
          <div className="flex gap-2 flex-wrap mb-4"><Chip onClick={() => reschedule(0)}>Move to today</Chip><Chip onClick={() => reschedule(1)}>+1 day</Chip><Chip onClick={() => reschedule(7)}>+1 week</Chip><Chip onClick={snooze}>Snooze to tomorrow</Chip></div>
          <Button variant="danger" block onClick={remove}><Trash2 size={18} strokeWidth={1.75} />Delete task</Button>
        </>
      )}
    </Sheet>
  );
}
