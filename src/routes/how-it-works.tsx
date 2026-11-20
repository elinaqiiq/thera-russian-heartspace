import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Heart, Compass } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { bookingSubmissionsEnabled, pageHead } from "@/lib/site";
export const Route = createFileRoute("/how-it-works")({
  head: () =>
    pageHead(
      "Как это работает",
      "Выбери разговор с Thera или отдельную консультацию психолога. Поддержка в твоём темпе.",
    ),
  component: HowItWorks,
});
function HowItWorks() {
  return (
    <>
      <PageIntro eyebrow="В твоём темпе" title="Начни с небольшого шага">
        Не нужно заранее знать, что сказать. Выбери подходящий для себя формат поддержки.
      </PageIntro>
      <section className="container-site pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Compass,
              title: "Выбери поддержку",
              text: "Бесплатный разговор с Thera или платная консультация с реальным психологом.",
            },
            {
              icon: MessageCircle,
              title: "Расскажи о своём",
              text: "Thera может помочь выговориться и сформулировать, что тебя беспокоит.",
            },
            {
              icon: Heart,
              title: "Обратись к психологу",
              text: bookingSubmissionsEnabled
                ? "Посмотри стоимость консультации и договорись о времени с психологом в Telegram."
                : "Для профессиональной помощи можно выбрать специалиста, когда запись откроется. Стоимость будет видна до заявки.",
            },
          ].map((step, i) => (
            <article className="soft-card p-7" key={step.title}>
              <div className="flex items-center justify-between">
                <span className="feature-icon">
                  <step.icon size={22} />
                </span>
                <span className="text-sm text-muted-foreground">0{i + 1}</span>
              </div>
              <h2 className="mt-6 text-lg font-semibold">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.text}</p>
            </article>
          ))}
        </div>
        <p className="my-8 max-w-2xl text-sm leading-7 text-muted-foreground">
          Переписка с Thera автоматически не добавляется в заявку психологу. Чат и консультация —
          отдельные форматы.
        </p>
        <Button asChild variant="hero" size="xl">
          <Link to="/thera">
            Поговорить с Thera <ArrowRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
