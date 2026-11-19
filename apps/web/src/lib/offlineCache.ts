import { get, set, del } from 'idb-keyval';
import type { QueryClient } from '@tanstack/react-query';

/** Offline READ cache: last successful lists are mirrored to IndexedDB and restored on launch. Writes need a connection (outbox comes later). */
const KEYS = ['tasks', 'projects', 'inbox', 'notes', 'profile'] as const;
export async function restoreCache(qc: QueryClient, userId: string) {
  try { const saved = (await get(`aven-cache-${userId}`)) as Record<string, unknown> | undefined; if (saved) for (const k of KEYS) if (saved[k]) qc.setQueryData([k], saved[k]); } catch { /* cache is best-effort */ }
}
export function persistCache(qc: QueryClient, userId: string) {
  let timer: number | undefined;
  return qc.getQueryCache().subscribe(() => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      const snap: Record<string, unknown> = {};
      for (const k of KEYS) { const d = qc.getQueryData([k]); if (d) snap[k] = d; }
      void set(`aven-cache-${userId}`, snap).catch(() => {});
    }, 800);
  });
}
export const clearCache = (userId: string) => del(`aven-cache-${userId}`);
