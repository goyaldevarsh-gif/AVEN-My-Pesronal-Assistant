import { useMemo, useState } from 'react';
import { Plus, Star } from 'lucide-react';
import { useApp } from '@/data/context';
import { useEvents, useProjects, useTaskActions, useTasks } from '@/data/hooks';
import type { Task } from '@/data/types';
import { addDaysKey, dayRangeUtc, formatDayLong, formatTime, greeting, todayKey } from '@/domain/dates';
import { useNow } from '@/domain/clock';
import { MAX_TOP, followUpsDue, isDueToday, isOpen, isOverdue, isSnoozed, sortTasks, topPriorities, dueKey } from '@/domain/tasks';
import { Button, Card, Empty, ErrorState, Sheet, SectionTitle, Skeleton } from '@/ui/kit';
import { TaskRow } from '@/features/plan/TaskRow';
import { LargeHeader } from '@/ui/TabBar';
import { useToast } from '@/ui/toast';
import { Check_ } from '@/ui/kit';

export function Today({ onOpenTask, onCapture, headerRight }: { onOpenTask: (t: Task) => void; onCapture: () => void; headerRight: React.ReactNode }) {
  const { tz, profile } = useApp(); const now = useNow(); const toast = useToast();
  const tasksQ = useTasks(); const { data: projects = [] } = useProjects(); const actions = useTaskActions();
  const today = todayKey(tz, now);
  const range = useMemo(() => ({ from: dayRangeUtc(today, tz).from.toISOString(), to: dayRangeUtc(addDaysKey(today, 7), tz).from.toISOString() }), [today, tz]);
  const eventsQ = useEvents(range.from, range.to);
  const [pick, setPick] = useState(false);

  const tasks = tasksQ.data ?? []; const events = eventsQ.data ?? [];
  const top = topPriorities(tasks);
  const topIds = new Set(top.map((t) => t.id));
  const roots = tasks.filter((t) => !t.parent_task_id);
  const overdue = sortTasks(roots.filter((t) => isOverdue(t, tz, now) && !topIds.has(t.id)), tz);
  const dueToday = sortTasks(roots.filter((t) => isDueToday(t, tz, now) && !topIds.has(t.id)), tz);
  const follow = followUpsDue(roots, tz, now).filter((t) => !topIds.has(t.id));
  const todayEnd = dayRangeUtc(today, tz).to.toISOString();
  const todayEvents = events.filter((e) => e.starts_at < todayEnd);
  const upcomingEvents = events.filter((e) => e.starts_at >= todayEnd).slice(0, 3);
  const upcomingTasks = sortTasks(roots.filter((t) => isOpen(t) && !isSnoozed(t, now) && (dueKey(t, tz) ?? '') > today && (dueKey(t, tz) ?? '') <= addDaysKey(today, 7)), tz).slice(0, 4);
  const projectOf = (t: Task) => projects.find((p) => p.id === t.project_id);

  const toggle = async (t: Task) => {
    if (t.status === 'done') { await actions.reopen(t); return; }
    await actions.complete(t); toast(`Completed “${t.title}”`, () => void actions.reopen(t));
  };
  const row = (t: Task) => <TaskRow key={t.id} task={t} tz={tz} now={now} project={projectOf(t)} onToggle={toggle} onOpen={onOpenTask} />;
  const nothing = !tasksQ.isLoading && !overdue.length && !dueToday.length && !follow.length && !top.length && !todayEvents.length;
  const name = profile?.display_name?.split(' ')[0];

  return (
    <>
      <LargeHeader title={`${greeting(now, tz)}${name ? `, ${name}` : ''}`} subtitle={formatDayLong(today)} right={headerRight} />
      <div className="px-4 pb-24">
        {tasksQ.isLoading && !tasksQ.data ? <Skeleton /> : tasksQ.isError && !tasksQ.data ? <ErrorState message={(tasksQ.error as Error).message} onRetry={() => void tasksQ.refetch()} /> : (
          <>
            <SectionTitle count={todayEvents.length}>Today’s schedule</SectionTitle>
            <Card>{todayEvents.length === 0 ? <p className="px-4 py-4 text-[14px] text-ink2">No events today.</p> : todayEvents.map((e) => (
              <div key={e.id} className="flex gap-3 px-4 py-3 border-b border-line last:border-b-0">
                <div className="w-[68px] shrink-0 text-[13px] text-ink2 pt-0.5">{e.all_day ? 'All day' : formatTime(e.starts_at, tz)}</div>
                <div className="min-w-0"><p className="text-[16px] leading-[22px]">{e.title}</p>{e.location && <p className="text-[13px] text-ink2 truncate">{e.location}</p>}</div>
              </div>))}</Card>

            <SectionTitle count={top.length} action={top.length < MAX_TOP && <button className="text-[13px] font-semibold text-accent" onClick={() => setPick(true)}>{top.length ? 'Edit' : 'Choose top 3'}</button>}>Top priorities</SectionTitle>
            <Card>{top.length ? top.map(row) : <p className="px-4 py-4 text-[14px] text-ink2">Pick up to three things that matter most today.</p>}</Card>

            {overdue.length > 0 && <><SectionTitle count={overdue.length}>Overdue</SectionTitle><Card>{overdue.map(row)}</Card></>}
            {dueToday.length > 0 && <><SectionTitle count={dueToday.length}>Due today</SectionTitle><Card>{dueToday.map(row)}</Card></>}
            {follow.length > 0 && <><SectionTitle count={follow.length}>Follow-ups due</SectionTitle><Card>{follow.map(row)}</Card></>}
            {(upcomingEvents.length > 0 || upcomingTasks.length > 0) && (
              <><SectionTitle>Coming up</SectionTitle><Card>
                {upcomingEvents.map((e) => <div key={e.id} className="px-4 py-3 border-b border-line last:border-b-0"><p className="text-[16px]">{e.title}</p><p className="text-[13px] text-ink2">{new Intl.DateTimeFormat('en-IN', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(e.starts_at))} · {formatTime(e.starts_at, tz)}</p></div>)}
                {upcomingTasks.map(row)}
              </Card></>
            )}
            {nothing && <Empty image="empty-tasks" title="A clear day" text="Nothing scheduled or due. Capture something, or enjoy the space." action={<Button onClick={onCapture}>Capture</Button>} />}
          </>
        )}
      </div>
      <button onClick={onCapture} aria-label="Quick capture" className="fixed right-4 z-40 w-14 h-14 rounded-full bg-accent text-white shadow-lg grid place-items-center active:scale-95 transition-transform" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}><Plus size={26} strokeWidth={2} /></button>
      <Sheet open={pick} onClose={() => setPick(false)} title="Top 3 for today">
        <p className="text-[13px] text-ink2 mb-3">{top.length}/{MAX_TOP} chosen</p>
        <Card>{sortTasks(roots.filter((t) => isOpen(t)), tz).slice(0, 40).map((t) => {
          const on = !!t.is_top_priority; const full = top.length >= MAX_TOP && !on;
          return <div key={t.id} className={`flex items-center gap-2 px-4 min-h-[52px] border-b border-line last:border-b-0 ${full ? 'opacity-40' : ''}`}>
            <Check_ done={on} label={`Toggle ${t.title} as top priority`} onChange={() => !full && void actions.update({ id: t.id, patch: { is_top_priority: !on } })} />
            <span className="flex-1 text-[16px] truncate">{t.title}</span>{on && <Star size={16} className="text-accent" fill="currentColor" />}</div>;
        })}{!roots.some(isOpen) && <p className="px-4 py-4 text-[14px] text-ink2">No open tasks yet.</p>}</Card>
        <Button block className="mt-4" onClick={() => setPick(false)}>Done</Button>
      </Sheet>
    </>
  );
}
