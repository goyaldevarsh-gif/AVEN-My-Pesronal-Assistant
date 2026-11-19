import { useMemo, useState } from 'react';
import { ChevronRight, FileText, Search, User } from 'lucide-react';
import { useApp } from '@/data/context';
import { useInbox, useNoteActions, useNotes, useTasks } from '@/data/hooks';
import type { Note, Task } from '@/data/types';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Empty, Field, Input, Row, SectionTitle, Select, Sheet, Textarea, Skeleton } from '@/ui/kit';
import { LargeHeader } from '@/ui/TabBar';
import { useToast } from '@/ui/toast';

const TZS = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'];

export function Vault({ headerRight, onOpenTask }: { headerRight: React.ReactNode; onOpenTask: (t: Task) => void }) {
  const notesQ = useNotes(); const { data: tasks = [] } = useTasks(); const { data: inbox = [] } = useInbox();
  const [q, setQ] = useState(''); const [view, setView] = useState<'notes' | 'profile' | null>(null); const [note, setNote] = useState<Note | 'new' | null>(null);
  const term = q.trim().toLowerCase();
  const hits = useMemo(() => !term ? null : {
    tasks: tasks.filter((t) => !t.deleted_at && (t.title + ' ' + (t.notes ?? '')).toLowerCase().includes(term)).slice(0, 8),
    notes: (notesQ.data ?? []).filter((n) => ((n.title ?? '') + ' ' + n.body).toLowerCase().includes(term)).slice(0, 8),
    inbox: inbox.filter((i) => (i.raw_text ?? '').toLowerCase().includes(term)).slice(0, 5),
  }, [term, tasks, notesQ.data, inbox]);
  return (
    <>
      <LargeHeader title="Vault" right={headerRight} />
      <div className="px-4 pb-8">
        <div className="relative mb-4"><Search size={18} strokeWidth={1.75} className="absolute left-3 top-3 text-ink2" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks, notes, inbox" aria-label="Search" className="pl-10" type="search" /></div>
        {hits ? (
          hits.tasks.length + hits.notes.length + hits.inbox.length === 0 ? <Empty image="empty-search" title="No results" text="Try a different search or add new information." /> : (
            <>
              {hits.tasks.length > 0 && <><SectionTitle count={hits.tasks.length}>Tasks</SectionTitle><Card>{hits.tasks.map((t) => <Row key={t.id} onClick={() => onOpenTask(t)}><span className="py-3 text-[16px] truncate">{t.title}</span></Row>)}</Card></>}
              {hits.notes.length > 0 && <><SectionTitle count={hits.notes.length}>Notes</SectionTitle><Card>{hits.notes.map((n) => <Row key={n.id} onClick={() => setNote(n)}><span className="py-3 text-[16px] truncate">{n.title || n.body.slice(0, 60)}</span></Row>)}</Card></>}
              {hits.inbox.length > 0 && <><SectionTitle count={hits.inbox.length}>Inbox</SectionTitle><Card>{hits.inbox.map((i) => <Row key={i.id}><span className="py-3 text-[16px] truncate">{i.raw_text}</span></Row>)}</Card></>}
            </>
          )
        ) : (
          <Card>
            <Row onClick={() => setView('profile')}><User size={22} strokeWidth={1.75} className="text-accent" /><div className="flex-1 py-3"><p className="text-[16px]">Personal profile</p><p className="text-[13px] text-ink2">Name, timezone, preferences</p></div><ChevronRight size={18} className="text-ink2" /></Row>
            <Row onClick={() => setView('notes')}><FileText size={22} strokeWidth={1.75} className="text-accent" /><div className="flex-1 py-3"><p className="text-[16px]">Notes and knowledge</p><p className="text-[13px] text-ink2">{notesQ.data?.length ?? 0} notes</p></div><ChevronRight size={18} className="text-ink2" /></Row>
          </Card>
        )}
      </div>
      <NotesSheet open={view === 'notes'} onClose={() => setView(null)} onEdit={setNote} />
      <NoteSheet value={note} onClose={() => setNote(null)} />
      <ProfileSheet open={view === 'profile'} onClose={() => setView(null)} />
    </>
  );
}

function NotesSheet({ open, onClose, onEdit }: { open: boolean; onClose: () => void; onEdit: (n: Note | 'new') => void }) {
  const q = useNotes();
  return (
    <Sheet open={open} onClose={onClose} title="Notes and knowledge" footer={<Button block onClick={() => onEdit('new')}>New note</Button>}>
      {q.isLoading && !q.data ? <Skeleton rows={3} /> : !q.data?.length ? <Empty image="empty-search" title="No notes yet" text="Save ideas, references and decisions. They stay searchable." /> :
        <Card>{q.data.map((n) => <Row key={n.id} onClick={() => onEdit(n)}><div className="py-3 min-w-0"><p className="text-[16px] truncate">{n.title || n.body.slice(0, 60)}</p><p className="text-[13px] text-ink2 truncate">{n.body.slice(0, 80)}</p></div></Row>)}</Card>}
    </Sheet>
  );
}

function NoteSheet({ value, onClose }: { value: Note | 'new' | null; onClose: () => void }) {
  const na = useNoteActions(); const toast = useToast(); const n = value && value !== 'new' ? value : null;
  const [f, setF] = useState({ title: '', body: '' }); const [key, setKey] = useState(''); const [err, setErr] = useState('');
  const k = n?.id ?? (value === 'new' ? 'new' : '');
  if (k !== key) { setKey(k); setF({ title: n?.title ?? '', body: n?.body ?? '' }); setErr(''); }
  async function save() { if (!f.body.trim() && !f.title.trim()) { setErr('Write something first.'); return; } const body = f.body.trim() || f.title.trim();
    try { n ? await na.update(n.id, { title: f.title.trim() || null, body }) : await na.create({ title: f.title.trim() || null, body }); onClose(); } catch (e) { setErr(e instanceof Error ? e.message : 'Could not save.'); } }
  return (
    <Sheet open={!!value} onClose={onClose} title={n ? 'Edit note' : 'New note'} footer={<div>{err && <p className="text-warn text-[13px] mb-2">{err}</p>}<Button block onClick={save}>Save</Button>{n && <Button variant="danger" block className="mt-2" onClick={async () => { await na.remove(n.id); onClose(); toast('Note archived'); }}>Archive note</Button>}</div>}>
      <Field label="Title (optional)"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="Note"><Textarea autoFocus value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className="min-h-[200px]" /></Field>
    </Sheet>
  );
}

function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { repo, profile } = useApp(); const qc = useQueryClient(); const toast = useToast();
  const [f, setF] = useState({ name: '', tz: 'Asia/Kolkata', week: 1 }); const [key, setKey] = useState(false);
  if (open !== key) { setKey(open); if (open && profile) setF({ name: profile.display_name ?? '', tz: profile.timezone, week: profile.week_starts_on }); }
  async function save() { await repo.updateProfile({ display_name: f.name.trim() || null, timezone: f.tz, week_starts_on: f.week }); await qc.invalidateQueries({ queryKey: ['profile'] }); toast('Profile saved'); onClose(); }
  return (
    <Sheet open={open} onClose={onClose} title="Personal profile" footer={<Button block onClick={save}>Save</Button>}>
      <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="What should AVEN call you?" /></Field>
      <Field label="Timezone" hint="Used for “today”, reminders and the daily schedule."><Select value={f.tz} onChange={(e) => setF({ ...f, tz: e.target.value })}>{[...new Set([f.tz, ...TZS])].map((z) => <option key={z}>{z}</option>)}</Select></Field>
      <Field label="Week starts on"><Select value={f.week} onChange={(e) => setF({ ...f, week: Number(e.target.value) })}><option value={1}>Monday</option><option value={0}>Sunday</option></Select></Field>
    </Sheet>
  );
}
