import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, MapPin } from 'lucide-react';
import { useApp } from '@/data/context';
import { useEvents, useEventActions, useProjectActions, useProjects, useTaskActions, useTasks } from '@/data/hooks';
import type { AvenEvent, Project, Task } from '@/data/types';
import { addDaysKey, dayKey, dayRangeUtc, formatDayLong, formatTime, todayKey, zonedToUtc, hhmmInTz } from '@/domain/dates';
import { useNow } from '@/domain/clock';
import { dueKey, isOpen, isOverdue, isSnoozed, projectProgress, sortTasks } from '@/domain/tasks';
import { Button, Card, Chip, Empty, ErrorState, Field, Input, Segmented, SectionTitle, Sheet, Skeleton, Textarea } from '@/ui/kit';
import { LargeHeader } from '@/ui/TabBar';
import { TaskRow } from './TaskRow';
import { useToast } from '@/ui/toast';

type Sub = 'tasks' | 'projects' | 'calendar';
type Filter = 'all' | 'today' | 'upcoming' | 'waiting' | 'done';

export function Plan({ onOpenTask, onNewTask, headerRight }: { onOpenTask: (t: Task) => void; onNewTask: (d?: Partial<Task>) => void; headerRight: React.ReactNode }) {
  const [sub, setSub] = useState<Sub>('tasks');
  return (
    <>
      <LargeHeader title="Plan" right={<div className="flex items-center gap-1">{sub !== 'calendar' && <button aria-label={sub === 'tasks' ? 'New task' : 'New project'} onClick={() => (sub === 'tasks' ? onNewTask() : window.dispatchEvent(new Event('aven:new-project')))} className="w-10 h-10 grid place-items-center text-accent"><Plus size={24} strokeWidth={1.75} /></button>}{headerRight}</div>} />
      <div className="px-4 pb-4"><Segmented value={sub} onChange={setSub} options={[{ value: 'tasks', label: 'Tasks' }, { value: 'projects', label: 'Projects' }, { value: 'calendar', label: 'Calendar' }]} /></div>
      <div className="px-4 pb-6">
        {sub === 'tasks' && <TasksView onOpenTask={onOpenTask} onNewTask={onNewTask} />}
        {sub === 'projects' && <ProjectsView onOpenTask={onOpenTask} onNewTask={onNewTask} />}
        {sub === 'calendar' && <CalendarView onOpenTask={onOpenTask} />}
      </div>
    </>
  );
}

function TasksView({ onOpenTask, onNewTask }: { onOpenTask: (t: Task) => void; onNewTask: () => void }) {
  const { tz } = useApp(); const now = useNow(); const toast = useToast(); const q = useTasks(); const { data: projects = [] } = useProjects(); const actions = useTaskActions();
  const [filter, setFilter] = useState<Filter>('all'); const today = todayKey(tz, now);
  const toggle = async (t: Task) => { if (t.status === 'done') await actions.reopen(t); else { await actions.complete(t); toast(`Completed “${t.title}”`, () => void actions.reopen(t)); } };
  const roots = (q.data ?? []).filter((t) => !t.parent_task_id);
  const open = roots.filter(isOpen);
  const groups = useMemo(() => {
    const s = (a: Task[]) => sortTasks(a, tz);
    if (filter === 'done') return [{ title: 'Completed', items: roots.filter((t) => t.status === 'done').sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? '')).slice(0, 100) }];
    if (filter === 'waiting') return [{ title: 'Waiting for', items: s(open.filter((t) => t.status === 'waiting')) }];
    if (filter === 'today') return [{ title: 'Overdue', items: s(open.filter((t) => isOverdue(t, tz, now))) }, { title: 'Today', items: s(open.filter((t) => !isOverdue(t, tz, now) && !isSnoozed(t, now) && dueKey(t, tz) === today)) }];
    if (filter === 'upcoming') return [{ title: 'Upcoming', items: s(open.filter((t) => (dueKey(t, tz) ?? '') > today)) }];
    return [
      { title: 'Overdue', items: s(open.filter((t) => isOverdue(t, tz, now))) },
      { title: 'Today', items: s(open.filter((t) => !isOverdue(t, tz, now) && !isSnoozed(t, now) && dueKey(t, tz) === today)) },
      { title: 'Upcoming', items: s(open.filter((t) => !isSnoozed(t, now) && (dueKey(t, tz) ?? '') > today)) },
      { title: 'No date', items: s(open.filter((t) => !isSnoozed(t, now) && !dueKey(t, tz))) },
      { title: 'Snoozed', items: open.filter((t) => isSnoozed(t, now)) },
    ];
  }, [roots, open, filter, tz, now, today]);
  const shown = groups.filter((g) => g.items.length);
  return (
    <>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-3">{(['all', 'today', 'upcoming', 'waiting', 'done'] as Filter[]).map((f) => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{{ all: 'All', today: 'Today', upcoming: 'Upcoming', waiting: 'Waiting for', done: 'Done' }[f]}</Chip>)}</div>
      {q.isLoading && !q.data ? <Skeleton /> : q.isError && !q.data ? <ErrorState message={(q.error as Error).message} onRetry={() => void q.refetch()} /> : shown.length === 0 ? (
        filter === 'all' ? <Empty image="empty-tasks" title="No tasks yet" text="Capture a task or add one to get started." action={<Button onClick={onNewTask}>Add task</Button>} />
          : <Empty title="Nothing here" text="No tasks match this filter." />
      ) : shown.map((g) => (
        <div key={g.title}><SectionTitle count={g.items.length}>{g.title}</SectionTitle><Card>{g.items.map((t) => <TaskRow key={t.id} task={t} tz={tz} now={now} project={projects.find((p) => p.id === t.project_id)} onToggle={toggle} onOpen={onOpenTask} />)}</Card></div>
      ))}
    </>
  );
}

function ProjectsView({ onOpenTask, onNewTask }: { onOpenTask: (t: Task) => void; onNewTask: (d?: Partial<Task>) => void }) {
  const { tz } = useApp(); const now = useNow(); const { data: projects = [], isLoading } = useProjects(); const { data: tasks = [] } = useTasks();
  const pa = useProjectActions(); const actions = useTaskActions();
  const [create, setCreate] = useState(false); const [openId, setOpenId] = useState<string | null>(null);
  const [title, setTitle] = useState(''); const [due, setDue] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { const h = () => setCreate(true); window.addEventListener('aven:new-project', h); return () => window.removeEventListener('aven:new-project', h); }, []);
  const proj = projects.find((p) => p.id === openId);
  const ptasks = sortTasks(tasks.filter((t) => t.project_id === openId && !t.parent_task_id && isOpen(t)), tz);
  async function add() { if (!title.trim()) { setErr('Give the project a name.'); return; } await pa.create({ title: title.trim(), due_date: due || null }); setTitle(''); setDue(''); setErr(''); setCreate(false); }
  return (
    <>
      {isLoading ? <Skeleton rows={3} /> : projects.length === 0 ? <Empty image="empty-tasks" title="No projects yet" text="Group related tasks toward an outcome." action={<Button onClick={() => setCreate(true)}>New project</Button>} /> : (
        <Card>{projects.map((p) => { const pr = projectProgress(tasks, p.id); return (
          <button key={p.id} onClick={() => setOpenId(p.id)} className="w-full text-left px-4 py-3 border-b border-line last:border-b-0 active:bg-surface2">
            <div className="flex justify-between gap-3"><p className="text-[16px] font-medium truncate">{p.title}</p><span className="text-[13px] text-ink2 shrink-0">{pr.done}/{pr.total}</span></div>
            <div className="h-1.5 rounded-full bg-surface2 mt-2 overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${pr.pct}%` }} /></div>
            {p.due_date && <p className="text-[12px] text-ink2 mt-1.5">Due {p.due_date}</p>}
          </button>); })}</Card>
      )}
      <Sheet open={create} onClose={() => setCreate(false)} title="New project" footer={<div>{err && <p className="text-warn text-[13px] mb-2">{err}</p>}<Button block onClick={add}>Create project</Button></div>}>
        <Field label="Name"><Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website redesign" maxLength={200} /></Field>
        <Field label="Target date (optional)"><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
      </Sheet>
      <Sheet open={!!proj} onClose={() => setOpenId(null)} title={proj?.title ?? ''} footer={proj && <Button block onClick={() => { const id = proj.id; setOpenId(null); onNewTask({ project_id: id }); }}>Add task to project</Button>}>
        {proj && <ProjectBody project={proj} pr={projectProgress(tasks, proj.id)} onComplete={() => void pa.update(proj.id, { status: proj.status === 'completed' ? 'active' : 'completed' })}>
          {ptasks.length === 0 ? <p className="text-[14px] text-ink2 py-3">No open tasks in this project.</p> : <Card>{ptasks.map((t) => <TaskRow key={t.id} task={t} tz={tz} now={now} showProject={false} onToggle={(x) => void actions.complete(x)} onOpen={(x) => { setOpenId(null); onOpenTask(x); }} />)}</Card>}
        </ProjectBody>}
      </Sheet>
    </>
  );
}
function ProjectBody({ project, pr, onComplete, children }: { project: Project; pr: { done: number; total: number; pct: number }; onComplete: () => void; children: React.ReactNode }) {
  return (<div><p className="text-[14px] text-ink2 mb-2">{pr.done} of {pr.total} tasks done · {pr.pct}%</p><div className="h-2 rounded-full bg-surface2 mb-4 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${pr.pct}%` }} /></div>{children}
    <Button variant="secondary" block className="mt-4" onClick={onComplete}>{project.status === 'completed' ? 'Reopen project' : 'Mark project completed'}</Button></div>);
}

function CalendarView({ onOpenTask }: { onOpenTask: (t: Task) => void }) {
  const { tz } = useApp(); const now = useNow(); const toast = useToast(); const actions = useTaskActions(); const ea = useEventActions();
  const today = todayKey(tz, now); const [day, setDay] = useState(today);
  const { from, to } = dayRangeUtc(day, tz); const q = useEvents(from.toISOString(), to.toISOString());
  const { data: tasks = [] } = useTasks(); const { data: projects = [] } = useProjects();
  const dayTasks = sortTasks(tasks.filter((t) => !t.parent_task_id && isOpen(t) && dueKey(t, tz) === day), tz);
  const [sheet, setSheet] = useState<AvenEvent | 'new' | null>(null);
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <button aria-label="Previous day" onClick={() => setDay(addDaysKey(day, -1))} className="w-11 h-11 grid place-items-center text-ink2"><ChevronLeft /></button>
        <button onClick={() => setDay(today)} className="text-center"><p className="font-display font-semibold text-[17px]">{formatDayLong(day)}</p>{day !== today && <p className="text-[12px] text-accent">Back to today</p>}</button>
        <button aria-label="Next day" onClick={() => setDay(addDaysKey(day, 1))} className="w-11 h-11 grid place-items-center text-ink2"><ChevronRight /></button>
      </div>
      <SectionTitle count={q.data?.length ?? 0} action={<button className="text-[13px] font-semibold text-accent" onClick={() => setSheet('new')}>Add event</button>}>Events</SectionTitle>
      {q.isLoading && !q.data ? <Skeleton rows={2} /> : q.isError && !q.data ? <ErrorState message={(q.error as Error).message} /> : (q.data?.length ? (
        <Card>{q.data.map((e) => (
          <button key={e.id} onClick={() => setSheet(e)} className="w-full text-left flex gap-3 px-4 py-3 border-b border-line last:border-b-0 active:bg-surface2">
            <div className="w-[76px] shrink-0 text-[13px] text-ink2 pt-0.5">{e.all_day ? 'All day' : <>{formatTime(e.starts_at, tz)}<br />{formatTime(e.ends_at, tz)}</>}</div>
            <div className="min-w-0"><p className="text-[16px]">{e.title}</p>{e.location && <p className="text-[13px] text-ink2 flex items-center gap-1"><MapPin size={12} />{e.location}</p>}</div>
          </button>))}</Card>
      ) : <Empty image="empty-events" title="No events" text="A calm day. Add an event or plan something." action={<Button onClick={() => setSheet('new')}>Add event</Button>} />)}
      {dayTasks.length > 0 && <><SectionTitle count={dayTasks.length}>Tasks due</SectionTitle><Card>{dayTasks.map((t) => <TaskRow key={t.id} task={t} tz={tz} now={now} project={projects.find((p) => p.id === t.project_id)} onToggle={async (x) => { await actions.complete(x); toast(`Completed “${x.title}”`, () => void actions.reopen(x)); }} onOpen={onOpenTask} />)}</Card></>}
      <EventSheet value={sheet} day={day} onClose={() => setSheet(null)} onSave={async (i) => { await ea.create(i); setSheet(null); }} onDelete={async (id) => { await ea.remove(id); setSheet(null); toast('Event deleted'); }} />
    </>
  );
}

function EventSheet({ value, day, onClose, onSave, onDelete }: { value: AvenEvent | 'new' | null; day: string; onClose: () => void; onSave: (i: { title: string; starts_at: string; ends_at: string; location: string | null; description: string | null }) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const { tz } = useApp(); const ev = value && value !== 'new' ? value : null;
  const [f, setF] = useState({ title: '', date: day, start: '09:00', end: '10:00', location: '', description: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [key, setKey] = useState('');
  const k = ev?.id ?? (value === 'new' ? `new-${day}` : '');
  if (k !== key) { setKey(k); if (value === 'new') setF({ title: '', date: day, start: '09:00', end: '10:00', location: '', description: '' }); else if (ev) setF({ title: ev.title, date: dayKey(ev.starts_at, tz), start: hhmmInTz(ev.starts_at, tz), end: hhmmInTz(ev.ends_at, tz), location: ev.location ?? '', description: ev.description ?? '' }); setErr(''); }
  async function save() {
    if (!f.title.trim()) { setErr('Give the event a title.'); return; }
    const s = zonedToUtc(f.date, f.start, tz), e = zonedToUtc(f.date, f.end, tz);
    if (e <= s) { setErr('End time must be after the start time.'); return; }
    setBusy(true); try { await onSave({ title: f.title.trim(), starts_at: s.toISOString(), ends_at: e.toISOString(), location: f.location.trim() || null, description: f.description.trim() || null }); } catch (x) { setErr(x instanceof Error ? x.message : 'Could not save.'); } finally { setBusy(false); }
  }
  const view = !!ev;
  return (
    <Sheet open={!!value} onClose={onClose} title={view ? 'Event' : 'New event'} footer={view ? <Button variant="danger" block onClick={() => void onDelete(ev!.id)}>Delete event</Button> : <div>{err && <p className="text-warn text-[13px] mb-2" role="alert">{err}</p>}<Button block busy={busy} onClick={save}>Add event</Button></div>}>
      {view ? (<div><p className="text-[20px] font-display font-semibold">{ev!.title}</p><p className="text-ink2 mt-1">{formatTime(ev!.starts_at, tz)} – {formatTime(ev!.ends_at, tz)}</p>{ev!.location && <p className="mt-3 flex items-center gap-1.5"><MapPin size={16} />{ev!.location}</p>}{ev!.description && <p className="mt-3 text-ink2">{ev!.description}</p>}</div>) : (
        <>
          <Field label="Title"><Input autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Event title" /></Field>
          <Field label="Date"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Starts"><Input type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></Field><Field label="Ends"><Input type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></Field></div>
          <Field label="Location (optional)"><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
          <Field label="Notes (optional)"><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        </>)}
    </Sheet>
  );
}
