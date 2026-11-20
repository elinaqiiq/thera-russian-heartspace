import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { PageIntro } from '@/components/site-shell';
import { BreathingPractice } from '@/components/breathing-practice';
import { pageHead } from '@/lib/site';
export const Route = createFileRoute('/practices')({
  head: () => pageHead('Дыхательные практики', 'Мягкое и ровное дыхание с таймером TherapyAI. Несколько минут заботы о себе без задержек дыхания.'),
  component: Practices,
});
function Practices() {
  return <><PageIntro eyebrow="Небольшая пауза для себя" title="Дыхательные практики">Можно замедлиться. На несколько минут оставь дела и обрати внимание на своё дыхание.</PageIntro><section className="container-site pb-16"><BreathingPractice /></section><section className="border-t border-border py-9"><div className="container-site flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Как ты себя чувствуешь сегодня?</p><Link to="/tests" className="flex items-center gap-2 text-sm text-accent">Психологические опросники<ArrowRight size={16} /></Link></div></section></>;
}