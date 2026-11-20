import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, NotebookPen, ShieldCheck, Sparkles } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { pageHead, THERA_CHAT_URL } from "@/lib/site";
import { useState } from "react";
export const Route = createFileRoute("/thera")({
  head: () =>
    pageHead(
      "Чат с Thera",
      "Бесплатный разговор с твоим ИИ-собеседником для эмоциональной поддержки.",
    ),
  component: Thera,
});
function Thera() {
  const [failed, setFailed] = useState(false);
  return (
    <>
      <PageIntro eyebrow="ИИ-собеседник" title="Поговори с Thera">
        Можно начать с того, о чём проще говорить.
      </PageIntro>
      <div className="container-site mb-4 flex flex-wrap items-center justify-between gap-x-4">
        <Link
          to="/support"
          hash="urgent-help"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4"
        >
          Нужна срочная помощь
        </Link>
        <a
          href={THERA_CHAT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Чат в новой вкладке <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
      <section className="container-site grid items-start gap-5 pb-16 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="flex items-center justify-between gap-4 bg-card px-5 py-4">
            <span className="flex items-center gap-3 font-bold">
              <Sparkles size={19} className="text-accent" aria-hidden="true" /> Thera
            </span>
            <span className="text-sm text-muted-foreground">Бесплатно</span>
          </div>
          {failed ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-5 p-8 text-center">
              <p>Чат не удалось загрузить внутри страницы.</p>
              <Button asChild variant="hero">
                <a href={THERA_CHAT_URL} target="_blank" rel="noopener noreferrer">
                  Открыть чат Thera <ExternalLink />
                </a>
              </Button>
            </div>
          ) : (
            <iframe
              className="chat-frame"
              src={THERA_CHAT_URL}
              title="Чат с Thera в Botpress"
              allow="clipboard-write"
              onError={() => setFailed(true)}
            />
          )}
        </div>
        <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <section className="soft-card p-5">
            <span className="feature-icon">
              <NotebookPen size={22} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-bold">Сводка для консультации</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Выбери фрагмент разговора и собери главное в короткую заметку для психолога.
            </p>
            <Button asChild variant="soft" className="mt-4 min-h-11 w-full">
              <Link to="/psychologists" hash="session-prep">
                Подготовить сводку
              </Link>
            </Button>
          </section>
          <section className="soft-card p-5">
            <ShieldCheck size={22} className="text-accent" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold">Приватность</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Сообщения обрабатываются в Botpress. Ты сам решаешь, чем поделиться с психологом.
            </p>
            <Link
              to="/support"
              hash="data-and-privacy"
              className="mt-2 inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-4"
            >
              Как используются данные
            </Link>
          </section>
        </aside>
      </section>
    </>
  );
}
