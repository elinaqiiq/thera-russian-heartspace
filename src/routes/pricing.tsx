import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight, MessageCircle, Heart } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { bookingSubmissionsEnabled, pageHead } from "@/lib/site";
export const Route = createFileRoute("/pricing")({
  head: () =>
    pageHead(
      "Тарифы",
      "Чат с Thera — бесплатно. Консультация с психологом — оплачивается отдельно.",
    ),
  component: Pricing,
});
function Pricing() {
  return (
    <>
      <PageIntro eyebrow="Прозрачно и без обязательств" title="Поддержка, которую ты выбираешь">
        Два формата — для разных потребностей. Консультация психолога не входит в чат с Thera.
      </PageIntro>
      <section className="container-site grid gap-5 pb-20 md:grid-cols-2">
        <article className="soft-card p-8">
          <span className="feature-icon">
            <MessageCircle size={22} />
          </span>
          <h2 className="mt-6 text-xl font-semibold">Чат с Thera — бесплатно</h2>
          <p className="my-7 font-display text-4xl">0 ₸</p>
          <ul className="space-y-4 text-sm text-muted-foreground">
            {[
              "Разговор с ИИ-собеседником",
              "Эмоциональная поддержка",
              "Помощь в формулировке переживаний",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check size={17} className="text-accent" />
                {t}
              </li>
            ))}
          </ul>
          <Button asChild variant="hero" size="xl" className="mt-9">
            <Link to="/thera">
              Поговорить с Thera <ArrowRight />
            </Link>
          </Button>
        </article>
        <article className="soft-card p-8">
          <span className="feature-icon">
            <Heart size={22} />
          </span>
          <h2 className="mt-6 text-xl font-semibold">Консультация с психологом</h2>
          <p className="my-7 text-xl font-semibold">Оплачивается отдельно</p>
          <ul className="space-y-4 text-sm text-muted-foreground">
            {[
              "Встреча с реальным специалистом",
              "Цена в тенге до оформления заявки",
              bookingSubmissionsEnabled ? "Запись через Telegram" : "Запись скоро откроется",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check size={17} className="text-accent" />
                {t}
              </li>
            ))}
          </ul>
          <Button asChild variant="soft" size="xl" className="mt-9">
            <Link to="/psychologists">
              Посмотреть запись <ArrowRight />
            </Link>
          </Button>
        </article>
      </section>
    </>
  );
}
