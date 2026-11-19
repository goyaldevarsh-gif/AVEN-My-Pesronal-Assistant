import { useEffect, useState } from 'react';
export type ThemePref = 'system' | 'light' | 'dark';
const KEY = 'aven-theme';
const apply = (pref: ThemePref) => {
  const dark = pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0B1722' : '#102A43');
};
export function initTheme() { apply((localStorage.getItem(KEY) as ThemePref) || 'system'); matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => apply((localStorage.getItem(KEY) as ThemePref) || 'system')); }
export function useTheme(): [ThemePref, (p: ThemePref) => void] {
  const [pref, setPref] = useState<ThemePref>(() => (localStorage.getItem(KEY) as ThemePref) || 'system');
  useEffect(() => { localStorage.setItem(KEY, pref); apply(pref); }, [pref]);
  return [pref, setPref];
}
