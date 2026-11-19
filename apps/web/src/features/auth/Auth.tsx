import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button, Input, Logo } from '@/ui/kit';

/** Email one-time code (not a magic link): links open in Safari, not in the installed Home Screen app. */
export function Auth() {
  const [email, setEmail] = useState(''); const [code, setCode] = useState(''); const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function send(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const { error } = await supabase!.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false); if (error) setErr(error.message); else setStep('code');
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const { error } = await supabase!.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false); if (error) setErr(error.message);
  }
  return (
    <main className="min-h-dvh flex flex-col px-6 pt-safe pb-safe">
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        <Logo size={56} /><h1 className="font-display text-[34px] font-bold tracking-tight mt-4">AVEN</h1>
        <p className="text-ink2 mt-1 mb-8">Life, thoughtfully organised.</p>
        {step === 'email' ? (
          <form onSubmit={send}>
            <label className="block text-[13px] font-medium text-ink2 mb-1.5" htmlFor="email">Email</label>
            <Input id="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            {err && <p role="alert" className="text-warn text-[13px] mt-2">{err}</p>}
            <Button block busy={busy} className="mt-4" type="submit">Send sign-in code</Button>
          </form>
        ) : (
          <form onSubmit={verify}>
            <p className="text-[14px] text-ink2 mb-3">We sent a code to <b className="text-ink">{email}</b>.</p>
            <label className="block text-[13px] font-medium text-ink2 mb-1.5" htmlFor="code">Code</label>
            <Input id="code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" maxLength={10} className="tracking-[0.3em] text-center text-[20px]" />
            {err && <p role="alert" className="text-warn text-[13px] mt-2">{err}</p>}
            <Button block busy={busy} className="mt-4" type="submit">Verify and continue</Button>
            <button type="button" className="mt-3 w-full text-[14px] text-accent" onClick={() => { setStep('email'); setCode(''); setErr(''); }}>Use a different email</button>
          </form>
        )}
      </div>
    </main>
  );
}

export function Setup() {
  return (
    <main className="min-h-dvh px-6 pt-safe pb-safe flex flex-col justify-center max-w-md mx-auto">
      <Logo size={48} /><h1 className="font-display text-[28px] font-bold mt-3">Connect your backend</h1>
      <p className="text-ink2 mt-2 text-[15px]">AVEN needs a Supabase project. Add <code className="text-ink">VITE_SUPABASE_URL</code> and <code className="text-ink">VITE_SUPABASE_ANON_KEY</code> (see <code className="text-ink">.env.example</code>), run <code className="text-ink">supabase/migrations/0001_init.sql</code>, and set the email template to include <code className="text-ink">{'{{ .Token }}'}</code>.</p>
      <a href="/?demo=1" className="mt-6 h-11 rounded-ctl bg-navy text-white grid place-items-center font-semibold dark:bg-accent dark:text-[#06222a]">Preview with demo data</a>
      <p className="text-[12px] text-ink2 mt-2">Demo data lives in memory only and is never saved.</p>
    </main>
  );
}
