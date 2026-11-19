import { Download, LogOut, User } from 'lucide-react';
import { useApp } from '@/data/context';
import { Button, Card, Segmented, Sheet } from '@/ui/kit';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/ui/toast';

export function AvatarButton({ onClick }: { onClick: () => void }) {
  const { profile } = useApp();
  return <button onClick={onClick} aria-label="Settings" className="w-10 h-10 rounded-full bg-accentSoft text-accent grid place-items-center font-semibold text-[15px]">{profile?.display_name?.[0]?.toUpperCase() ?? <User size={18} />}</button>;
}

export function Settings({ open, onClose, email, onSignOut }: { open: boolean; onClose: () => void; email?: string; onSignOut?: () => void }) {
  const { repo, demo } = useApp(); const [theme, setTheme] = useTheme(); const toast = useToast();
  async function exportData() {
    try {
      const data = await repo.exportAll(); const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `aven-export-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
    } catch (e) { toast(e instanceof Error ? e.message : 'Export failed'); }
  }
  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      {demo && <p className="mb-4 p-3 rounded-ctl bg-warn/10 text-warn text-[13px]">Demo mode: sample data, nothing is saved.</p>}
      <p className="text-[13px] font-medium text-ink2 mb-1.5">Appearance</p>
      <Segmented value={theme} onChange={setTheme} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      <p className="text-[13px] font-medium text-ink2 mt-6 mb-1.5">Your data</p>
      <Card><button onClick={exportData} className="w-full flex items-center gap-3 px-4 h-14 text-left"><Download size={20} strokeWidth={1.75} className="text-accent" /><span className="flex-1 text-[16px]">Export everything (JSON)</span></button></Card>
      {email && <p className="text-[13px] text-ink2 mt-6 mb-2">Signed in as {email}</p>}
      {onSignOut && <Button variant="secondary" block onClick={onSignOut}><LogOut size={18} strokeWidth={1.75} />Sign out</Button>}
      <p className="text-[12px] text-ink2 mt-6">AVEN 0.1 · Phase 2 foundation</p>
    </Sheet>
  );
}
