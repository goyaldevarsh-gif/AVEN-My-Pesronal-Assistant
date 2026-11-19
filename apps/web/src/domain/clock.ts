import { useEffect, useState } from 'react';
export { dayKey } from './dates';
/** Re-renders every minute so "overdue" and "today" stay correct while the app stays open. */
export function nowTick(): Date { return new Date(); }
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), intervalMs); const vis = () => document.visibilityState === 'visible' && setNow(new Date()); document.addEventListener('visibilitychange', vis); return () => { clearInterval(id); document.removeEventListener('visibilitychange', vis); }; }, [intervalMs]);
  return now;
}
