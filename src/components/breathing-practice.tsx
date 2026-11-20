import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Check, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { breathingPatterns, breathingStep, type BreathingId } from '@/lib/wellbeing';

export function BreathingPractice() {
  const [pattern, setPattern] = useState<BreathingId>('gentle');
  const [minutes, setMinutes] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const anchor = useRef(0);
  const total = minutes * 60;
  const done = elapsed >= total;
  const step = breathingStep(pattern, elapsed);
  useEffect(() => {
    if (!running) return;
    anchor.current = performance.now() - elapsed * 1000;
    const timer = window.setInterval(() => {
      const next = Math.min(total, Math.floor((performance.now() - anchor.current) / 1000));
      setElapsed(next);
      if (next >= total) setRunning(false);
    }, 100);
    return () => window.clearInterval(timer);
    // elapsed is the starting offset; interval owns subsequent ticks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, total]);
  function reset() { setRunning(false); setElapsed(0); }
  const remaining = total - elapsed;
  return <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr]">
    <div className="space-y-8">
      <fieldset><legend className="mb-4 font-semibold">Ритм дыхания</legend><div className="grid gap-3">
        {(Object.keys(breathingPatterns) as BreathingId[]).map(id => <Button key={id} variant={pattern === id ? 'soft' : 'outline'} className="h-auto justify-between gap-4 rounded-xl px-5 py-4 text-left whitespace-normal" aria-pressed={pattern === id} disabled={running} onClick={() => { reset(); setPattern(id); }}><span><span className="block font-semibold">{breathingPatterns[id].label}</span><span className="mt-1 block text-xs text-muted-foreground">Вдох 4 с · Выдох {id === 'gentle' ? '6' : '4'} с</span></span>{pattern === id && <Check />}</Button>)}
      </div></fieldset>
      <fieldset><legend className="mb-4 font-semibold">Время для себя</legend><div className="flex gap-3">{[1, 3, 5].map(value => <Button key={value} variant={minutes === value ? 'soft' : 'outline'} aria-pressed={minutes === value} disabled={running} onClick={() => { reset(); setMinutes(value); }}>{value} мин</Button>)}</div></fieldset>
      <p className="text-sm leading-7 text-muted-foreground">Сядь удобно и дыши мягко, без усилия и задержек. Не нужно вдыхать максимально глубоко. Можно держать глаза открытыми.</p>
      <p className="border-l-2 border-accent pl-4 text-sm leading-7 text-muted-foreground">Если появятся головокружение, нехватка воздуха или дискомфорт — остановись и вернись к обычному дыханию. При заболеваниях сердца или лёгких обсуди практику с врачом.</p>
    </div>
    <div className="flex flex-col items-center border-y border-border py-8 md:py-10">
      <div className="relative grid aspect-square w-64 max-w-full place-items-center md:w-72" data-testid="breathing-guide">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true"><circle cx="100" cy="100" r="92" className="fill-none stroke-border" strokeWidth="2" /><circle cx="100" cy="100" r="92" className="fill-none stroke-accent" strokeWidth="4" strokeLinecap="round" strokeDasharray="578" strokeDashoffset={578 * (1 - elapsed / total)} /></svg>
        <div className={`breath-disc ${running ? (step.label === 'Вдох' ? 'breath-in' : 'breath-out') : ''}`} aria-hidden="true"><Wind size={28} /></div>
        <div className="relative z-10 text-center"><p className="text-xl font-semibold" role="status">{done ? 'Практика завершена' : elapsed === 0 && !running ? 'В твоём темпе' : running ? step.label : 'Пауза'}</p><p className="mt-2 text-sm text-muted-foreground">{done ? 'Заметь, как ты себя чувствуешь' : running ? `${step.remaining} с` : 'Без спешки'}</p></div>
      </div>
      <p className="mt-6 font-mono text-lg tabular-nums" aria-label="Осталось времени">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p>
      <div className="mt-5 flex gap-3"><Button variant="hero" className="min-w-40" onClick={() => { if (done) setElapsed(0); setRunning(!running); }}>{running ? <Pause /> : <Play />}{running ? 'Пауза' : done ? 'Ещё раз' : elapsed > 0 ? 'Продолжить' : 'Начать'}</Button><Button variant="outline" size="icon" title="Сбросить практику" aria-label="Сбросить практику" onClick={reset}><RotateCcw /></Button></div>
    </div>
  </div>;
}