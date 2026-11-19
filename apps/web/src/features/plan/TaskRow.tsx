import { Repeat, Hourglass, BellOff } from 'lucide-react';
import type { Project, Task } from '@/data/types';
import { Check_, Row, cx } from '@/ui/kit';
import { dueKey, isOverdue, isSnoozed } from '@/domain/tasks';
import { formatDayShort, formatTime, todayKey } from '@/domain/dates';

export function TaskRow({ task, tz, now, project, onToggle, onOpen, showProject = true }: { task: Task; tz: string; now: Date; project?: Project; onToggle: (t: Task) => void; onOpen: (t: Task) => void; showProject?: boolean }) {
  const done = task.status === 'done';
  const overdue = isOverdue(task, tz, now);
  const dk = dueKey(task, tz);
  const due = dk ? `${formatDayShort(dk, todayKey(tz, now))}${task.due_at && !task.due_date ? ` · ${formatTime(task.due_at, tz)}` : ''}` : null;
  return (
    <Row>
      <Check_ done={done} label={done ? `Mark ${task.title} as not done` : `Complete ${task.title}`} onChange={() => onToggle(task)} />
      <button onClick={() => onOpen(task)} className="min-w-0 flex-1 py-2.5 text-left self-stretch">
        <p className={cx('text-[16px] leading-[22px] truncate', done && 'line-through text-ink2')}>{task.title}</p>
        <p className="text-[13px] text-ink2 flex items-center gap-1.5 truncate">
          {task.priority === 1 && !done && <span className="text-warn font-semibold">High</span>}
          {due && <span className={cx(overdue && 'text-warn font-medium')}>{overdue ? 'Overdue · ' : ''}{due}</span>}
          {showProject && project && <span className="truncate">· {project.title}</span>}
          {task.status === 'waiting' && <span className="inline-flex items-center gap-0.5"><Hourglass size={12} />{task.waiting_on_text ?? 'Waiting'}</span>}
          {task.recurrence_rule && <Repeat size={12} aria-label="Repeats" />}
          {isSnoozed(task, now) && <span className="inline-flex items-center gap-0.5"><BellOff size={12} />Snoozed</span>}
        </p>
      </button>
    </Row>
  );
}
