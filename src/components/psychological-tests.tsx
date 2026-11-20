import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, ClipboardList, Heart, CloudSun } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { questionnaires, scoreQuestionnaire, type QuestionnaireId } from '@/lib/wellbeing';

const icons = { gad7: CloudSun, who5: Heart, phq2: ClipboardList };
export function PsychologicalTests() {
  const [selected, setSelected] = useState<QuestionnaireId | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  function focusHeading() { window.requestAnimationFrame(() => heading.current?.focus()); }
  function start(id: QuestionnaireId) { setSelected(id); setAnswers([]); setIndex(0); setFinished(false); focusHeading(); }
  function back() { setSelected(null); setFinished(false); }
  if (!selected) return <div className="grid gap-5 md:grid-cols-3">{(Object.keys(questionnaires) as QuestionnaireId[]).map(id => {
    const test = questionnaires[id]; const Icon = icons[id];
    return <article key={id} className="soft-card flex flex-col p-6 md:p-7"><div className="flex items-center justify-between gap-3"><span className="feature-icon"><Icon /></span><span className="text-xs text-muted-foreground">{test.questions.length} вопросов · {id === 'phq2' ? '1' : '2–3'} мин</span></div><h2 className="mt-6 text-xl font-semibold">{test.title}</h2><p className="mt-3 mb-7 text-sm leading-7 text-muted-foreground">{test.description}</p><Button variant="soft" className="mt-auto w-full" onClick={() => start(id)}>Пройти опросник<ArrowRight /></Button></article>;
  })}</div>;
  const test = questionnaires[selected];
  const result = finished ? scoreQuestionnaire(selected, answers) : null;
  return <div className="max-w-3xl">
    <Button variant="ghost" className="mb-6 px-0 hover:bg-transparent hover:text-accent" onClick={back}><ArrowLeft />Все опросники</Button>
    <h2 tabIndex={-1} ref={heading} className="text-2xl font-semibold outline-none">{test.title}</h2>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{test.description}</p>
    {result ? <section className="mt-8 border-y border-border py-8" aria-label="Результат опросника"><p className="eyebrow">Твой результат</p><p className="mt-4 text-4xl font-semibold">{result.score}<span className="ml-2 text-lg text-muted-foreground">из {result.max}</span></p><p className="mt-5 text-base leading-8" role="status">{result.message}</p><p className="mt-4 text-sm leading-7 text-muted-foreground">Это предварительный скрининг, а не диагноз. Результат зависит от твоих ответов и не заменяет беседу со специалистом.</p><div className="mt-7 flex flex-wrap gap-3"><Button variant="outline" onClick={() => start(selected)}><RotateCcw />Пройти заново</Button><Button asChild variant="soft"><Link to="/psychologists">Обсудить с психологом<ArrowRight /></Link></Button></div></section> : <>
      <div className="mt-8 flex justify-between text-xs text-muted-foreground"><span>Вопрос {index + 1} из {test.questions.length}</span><span>Последние 2 недели</span></div>
      <progress className="wellbeing-progress mt-3 w-full" max={test.questions.length} value={index + 1} aria-label="Прогресс опросника" />
      <fieldset className="mt-7"><legend className="mb-6 text-lg font-medium leading-8">{test.questions[index]}</legend><div className="grid gap-3">{test.answers.map((answer, value) => <label key={answer} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm leading-6 ${answers[index] === value ? 'border-accent bg-secondary' : 'border-border bg-background'}`}><input type="radio" name={`question-${selected}-${index}`} value={value} checked={answers[index] === value} onChange={() => setAnswers(previous => { const next = [...previous]; next[index] = value; return next; })} className="h-4 w-4 shrink-0 accent-accent" />{answer}</label>)}</div></fieldset>
      <div className="mt-7 flex justify-between gap-3"><Button variant="outline" disabled={index === 0} onClick={() => { setIndex(index - 1); focusHeading(); }}><ArrowLeft />Назад</Button><Button variant="hero" disabled={answers[index] === undefined} onClick={() => { if (index === test.questions.length - 1) setFinished(true); else setIndex(index + 1); focusHeading(); }}>{index === test.questions.length - 1 ? 'Результат' : 'Далее'}<ArrowRight /></Button></div>
    </>}
    <p className="mt-6 text-xs leading-6 text-muted-foreground">{test.source}. Русскоязычная адаптация для самонаблюдения; не клиническое заключение.</p>
  </div>;
}