/** Timezone-safe date helpers. All "what day is it" logic runs in the user's profile timezone. */
export const DEFAULT_TZ = 'Asia/Kolkata';

export function dayKey(d: Date | string, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d));
}
export const todayKey = (tz: string, now = new Date()) => dayKey(now, tz);

export function addDaysKey(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export function addMonthsKey(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last)); // clamp 31 Jan + 1 month -> 28/29 Feb
  return target.toISOString().slice(0, 10);
}

function tzOffsetMinutes(at: Date, tz: string): number {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(at).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - at.getTime()) / 60000);
}
/** "2026-11-20" + "10:30" in tz -> UTC Date */
export function zonedToUtc(key: string, hhmm: string, tz: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  let utc = guess - tzOffsetMinutes(new Date(guess), tz) * 60000;
  utc = guess - tzOffsetMinutes(new Date(utc), tz) * 60000;
  return new Date(utc);
}
export function dayRangeUtc(key: string, tz: string): { from: Date; to: Date } {
  return { from: zonedToUtc(key, '00:00', tz), to: zonedToUtc(addDaysKey(key, 1), '00:00', tz) };
}
export function hhmmInTz(d: Date | string, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(d));
}
export const formatTime = (d: Date | string, tz: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(d)).replace(/\s?([ap])m/i, (_, x) => ` ${x.toUpperCase()}M`);
export function formatDayLong(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(Date.UTC(y, m - 1, d)));
}
export function formatDayShort(key: string, today: string): string {
  if (key === today) return 'Today';
  if (key === addDaysKey(today, 1)) return 'Tomorrow';
  if (key === addDaysKey(today, -1)) return 'Yesterday';
  const [y, m, d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(Date.UTC(y, m - 1, d)));
}
export function greeting(now: Date, tz: string): string {
  const h = +hhmmInTz(now, tz).slice(0, 2);
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
}
