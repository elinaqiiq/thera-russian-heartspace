import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type VoiceData = { base64: string; type: 'audio/webm' | 'audio/mp4' | 'audio/ogg' };
export function VoiceNote({ value, onChange }: { value: VoiceData | null; onChange: (v: VoiceData | null) => void }) {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(0);
  useEffect(() => () => { if (recorder.current?.state === 'recording') { recorder.current.onstop = null; recorder.current.stop(); } stream.current?.getTracks().forEach(t => t.stop()); }, []);
  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    const stop = setTimeout(() => recorder.current?.stop(), 60000);
    return () => { clearInterval(timer); clearTimeout(stop); };
  }, [recording]);
  async function start() {
    setError(''); setSeconds(0);
    try {
      if (!navigator.mediaDevices || typeof MediaRecorder === 'undefined') throw new Error('Запись недоступна в этом браузере.');
      const type = (['audio/webm', 'audio/mp4', 'audio/ogg'] as const).find(t => MediaRecorder.isTypeSupported(t));
      if (!type) throw new Error('Этот браузер не поддерживает запись аудио.');
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream.current, { mimeType: type }); recorder.current = rec;
      const chunks: Blob[] = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stream.current?.getTracks().forEach(t => t.stop()); setRecording(false);
        const blob = new Blob(chunks, { type });
        if (!blob.size || blob.size > 2000000) { setError('Запись пустая или слишком большая. Попробуй записать короче.'); return; }
        const reader = new FileReader();
        reader.onload = () => { if (typeof reader.result === 'string') onChange({ base64: reader.result.split(',')[1] ?? '', type }); };
        reader.readAsDataURL(blob);
      };
      rec.start(); setRecording(true);
    } catch (e) { stream.current?.getTracks().forEach(t => t.stop()); setError(e instanceof Error && e.name === 'NotAllowedError' ? 'Разреши доступ к микрофону, чтобы записать голос.' : 'Не удалось включить микрофон.'); }
  }
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="outline" onClick={recording ? () => recorder.current?.stop() : start}>{recording ? <Square /> : <Mic />}{recording ? `Остановить · ${seconds} с` : 'Голосовая заметка'}</Button><span className="text-xs text-muted-foreground">До 1 минуты · только для тебя</span></div>
    {value && <div className="flex items-center gap-2"><audio controls className="min-w-0 w-full max-w-sm" src={`data:${value.type};base64,${value.base64}`} /><Button type="button" variant="ghost" size="icon" aria-label="Удалить голосовую заметку" onClick={() => onChange(null)}><Trash2 /></Button></div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}