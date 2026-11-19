import { CalendarDays, House, Inbox, Layers, Sparkles } from 'lucide-react';
import { cx } from './kit';

export type Tab = 'today' | 'plan' | 'inbox' | 'assistant' | 'vault';
const TABS: { id: Tab; label: string; Icon: typeof House }[] = [
  { id: 'today', label: 'Today', Icon: House }, { id: 'plan', label: 'Plan', Icon: CalendarDays }, { id: 'inbox', label: 'Inbox', Icon: Inbox },
  { id: 'assistant', label: 'Assistant', Icon: Sparkles }, { id: 'vault', label: 'Vault', Icon: Layers },
];
export function TabBar({ tab, onChange, inboxCount }: { tab: Tab; onChange: (t: Tab) => void; inboxCount: number }) {
  return (
    <nav className="shrink-0 bg-surface/95 backdrop-blur border-t border-line pb-safe" aria-label="Primary">
      <ul className="grid grid-cols-5 h-[56px]">
        {TABS.map(({ id, label, Icon }) => (
          <li key={id}>
            <button onClick={() => onChange(id)} aria-current={tab === id ? 'page' : undefined} className={cx('relative w-full h-full flex flex-col items-center justify-center gap-0.5', tab === id ? 'text-accent' : 'text-ink2')}>
              <Icon size={22} strokeWidth={1.75} />
              <span className="text-[11px] font-medium">{label}</span>
              {id === 'inbox' && inboxCount > 0 && <span className="absolute top-1.5 left-1/2 ml-2 min-w-[16px] h-4 px-1 rounded-full bg-warn text-white text-[10px] font-semibold grid place-items-center">{inboxCount > 9 ? '9+' : inboxCount}</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function LargeHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <header className="pt-safe px-4 pb-3 bg-bg">
      <div className="flex items-start justify-between min-h-[52px] pt-3">
        <div className="min-w-0"><h1 className="font-display text-[28px] leading-[34px] font-bold tracking-tight truncate">{title}</h1>{subtitle && <p className="text-[14px] text-ink2 mt-0.5">{subtitle}</p>}</div>
        {right}
      </div>
    </header>
  );
}
