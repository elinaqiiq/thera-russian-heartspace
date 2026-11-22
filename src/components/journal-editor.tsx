import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getJournal, saveEntry, deleteEntry } from '@/lib/journal.functions';
import { emotions, moods, entrySchema } from '@/lib/wellbeing';
import { VoiceNote, type VoiceData } from './voice-note';
import { useAuthState } from './auth-state';

export function journalOptions(userId: string) { return queryOptions({ queryKey: ['journal', userId], queryFn: () => getJournal() }); }
export function JournalEditor() {
  const { user } = useAuthState();
  if (!user) return null;
  return <Editor userId={user.id} />;
}
function Editor({ userId }: { userId: string }) {
  const { data } = useSuspenseQuery(journalOptions(userId));
  const queryClient = useQueryClient();
  const save = useServerFn(saveEntry); const remove = useServerFn(deleteEntry);
  const [mood, setMood] = useState(3); const [emotion, setEmotion] = useState('Спокойствие');
  const [note, setNote] = useState(''); const [voice, setVoice] = useState<VoiceData | null>(null);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [confirmId, setConfirmId] = useState<string | null>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['journal', userId] });
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const input = entrySchema.parse({ mood, emotion, note, audio_base64: voice?.base64 ?? null, audio_type: voice?.type ?? null });
      await save({ data: input }); await refresh(); setNote(''); setVoice(null); setMessage('Запись сохранена');
    } catch { setMessage('Не удалось сохранить запись. Попробуй позже.'); } finally { setBusy(false); }
  }
  async function deleteOne(id: string) {
    setBusy(true);
    try { await remove({ data: { id } }); await refresh(); setConfirmId(null); setMessage('Запись удалена'); } catch { setMessage('Не удалось удалить запись'); } finally { setBusy(false); }
  }
  return <>
    <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={submit} className="space-y-6">
        <div><p className="eyebrow">Новая запись</p><h2 className="mt-3 text-2xl font-semibold">Как ты сейчас?</h2></div>
        <fieldset><legend className="mb-3 text-sm">Настроение</legend><div className="grid grid-cols-5 gap-2">{moods.map((label, i) => <Button className="h-12" type="button" key={label} title={label} aria-label={label} aria-pressed={mood === i + 1} variant={mood === i + 1 ? 'hero' : 'outline'} onClick={() => setMood(i + 1)}>{i + 1}</Button>)}</div><p className="mt-2 text-sm text-accent">{moods[mood - 1]}</p></fieldset>
        <fieldset><legend className="mb-3 text-sm">Главная эмоция</legend><div className="flex flex-wrap gap-2">{emotions.map(item => <Button key={item} type="button" size="sm" variant={emotion === item ? 'soft' : 'outline'} aria-pressed={emotion === item} onClick={() => setEmotion(item)}>{item}</Button>)}</div></fieldset>
        <label className="block text-sm">Что произошло и что тебе сейчас нужно?<textarea className="field mt-2 min-h-40" value={note} maxLength={3000} rows={5} onChange={e => setNote(e.target.value)} /></label>
        <VoiceNote value={voice} onChange={setVoice} />
        <Button disabled={busy} variant="hero"><Save />{busy ? 'Сохраняем…' : 'Сохранить запись'}</Button>
        <p className="text-xs leading-6 text-muted-foreground">Личные записи и аудио хранятся в твоём аккаунте. ИИ и психолог не получают их автоматически.</p>
      </form>
      <section><p className="eyebrow">История</p><h2 className="mt-3 mb-6 text-2xl font-semibold">Твои записи</h2>{data.entries.length === 0 ? <p className="border-y border-border py-10 text-sm text-muted-foreground">Здесь появится твоя первая запись.</p> : <div className="space-y-4">{data.entries.map(entry => <article key={entry.id} className="soft-card p-5"><div className="flex items-start justify-between gap-3"><div><time className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString('ru-RU')}</time><h3 className="mt-2 font-semibold">{entry.emotion} · {moods[entry.mood - 1]}</h3></div><Button variant="ghost" size="icon" aria-label="Удалить запись" disabled={busy} onClick={() => setConfirmId(entry.id)}><Trash2 /></Button></div>{entry.note && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">{entry.note}</p>}{entry.audio_base64 && <audio className="mt-4 w-full" controls src={`data:${entry.audio_type};base64,${entry.audio_base64}`} />}{confirmId === entry.id && <div className="mt-4 flex flex-wrap items-center gap-2"><span className="text-sm">Удалить навсегда?</span><Button variant="destructive" size="sm" disabled={busy} onClick={() => deleteOne(entry.id)}>Удалить</Button><Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>Отмена</Button></div>}</article>)}</div>}<p className="mt-4 text-xs text-muted-foreground">Показаны последние 50 записей.</p></section>
    </div>
    {message && <p role="status" className="mt-6 text-sm text-accent">{message}</p>}
  </>;
}