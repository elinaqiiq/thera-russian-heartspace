import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Heart, Sparkles, ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/site";
import mascot from "@/assets/thera-cat.asset.json";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Что тебя сейчас беспокоит?",
      "Можно начать с того, о чём проще говорить. Бесплатный чат с Thera и отдельные консультации психологов.",
    ),
  component: Index,
});
function Index() {
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={mascot.url}
          alt="Чёрный кот Thera с большими добрыми глазами и сине-фиолетовым сиянием"
        />
        <div className="container-site hero-inner">
          <span className="hero-label">
            <Heart size={13} /> Бережное пространство
          </span>
          <h1 className="hero-title mt-7">
            Что тебя сейчас
            <br className="hidden md:block" /> беспокоит?
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            Можно начать с того, о чём проще говорить
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/thera">
                <MessageCircle /> Поговорить с Thera <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="soft" size="xl">
              <Link to="/psychologists">
                Записаться к психологу <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Check size={13} className="text-accent" /> Чат бесплатно{" "}
            <span className="mx-2">·</span> Без обязательств
          </div>
          <div className="mt-12 flex max-w-xl flex-wrap gap-2">
            {["Тревога", "Отношения", "Усталость", "Одиночество", "Не знаю, с чего начать"].map(
              (topic) => (
                <Link className="topic-chip" to="/thera" key={topic}>
                  {topic}
                </Link>
              ),
            )}
          </div>
        </div>
      </section>
      <section className="container-site pb-16 pt-7">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Поддержка бывает разной</p>
            <h2 className="section-title mt-3">Выбери то, что нужно сейчас</h2>
          </div>
          <Link
            to="/how-it-works"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
          >
            Как это работает <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <article className="soft-card p-7 md:p-8">
            <div className="flex items-center justify-between">
              <span className="feature-icon">
                <MessageCircle size={22} />
              </span>
              <span className="text-xs text-accent">Бесплатно</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold">Разговор с Thera</h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              Когда хочется выговориться, разобраться в чувствах или просто не оставаться с ними
              наедине.
            </p>
            <Button asChild variant="link" className="mt-5 h-auto px-0 text-accent">
              <Link to="/thera">
                Начать разговор <ArrowRight />
              </Link>
            </Button>
          </article>
          <article className="soft-card p-7 md:p-8">
            <div className="flex items-center justify-between">
              <span className="feature-icon">
                <Heart size={22} />
              </span>
              <span className="text-xs text-muted-foreground">Оплачивается отдельно</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold">Помощь психолога</h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              Профессиональная поддержка и личная консультация. Запись откроется после подключения
              специалистов.
            </p>
            <Button asChild variant="link" className="mt-5 h-auto px-0 text-accent">
              <Link to="/psychologists">
                О консультациях <ArrowRight />
              </Link>
            </Button>
          </article>
        </div>
      </section>
      <section className="border-t border-border/50 py-12">
        <div className="container-site flex flex-col gap-5 md:flex-row md:items-center md:gap-12">
          <Sparkles className="shrink-0 text-accent" size={27} />
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Не обязательно сразу находить правильные слова. Thera — ИИ-собеседник для эмоциональной
            поддержки, а не замена психолога или экстренной помощи.
          </p>
          <Link to="/support" className="shrink-0 text-sm text-accent">
            О безопасности ↗
          </Link>
        </div>
      </section>
    </>
  );
}
