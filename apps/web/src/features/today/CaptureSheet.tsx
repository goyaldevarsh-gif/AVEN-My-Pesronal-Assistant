import { useState } from 'react';
import { useInboxActions } from '@/data/hooks';
import { Button, Sheet, Textarea } from '@/ui/kit';
import { useToast } from '@/ui/toast';

export function CaptureSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ia = useInboxActions(); const toast = useToast(); const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  async function save() { if (!text.trim()) return; setBusy(true); try { await ia.capture(text); setText(''); onClose(); toast('Captured to Inbox'); } catch (e) { toast(e instanceof Error ? e.message : 'Could not capture'); } finally { setBusy(false); } }
  return (
    <Sheet open={open} onClose={onClose} title="Quick capture" footer={<Button block busy={busy} disabled={!text.trim()} onClick={save}>Save to Inbox</Button>}>
      <Textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Task, idea, reminder, link…" aria-label="Capture" />
      <p className="text-[12px] text-ink2 mt-2">You can file it as a task or note from the Inbox.</p>
    </Sheet>
  );
}
