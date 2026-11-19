import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PageIntro } from '@/components/site-shell';
import { pageHead } from '@/lib/site';
export const Route = createFileRoute('/reset-password')({ head: () => pageHead('Новый пароль', 'Восстановление доступа к личному дневнику TherapyAI.'), component: ResetPassword });
function ResetPassword() {
  const [password, setPassword] = useState(''); const [recovery, setRecovery] = useState(false); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { setRecovery(new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'); }, []);
  async function submit(e: React.FormEvent) { e.preventDefault(); if (!recovery) return; setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? 'Не удалось сменить пароль. Запроси новую ссылку.' : 'Пароль обновлён. Теперь можно открыть дневник.'); setBusy(false); }
  return <><PageIntro eyebrow="Твой аккаунт" title="Новый пароль">Восстановление доступа к дневнику.</PageIntro><section className="container-site pb-20">{recovery ? <form onSubmit={submit} className="max-w-md space-y-4"><label className="block">Новый пароль<input className="field mt-2" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></label><Button variant="hero" disabled={busy}>Сохранить пароль</Button></form> : <p>Открой эту страницу по ссылке восстановления из письма.</p>}{message && <p role="status" className="mt-5">{message}</p>}</section></>;
}