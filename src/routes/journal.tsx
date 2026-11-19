import { Suspense } from 'react';
import { createFileRoute, ClientOnly } from '@tanstack/react-router';
import { PageIntro } from '@/components/site-shell';
import { pageHead } from '@/lib/site';
import { useAuthState } from '@/components/auth-state';
import { AuthPanel } from '@/components/auth-panel';
import { JournalEditor } from '@/components/journal-editor';
export const Route = createFileRoute('/journal')({ head: () => pageHead('Дневник эмоций', 'Личный дневник TherapyAI: настроение, эмоции, текстовые и голосовые заметки.'), component: Journal });
function Journal() {
  const { user, ready } = useAuthState();
  return <><PageIntro eyebrow="Место для твоих чувств" title="Дневник эмоций">Любые чувства имеют значение. Сегодня можно просто заметить их.</PageIntro><section className="container-site pb-20"><ClientOnly fallback={<p>Загружаем дневник…</p>}>{ready ? user ? <Suspense fallback={<p>Загружаем записи…</p>}><JournalEditor key={user.id} /></Suspense> : <AuthPanel /> : <p>Загружаем дневник…</p>}</ClientOnly></section></>;
}