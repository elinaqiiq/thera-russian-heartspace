import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { bookingSubmissionsEnabled, pageHead, THERA_CHAT_URL } from "@/lib/site";
export const Route = createFileRoute("/support")({
  head: () =>
    pageHead(
      "Поддержка и безопасность",
      "Ответы на вопросы о Thera, записи к психологу и безопасном использовании TherapyAI.",
    ),
  component: Support,
});
function Support() {
  return (
    <>
      <PageIntro eyebrow="Мы бережно относимся к тебе" title="Поддержка и безопасность">
        Ответы на вопросы о TherapyAI.
      </PageIntro>
      <section className="container-site grid gap-12 pb-20 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-border">
          {[
            {
              q: "Что делать, если чат не загружается?",
              a: "Открой чат Thera в новой вкладке по кнопке ниже. Это тот же опубликованный чат Botpress.",
            },
            {
              q: "Thera заменяет психолога?",
              a: "Нет. Thera — ИИ-собеседник для эмоциональной поддержки. За профессиональной помощью можно обратиться к психологу.",
            },
            {
              q: "Можно ли уже записаться на консультацию?",
              a: bookingSubmissionsEnabled
                ? "На странице «Психологи» указана стоимость консультации. Кнопка записи откроет личный чат психолога в Telegram."
                : "Пока запись недоступна. Она откроется после появления подтверждённых специалистов и настройки отправки заявок.",
            },
            {
              q: "Передаётся ли переписка психологу?",
              a: "Запись в Telegram открывается с обычным приветствием. Сводку и выбранный фрагмент переписки можешь отправить психологу самостоятельно.",
            },
            {
              q: "Куда обратиться по вопросам сайта?",
              a: "Контакт поддержки пока не предоставлен. Он появится здесь после подтверждения владельцем сайта.",
            },
          ].map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="cursor-pointer text-base font-semibold marker:text-accent">
                {f.q}
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{f.a}</p>
            </details>
          ))}
          <section id="data-and-privacy" className="scroll-mt-24 py-6">
            <h2 className="text-lg font-semibold">Как используются данные</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
              <li>
                Переписку обрабатывает Botpress. История гостевого чата не привязана к аккаунту.
                Когда личный чат подключён, его историю можно открыть или удалить на странице Thera.
              </li>
              <li>
                По кнопке «Составить сводку» выбранный текст уходит на обработку ИИ через Lovable.
                На сайте черновик живёт на странице. Кнопка «Очистить текст» удаляет его со
                страницы.
              </li>
              <li>Записи дневника хранятся в твоём аккаунте. Удалить запись можно в дневнике.</li>
              <li>Психолог увидит только то, что ты отправишь ему в Telegram.</li>
            </ul>
          </section>
        </div>
        <aside id="urgent-help" className="scroll-mt-24">
          <ShieldCheck size={27} className="text-accent" />
          <h2 className="mt-5 text-lg font-semibold">Если нужна срочная помощь</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Thera не является экстренной службой. При угрозе жизни, риске причинить вред себе или
            другим обратись в местные экстренные службы и, если возможно, к человеку, которому
            доверяешь.
          </p>
          <Button asChild variant="soft" className="mt-7">
            <a href={THERA_CHAT_URL} target="_blank" rel="noopener noreferrer">
              Открыть чат Thera <ExternalLink />
            </a>
          </Button>
        </aside>
      </section>
    </>
  );
}
