import { ConsultationRequest } from "@/components/consultation-request";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, Clock, Send, Video } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { pageHead, psychologists, formatKzt, telegramBookingUrl } from "@/lib/site";
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
      <PageIntro eyebrow="Профессиональная помощь" title="Консультация с психологом">
        Узнай стоимость встречи и договорись об удобном времени через Telegram.
      </PageIntro>
      <section id="consultation" className="container-site scroll-mt-24 pb-20">
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
          <div className="grid gap-5">
            {psychologists.map((p) => (
              <article className="soft-card consultation-callout" key={p.id}>
                <div>
                  {p.photo && (
                    <img
                      src={p.photo}
                      alt={p.name ?? ""}
                      className="mb-5 h-28 w-28 rounded-2xl object-cover"
                    />
                  )}
                  <h2 className="text-xl font-semibold">{p.name ?? "Консультация с психологом"}</h2>
                  {p.qualification && (
                    <p className="mt-3 text-muted-foreground">{p.qualification}</p>
                  )}
                  {p.topics?.length ? <p className="mt-3 text-sm">{p.topics.join(", ")}</p> : null}
                  <p className="mt-3 text-sm text-muted-foreground">
                    {[p.language, p.format, `${p.durationMinutes} мин.`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
                    Психолог подтвердит дату и время в Telegram. Там же можно уточнить условия
                    переноса и отмены.
                  </p>
                </div>
                <div className="grid gap-3 md:min-w-62">
                  <p className="flex flex-wrap items-baseline gap-x-2 font-display text-3xl font-semibold">
                    {formatKzt(p.priceKzt)}{" "}
                    <span className="text-sm text-muted-foreground">
                      за {p.durationMinutes} мин.
                    </span>
                  </p>
                  <Button variant="hero" size="xl" asChild>
                    <a
                      href={telegramBookingUrl(p.telegramUsername)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Send size={16} /> Записаться в Telegram
                    </a>
                  </Button>
                  <p className="flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground">
                    <span>@{p.telegramUsername}</span>
                    <a
                      href={`tel:${p.phone.number}`}
                      className="inline-flex min-h-11 items-center underline underline-offset-4"
                    >
                      {p.phone.display}
                    </a>
                  </p>
                  <ConsultationRequest specialistId={p.id} />
                </div>
              </article>
            ))}
          </div>
        )}
        <SessionPrep />
        <p className="mt-8 max-w-2xl text-xs leading-6 text-muted-foreground">
          Чат с Thera бесплатен и не включает консультацию психолога. Переписка с Thera
          автоматически в заявку не добавляется. Оплата на сайте пока не подключена.
        </p>
      </section>
    </>
  );
}
