import { createFileRoute } from "@tanstack/react-router";
import { Heart, Clock, Send, Video } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { pageHead, psychologists, formatKzt, telegramChatUrl } from "@/lib/site";
import { SessionPrep } from "@/components/session-prep";
export const Route = createFileRoute("/psychologists")({
  head: () =>
    pageHead(
      "Психологи",
      "Платные консультации с психологами. Стоимость в тенге и запись через Telegram.",
    ),
  component: Psychologists,
});
function Psychologists() {
  return (
    <>
      <PageIntro eyebrow="Профессиональная помощь" title="Не обязательно справляться в одиночку">
        Консультация с психологом — отдельный платный формат поддержки. Стоимость в тенге будет
        указана до записи.
      </PageIntro>
      <section className="container-site pb-20">
        <SessionPrep />
        {psychologists.length === 0 ? (
          <div className="flex flex-col items-center border-y border-border py-16 text-center">
            <span className="feature-icon">
              <Heart size={24} />
            </span>
            <h2 className="section-title mt-6">Запись скоро откроется</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
              Здесь появятся специалисты с подтверждённой квалификацией, темами консультаций и
              стоимостью встречи.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Video size={16} /> Формат встречи
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} /> Длительность
              </span>
              <span>Цена в тенге</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {psychologists.map((p) => (
              <article className="soft-card p-7" key={p.id}>
                {p.photo && (
                  <img
                    src={p.photo}
                    alt={p.name ?? ""}
                    className="mb-5 h-28 w-28 rounded-2xl object-cover"
                  />
                )}
                <h2 className="text-xl font-semibold">{p.name ?? "Консультация с психологом"}</h2>
                {p.qualification && <p className="mt-3 text-muted-foreground">{p.qualification}</p>}
                {p.topics?.length ? <p className="mt-3 text-sm">{p.topics.join(", ")}</p> : null}
                <p className="mt-3 text-sm text-muted-foreground">
                  {[p.language, p.format, `${p.durationMinutes} мин.`].filter(Boolean).join(" · ")}
                </p>
                <p className="my-5 text-xl font-semibold">
                  {formatKzt(p.priceKzt)}{" "}
                  <span className="text-sm text-muted-foreground">за {p.durationMinutes} мин.</span>
                </p>
                <Button variant="hero" asChild>
                  <a
                    href={telegramChatUrl(p.telegramUsername)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send size={16} /> Записаться в Telegram
                  </a>
                </Button>
                <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span>@{p.telegramUsername}</span>
                  <a href={`tel:${p.phone.number}`} className="underline underline-offset-4">
                    {p.phone.display}
                  </a>
                </p>
              </article>
            ))}
          </div>
        )}
        <p className="mt-8 max-w-2xl text-xs leading-6 text-muted-foreground">
          Чат с Thera бесплатен и не включает консультацию психолога. Переписка с Thera
          автоматически в заявку не добавляется. Оплата на сайте пока не подключена.
        </p>
      </section>
    </>
  );
}
