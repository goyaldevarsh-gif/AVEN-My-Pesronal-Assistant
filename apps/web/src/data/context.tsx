import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Profile, Repo } from './types';
import { DEFAULT_TZ } from '@/domain/dates';

interface Ctx { repo: Repo; demo: boolean; tz: string; profile: Profile | undefined }
const C = createContext<Ctx | null>(null);

export function RepoProvider({ repo, demo, children }: { repo: Repo; demo: boolean; children: ReactNode }) {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => repo.getProfile() });
  const value = useMemo(() => ({ repo, demo, tz: profile?.timezone ?? DEFAULT_TZ, profile }), [repo, demo, profile]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export function useApp() { const v = useContext(C); if (!v) throw new Error('RepoProvider missing'); return v; }
