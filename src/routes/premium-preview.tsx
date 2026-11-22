import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AuthPanel } from "@/components/auth-panel";
import { useAuthState } from "@/components/auth-state";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { checkPremiumPreview, generatePremiumPreview } from "@/lib/premium-preview.functions";

export const Route = createFileRoute("/premium-preview")({
  head: () => ({
    meta: [
      { title: "Thera Premium — тестовый режим" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PremiumPreviewPage,
});

function PremiumPreviewPage() {
  const { ready, user } = useAuthState();
  return (
    <>
      <PageIntro eyebrow="Тестовый режим" title="Thera Premium">
        2 990 ₸ за 30 дней без автопродления.
      </PageIntro>
      <section className="container-site pb-20">
        <ClientOnly fallback={<p role="status">Проверяем вход…</p>}>
          {!ready ? (
            <p role="status">Проверяем вход…</p>
          ) : user ? (
            <OwnerPreview key={user.id} userId={user.id} />
          ) : (
            <AuthPanel ownerArea="/premium-preview" />
          )}
        </ClientOnly>
      </section>
    </>
  );
}

function OwnerPreview({ userId }: { userId: string }) {
  const checkAccess = useServerFn(checkPremiumPreview);
  const access = useQuery({ queryKey: ["premium-preview", userId], queryFn: () => checkAccess() });
  if (access.isPending) return <p role="status">Проверяем доступ…</p>;
  if (access.isError)
    return (
      <p>
        Не удалось проверить доступ.{" "}
        <button type="button" className="underline" onClick={() => void access.refetch()}>
          Повторить
        </button>
      </p>
    );
  if (!access.data) return <p>Тестовый доступ пока есть только у владельца Thera.</p>;
  return <PremiumDemo />;
}

function PremiumDemo() {
  const [stage, setStage] = useState<"ready" | "card" | "active">("ready");
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <article className="soft-card p-6">
        <h2 className="text-xl font-semibold">Как будет работать оплата</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Это симуляция. Для проверки используется вымышленная карта и деньги не списываются.
        </p>
        {stage === "ready" && (
          <Button className="mt-5" variant="hero" onClick={() => setStage("card")}>
            Выбрать тестовую карту
          </Button>
        )}
        {stage === "card" && (
          <div className="mt-5 space-y-4">
            <p className="rounded-xl border border-border p-4">Тестовая карта ···· 0000</p>
            <Button variant="hero" onClick={() => setStage("active")}>
              Имитировать оплату 2 990 ₸
            </Button>
          </div>
        )}
        {stage === "active" && (
          <div className="mt-5 space-y-4">
            <p role="status">Тестовый Premium активирован до обновления страницы.</p>
            <Button variant="outline" onClick={() => setStage("ready")}>
              Начать тест заново
            </Button>
          </div>
        )}
      </article>
      <article className="soft-card p-6">
        <h2 className="text-xl font-semibold">ИИ-план и вопросы для дневника</h2>
        {stage === "active" ? (
          <PremiumTools />
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Пройди тестовый сценарий, чтобы попробовать составить короткий план или получить три
            вопроса для дневника.
          </p>
        )}
      </article>
    </div>
  );
}

function PremiumTools() {
  const generate = useServerFn(generatePremiumPreview);
  const [tool, setTool] = useState<"plan" | "reflection">("plan");
  const [focus, setFocus] = useState<"pause" | "rest" | "focus">("pause");
  const [minutes, setMinutes] = useState<3 | 5 | 10>(5);
  const mutation = useMutation({ mutationFn: () => generate({ data: { tool, focus, minutes } }) });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mutation.isPending) mutation.mutate();
  }
  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <label className="block text-sm">
        Инструмент
        <select
          className="field mt-2"
          value={tool}
          disabled={mutation.isPending}
          onChange={(e) => setTool(e.target.value === "reflection" ? "reflection" : "plan")}
        >
          <option value="plan">Короткий план самопомощи</option>
          <option value="reflection">Вопросы для дневника</option>
        </select>
      </label>
      <label className="block text-sm">
        Тема
        <select
          className="field mt-2"
          value={focus}
          disabled={mutation.isPending}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "pause" || value === "rest" || value === "focus") setFocus(value);
          }}
        >
          <option value="pause">Сделать паузу</option>
          <option value="rest">Восстановить силы</option>
          <option value="focus">Сосредоточиться</option>
        </select>
      </label>
      <label className="block text-sm">
        Сколько есть времени
        <select
          className="field mt-2"
          value={minutes}
          disabled={mutation.isPending}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value === 3 || value === 5 || value === 10) setMinutes(value);
          }}
        >
          <option value="3">3 минуты</option>
          <option value="5">5 минут</option>
          <option value="10">10 минут</option>
        </select>
      </label>
      <p className="text-sm text-muted-foreground">ИИ получает только выбранные настройки.</p>
      <Button type="submit" variant="hero" disabled={mutation.isPending}>
        {mutation.isPending ? "Готовим ответ…" : "Получить подсказки"}
      </Button>
      {mutation.isError && <p role="alert">Не удалось получить ответ. Попробуй позже.</p>}
      {mutation.data?.error && <p role="alert">{mutation.data.error}</p>}
      {Boolean(mutation.data?.items.length) && (
        <div aria-live="polite">
          <ol className="list-decimal space-y-2 pl-5">
            {mutation.data?.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
          <Link
            to="/journal"
            hash="journal-entries"
            className="mt-3 inline-block text-sm underline"
          >
            Открыть дневник
          </Link>
        </div>
      )}
    </form>
  );
}
