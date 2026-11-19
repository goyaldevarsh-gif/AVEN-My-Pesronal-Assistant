import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';

export const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(' ');

export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4FCDBF" /><stop offset="1" stopColor="#157F76" /></linearGradient></defs>
      <path d="M14 50C22 38 26 22 32 15C38 22 42 38 50 50" stroke="url(#lg)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; busy?: boolean; block?: boolean };
export function Button({ variant = 'primary', busy, block, className, children, disabled, ...r }: BtnProps) {
  const v = { primary: 'bg-navy text-white dark:bg-accent dark:text-[#06222a]', secondary: 'bg-surface2 text-ink border border-line', ghost: 'text-accent', danger: 'bg-warn/10 text-warn' }[variant];
  return <button {...r} disabled={disabled || busy} className={cx('h-11 px-4 rounded-ctl font-semibold text-[15px] active:opacity-80 transition-opacity disabled:opacity-50 inline-flex items-center justify-center gap-2', block && 'w-full', v, className)}>{busy ? 'Working…' : children}</button>;
}

export function Chip({ active, children, ...r }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return <button {...r} className={cx('h-8 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-colors', active ? 'bg-navy text-white border-navy dark:bg-accent dark:border-accent dark:text-[#06222a]' : 'bg-surface text-ink2 border-line')}>{children}</button>;
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex p-1 rounded-ctl bg-surface2" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} onClick={() => onChange(o.value)}
          className={cx('flex-1 h-8 rounded-[11px] text-[13px] font-semibold transition-colors', o.value === value ? 'bg-surface text-ink shadow-card' : 'text-ink2')}>{o.label}</button>
      ))}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('bg-surface border border-line rounded-ctl shadow-card', className)}>{children}</div>;
}
export function SectionTitle({ children, count, action }: { children: ReactNode; count?: number; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1 mb-2 mt-5">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">{children}{count != null && <span className="ml-1.5 text-ink2/70 font-medium">{count}</span>}</h2>
      {action}
    </div>
  );
}

export function Check_({ done, onChange, label }: { done: boolean; onChange: () => void; label: string }) {
  return (
    <button aria-label={label} aria-pressed={done} onClick={(e) => { e.stopPropagation(); onChange(); }} className="w-11 h-11 -ml-2 grid place-items-center shrink-0">
      <span className={cx('w-[22px] h-[22px] rounded-full border-2 grid place-items-center transition-colors', done ? 'bg-accent border-accent' : 'border-ink2/50')}>{done && <Check size={14} strokeWidth={3} className="text-white" />}</span>
    </button>
  );
}

export function Row({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  const Tag = onClick ? 'button' : 'div';
  return <Tag onClick={onClick} className={cx('w-full text-left flex items-center gap-3 px-4 min-h-[56px] border-b border-line last:border-b-0', onClick && 'active:bg-surface2', className)}>{children}</Tag>;
}

export function Empty({ image, title, text, action }: { image?: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-10">
      {image && <img src={`/illustrations/${image}.webp`} alt="" width={120} height={120} className="w-[120px] h-auto mb-3" loading="lazy" decoding="async" />}
      <p className="font-display text-[17px] font-semibold">{title}</p>
      <p className="text-[14px] text-ink2 mt-1 max-w-[260px]">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="m-4 p-4 rounded-ctl bg-warn/10 text-warn text-[14px]" role="alert">
      <p className="font-semibold">Something went wrong</p><p className="mt-1 opacity-90">{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-2 font-semibold underline">Try again</button>}
    </div>
  );
}
export function Skeleton({ rows = 4 }: { rows?: number }) {
  return <div className="p-4 space-y-3" aria-busy>{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-12 rounded-ctl bg-surface2 animate-pulse" />)}</div>;
}

export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { if (open) { const id = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(id); } setShown(false); }, [open]);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label={title}>
      <div className={cx('absolute inset-0 bg-black/40 transition-opacity duration-200', shown ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <div className={cx('absolute inset-x-0 bottom-0 max-h-[92dvh] flex flex-col bg-bg rounded-t-sheet transition-transform duration-200 ease-out', shown ? 'translate-y-0' : 'translate-y-full')}>
        <div className="flex items-center justify-between px-4 h-14 shrink-0">
          <h2 className="font-display text-[17px] font-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="w-10 h-10 -mr-2 grid place-items-center text-ink2"><X size={22} strokeWidth={1.75} /></button>
        </div>
        <div className="overflow-y-auto px-4 pb-4 flex-1">{children}</div>
        {footer && <div className="px-4 pt-3 pb-safe border-t border-line bg-bg"><div className="pb-3">{footer}</div></div>}
        {!footer && <div className="pb-safe" />}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block mb-4"><span className="block text-[13px] font-medium text-ink2 mb-1.5">{label}</span>{children}{hint && <span className="block text-[12px] text-ink2 mt-1">{hint}</span>}</label>;
}
const inputCls = 'w-full h-11 px-3 rounded-ctl bg-surface border border-line text-ink placeholder:text-ink2/60 focus:outline-none focus:border-accent';
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(inputCls, p.className)} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cx(inputCls, 'h-auto min-h-[96px] py-2.5 resize-none', p.className)} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx(inputCls, 'appearance-none', p.className)} />;

/** Toast with optional Undo. Single instance via provider-less hook in App. */
export interface ToastMsg { id: number; text: string; undo?: () => void }
export function Toasts({ items, dismiss }: { items: ToastMsg[]; dismiss: (id: number) => void }) {
  const t = useRef<Record<number, number>>({});
  useEffect(() => { items.forEach((i) => { if (!t.current[i.id]) t.current[i.id] = window.setTimeout(() => dismiss(i.id), 4500); }); }, [items, dismiss]);
  return (
    <div className="fixed inset-x-0 z-[60] px-4 pointer-events-none" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 76px)' }} aria-live="polite">
      {items.map((i) => (
        <div key={i.id} className="pointer-events-auto mx-auto max-w-md mb-2 flex items-center gap-3 px-4 h-12 rounded-ctl bg-navy text-white dark:bg-surface2 dark:text-ink shadow-lg">
          <span className="flex-1 text-[14px] truncate">{i.text}</span>
          {i.undo && <button className="text-[14px] font-semibold text-[#7FE0D4]" onClick={() => { i.undo!(); dismiss(i.id); }}>Undo</button>}
        </div>
      ))}
    </div>
  );
}
