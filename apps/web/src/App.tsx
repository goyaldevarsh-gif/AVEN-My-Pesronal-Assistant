import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { isConfigured, supabase } from '@/lib/supabase';
import { clearCache, persistCache, restoreCache } from '@/lib/offlineCache';
import { createSupabaseRepo } from '@/data/supabaseRepo';
import { createDemoRepo } from '@/data/demoRepo';
import { RepoProvider, useApp } from '@/data/context';
import { useInbox } from '@/data/hooks';
import type { Repo, Task } from '@/data/types';
import { TabBar, type Tab } from '@/ui/TabBar';
import { ToastProvider } from '@/ui/toast';
import { Auth, Setup } from '@/features/auth/Auth';
import { Today } from '@/features/today/Today';
import { CaptureSheet } from '@/features/today/CaptureSheet';
import { Plan } from '@/features/plan/Plan';
import { TaskSheet } from '@/features/plan/TaskSheet';
import { Inbox } from '@/features/inbox/Inbox';
import { Assistant } from '@/features/assistant/Assistant';
import { Vault } from '@/features/vault/Vault';
import { AvatarButton, Settings } from '@/features/settings/Settings';

const isDemo = () => { const u = new URLSearchParams(location.search).get('demo') === '1'; if (u) sessionStorage.setItem('aven-demo', '1'); return sessionStorage.getItem('aven-demo') === '1'; };
const makeClient = () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true } } });

export default function App() {
  const demo = useMemo(isDemo, []);
  if (demo) return <Boundary repo={createDemoRepo()} demo />;
  if (!isConfigured) return <Setup />;
  return <AuthGate />;
}

function AuthGate() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => { void supabase!.auth.getSession().then(({ data }) => setSession(data.session)); const { data } = supabase!.auth.onAuthStateChange((_e, s) => setSession(s)); return () => data.subscription.unsubscribe(); }, []);
  if (session === undefined) return <div className="min-h-dvh grid place-items-center text-ink2" aria-busy>Loading…</div>;
  if (!session) return <Auth />;
  return <Boundary key={session.user.id} repo={createSupabaseRepo(supabase!, session.user.id)} userId={session.user.id} email={session.user.email} />;
}

function Boundary({ repo, demo = false, userId, email }: { repo: Repo; demo?: boolean; userId?: string; email?: string }) {
  const qc = useMemo(makeClient, []);
  const [ready, setReady] = useState(demo || !userId);
  useEffect(() => { if (!userId) return; let off = () => {}; void restoreCache(qc, userId).finally(() => { setReady(true); off = persistCache(qc, userId); }); return () => off(); }, [qc, userId]);
  if (!ready) return null;
  const signOut = async () => { if (userId) await clearCache(userId); qc.clear(); await supabase!.auth.signOut(); };
  return (
    <QueryClientProvider client={qc}>
      <RepoProvider repo={repo} demo={demo}><ToastProvider><Shell email={email} onSignOut={demo ? undefined : signOut} /></ToastProvider></RepoProvider>
    </QueryClientProvider>
  );
}

function Shell({ email, onSignOut }: { email?: string; onSignOut?: () => void }) {
  const { demo } = useApp();
  const [tab, setTab] = useState<Tab>('today'); const [capture, setCapture] = useState(false); const [settings, setSettings] = useState(false);
  const [task, setTask] = useState<{ open: boolean; task: Task | null; defaults?: Partial<Task> }>({ open: false, task: null });
  const inbox = useInbox(); const online = useOnline();
  const avatar = <AvatarButton onClick={() => setSettings(true)} />;
  const openTask = (t: Task) => setTask({ open: true, task: t });
  const newTask = (d?: Partial<Task>) => setTask({ open: true, task: null, defaults: d });
  return (
    <div className="h-dvh flex flex-col bg-bg">
      {demo && <div className="pt-safe bg-warn text-white text-center text-[12px] font-medium py-1">Demo mode · sample data, nothing is saved</div>}
      {!online && <div className="pt-safe bg-ink text-bg text-center text-[12px] font-medium py-1">You’re offline. Showing saved data; changes need a connection.</div>}
      <main className="flex-1 overflow-y-auto">
        {tab === 'today' && <Today onOpenTask={openTask} onCapture={() => setCapture(true)} headerRight={avatar} />}
        {tab === 'plan' && <Plan onOpenTask={openTask} onNewTask={newTask} headerRight={avatar} />}
        {tab === 'inbox' && <Inbox headerRight={avatar} />}
        {tab === 'assistant' && <Assistant headerRight={avatar} onGoInbox={() => setTab('inbox')} />}
        {tab === 'vault' && <Vault headerRight={avatar} onOpenTask={openTask} />}
      </main>
      <TabBar tab={tab} onChange={setTab} inboxCount={inbox.data?.length ?? 0} />
      <CaptureSheet open={capture} onClose={() => setCapture(false)} />
      <TaskSheet open={task.open} task={task.task} defaults={task.defaults} onClose={() => setTask((s) => ({ ...s, open: false }))} />
      <Settings open={settings} onClose={() => setSettings(false)} email={email} onSignOut={onSignOut} />
    </div>
  );
}
function useOnline() { const [o, setO] = useState(navigator.onLine); useEffect(() => { const a = () => setO(true), b = () => setO(false); addEventListener('online', a); addEventListener('offline', b); return () => { removeEventListener('online', a); removeEventListener('offline', b); }; }, []); return o; }
