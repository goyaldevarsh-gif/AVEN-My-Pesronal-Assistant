import { useState } from 'react';
import { CheckSquare, FileText, X } from 'lucide-react';
import { useApp } from '@/data/context';
import { useInbox, useInboxActions, useNoteActions, useTaskActions } from '@/data/hooks';
import { Button, Card, Empty, ErrorState, Input, Skeleton } from '@/ui/kit';
import { LargeHeader } from '@/ui/TabBar';
import { useToast } from '@/ui/toast';

export function Inbox({ headerRight }: { headerRight: React.ReactNode }) {
  const { tz } = useApp(); const q = useInbox(); const ia = useInboxActions(); const ta = useTaskActions(); const na = useNoteActions(); const toast = useToast();
  const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  async function add(e: React.FormEvent) { e.preventDefault(); if (!text.trim()) return; setBusy(true); try { await ia.capture(text); setText(''); } catch (x) { toast(x instanceof Error ? x.message : 'Could not capture'); } finally { setBusy(false); } }
  const when = (iso: string) => new Intl.DateTimeFormat('en-IN', { timeZone: tz, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  return (
    <>
      <LargeHeader title="Inbox" subtitle="Everything you capture lands here first" right={headerRight} />
      <div className="px-4 pb-6">
        <form onSubmit={add} className="flex gap-2 mb-4"><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Capture a thought, task or idea" aria-label="Capture" /><Button type="submit" busy={busy} disabled={!text.trim()}>Add</Button></form>
        {q.isLoading && !q.data ? <Skeleton rows={3} /> : q.isError && !q.data ? <ErrorState message={(q.error as Error).message} onRetry={() => void q.refetch()} /> : !q.data?.length ? (
          <Empty image="empty-tasks" title="Inbox is clear" text="Captured items wait here until you file them. Nothing is ever discarded silently." />
        ) : (
          <>
            <p className="text-[13px] text-ink2 mb-3 px-1">Choose where each item goes. Automatic sorting arrives with the assistant.</p>
            <Card>{q.data.map((i) => (
              <div key={i.id} className="px-4 py-3 border-b border-line last:border-b-0">
                <p className="text-[16px] leading-[22px]">{i.raw_text}</p><p className="text-[12px] text-ink2 mt-0.5">{when(i.created_at)}</p>
                <div className="flex gap-2 mt-2.5">
                  <Button variant="secondary" className="h-9 text-[13px] px-3" onClick={async () => { const t = await ta.create({ title: i.raw_text!.slice(0, 300), source: 'inbox' }); await ia.resolve(i.id, 'confirmed', 'task', t.id); toast('Added to Plan as a task'); }}><CheckSquare size={16} strokeWidth={1.75} />Task</Button>
                  <Button variant="secondary" className="h-9 text-[13px] px-3" onClick={async () => { const n = await na.create({ body: i.raw_text!, kind: 'note' }); await ia.resolve(i.id, 'confirmed', 'note', n.id); toast('Saved to Notes'); }}><FileText size={16} strokeWidth={1.75} />Note</Button>
                  <Button variant="ghost" className="h-9 text-[13px] px-3 text-ink2" onClick={async () => { await ia.resolve(i.id, 'dismissed'); toast('Dismissed'); }}><X size={16} strokeWidth={1.75} />Dismiss</Button>
                </div>
              </div>))}</Card>
          </>
        )}
      </div>
    </>
  );
}
