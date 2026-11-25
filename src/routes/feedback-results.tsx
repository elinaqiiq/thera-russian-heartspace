import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AuthPanel } from "@/components/auth-panel";
import { useAuthState } from "@/components/auth-state";
import { PageIntro } from "@/components/site-shell";
import { feedbackAnswers, type FeedbackAnswer } from "@/lib/feedback";
import { loadFeedback } from "@/lib/feedback.functions";

export const Route = createFileRoute("/feedback-results")({
  head: () => ({
    meta: [
      { title: "Ответы обратной связи — TherapyAI" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FeedbackResultsPage,
});

const dateFormat = new Intl.DateTimeFormat("ru-KZ", {
  timeZone: "Asia/Almaty",
  dateStyle: "medium",
  timeStyle: "short",
});

function FeedbackResultsPage() {
  const { user, ready } = useAuthState();
  return (
    <>
      <PageIntro eyebrow="Для владельца" title="Ответы обратной связи">
        Доступно только администратору сайта.
      </PageIntro>
      <section className="container-site pb-20">
        <ClientOnly fallback={<p role="status">Проверяем вход…</p>}>
          {!ready ? (
            <p role="status">Проверяем вход…</p>
          ) : user ? (
            <Results key={user.id} userId={user.id} />
          ) : (
            <AuthPanel ownerArea="/feedback-results" />
          )}
        </ClientOnly>
      </section>
    </>
  );
}

function Results({ userId }: { userId: string }) {
  const load = useServerFn(loadFeedback);
  const query = useQuery({ queryKey: ["feedback-results", userId], queryFn: () => load() });
  if (query.isPending) return <p role="status">Загружаем…</p>;
  if (query.isError) return <p role="alert">Не удалось загрузить ответы.</p>;
  if (!query.data) return <p role="alert">Нет доступа к ответам.</p>;
  const { counts, items } = query.data;
  return (
    <>
      <dl className="grid max-w-xl grid-cols-3 gap-3">
        {(Object.keys(feedbackAnswers) as FeedbackAnswer[]).map((key) => (
          <div key={key} className="soft-card">
            <dt className="text-sm text-muted-foreground">{feedbackAnswers[key]}</dt>
            <dd className="font-display text-3xl font-semibold">{counts[key]}</dd>
          </div>
        ))}
      </dl>
      {items.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Ответов пока нет.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="grid gap-1 py-4 text-sm">
              <p className="font-semibold">
                {feedbackAnswers[item.helped]} · {dateFormat.format(new Date(item.created_at))}
              </p>
              <p>Что улучшить: {item.improve || "—"}</p>
              <p>Что не понравилось: {item.disliked || "—"}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
