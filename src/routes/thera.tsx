import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Sparkles, ShieldCheck } from "lucide-react";
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
      <PageIntro eyebrow="Рядом, чтобы выслушать" title="Привет. Я Thera.">
        Можно начать с того, о чём проще говорить.
      </PageIntro>
      <section className="container-site grid items-start gap-7 pb-16 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="flex items-center justify-between gap-4 bg-card p-5">
            <span className="flex items-center gap-3 font-semibold">
              <Sparkles size={19} className="text-accent" /> Thera
            </span>
            <span className="text-xs text-accent">Бесплатный чат</span>
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
        <aside className="space-y-7">
          <div>
            <span className="feature-icon">
              <Sparkles size={22} />
            </span>
            <h2 className="mt-5 text-lg font-semibold">Можно просто поговорить</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Thera — ИИ-собеседник. Она может помочь тебе выговориться и сформулировать, что тебя
              беспокоит. За профессиональной помощью можно обратиться к психологу.
            </p>
          </div>
          <div className="border-t border-border pt-6">
            <ShieldCheck size={20} className="text-accent" />
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              Разговор проходит в Botpress. Переписка автоматически не передаётся в заявку
              психологу. Не сообщай пароли, платёжные данные и другие чувствительные сведения.
            </p>
          </div>
          <div>
            <Button asChild variant="soft" className="w-full">
              <a href={THERA_CHAT_URL} target="_blank" rel="noopener noreferrer">
                Открыть чат Thera <ExternalLink />
              </a>
            </Button>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              Если чат не отображается, он доступен в новой вкладке по этой же ссылке.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
