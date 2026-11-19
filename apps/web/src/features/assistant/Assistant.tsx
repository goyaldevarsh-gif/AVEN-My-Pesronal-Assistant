import { Logo } from '@/ui/kit';
import { LargeHeader } from '@/ui/TabBar';

/** Honest state: the assistant is Phase 3. Nothing here pretends to work. */
export function Assistant({ headerRight, onGoInbox }: { headerRight: React.ReactNode; onGoInbox: () => void }) {
  return (
    <>
      <LargeHeader title="Assistant" right={headerRight} />
      <div className="px-8 pt-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-navy grid place-items-center"><Logo size={44} /></div>
        <p className="font-display text-[20px] font-semibold mt-5">Coming in the next phase</p>
        <p className="text-[14px] text-ink2 mt-2 max-w-[280px]">The assistant, voice and automatic sorting are not built yet. Until then, anything you capture waits safely in your Inbox.</p>
        <button onClick={onGoInbox} className="mt-5 text-accent font-semibold text-[15px]">Go to Inbox</button>
      </div>
    </>
  );
}
