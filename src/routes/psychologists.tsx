import { createFileRoute } from "@tanstack/react-router";
import { Heart, Clock, Video } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { pageHead, psychologists, formatKzt } from "@/lib/site";
import { useState } from "react";
export const Route = createFileRoute("/psychologists")({
  head: () =>
    pageHead(
      "Психологи",
      "Платные консультации с реальными психологами. Запись скоро откроется; стоимость будет доступна до заявки.",
    ),
  component: Psychologists,
});
function Psychologists() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <PageIntro eyebrow="Профессиональная помощь" title="Не обязательно справляться в одиночку">
        Консультация с психологом — отдельный платный формат поддержки. Стоимость в тенге будет
        указана до записи.
      </PageIntro>
      <section className="container-site pb-20">
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
                <img
                  src={p.photo}
                  alt={p.name}
                  className="mb-5 h-28 w-28 rounded-2xl object-cover"
                />
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="mt-3 text-muted-foreground">{p.qualification}</p>
                <p className="mt-3 text-sm">{p.topics.join(", ")}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {p.language} · {p.format} · {p.durationMinutes} мин.
                </p>
                <p className="my-5 text-xl font-semibold">
                  {formatKzt(p.priceKzt)}{" "}
                  <span className="text-xs text-muted-foreground">
                    за консультацию, оплачивается отдельно
                  </span>
                </p>
                <Button variant="hero" onClick={() => setSelected(p.id)}>
                  Оставить заявку
                </Button>
              </article>
            ))}
          </div>
        )}
        {selected && (
          <section className="mt-10 max-w-xl">
            <h2 className="text-xl font-semibold">Заявка на консультацию</h2>
            <p className="my-4 text-sm text-muted-foreground">
              Демо-форма. Отправка заявок пока не настроена; данные не отправляются и не
              сохраняются.
            </p>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <label className="block text-sm">
                Имя
                <input disabled maxLength={100} className="field mt-2" />
              </label>
              <label className="block text-sm">
                Контакт
                <input disabled maxLength={255} className="field mt-2" />
              </label>
              <label className="block text-sm">
                Удобное время
                <input disabled maxLength={200} className="field mt-2" />
              </label>
              <Button disabled>Отправка недоступна</Button>
            </form>
          </section>
        )}
        <p className="mt-8 max-w-2xl text-xs leading-6 text-muted-foreground">
          Чат с Thera бесплатен и не включает консультацию психолога. Переписка с Thera
          автоматически в заявку не добавляется. Оплата на сайте пока не подключена.
        </p>
      </section>
    </>
  );
}
