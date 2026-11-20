import { Suspense } from "react";
import { createFileRoute, ClientOnly, Navigate } from "@tanstack/react-router";
import { PageIntro } from "@/components/site-shell";
import { pageHead } from "@/lib/site";
import { useAuthState } from "@/components/auth-state";
import { AuthPanel } from "@/components/auth-panel";
import { MyConsultations } from "@/components/my-consultations";
import { JournalEditor } from "@/components/journal-editor";

export const Route = createFileRoute("/journal")({
  head: () =>
    pageHead(
      "Дневник эмоций",
      "Личный дневник TherapyAI: настроение, эмоции, текстовые и голосовые заметки.",
    ),
  validateSearch: (search): { next?: "consultation" } =>
    search["next"] === "consultation" ? { next: "consultation" } : {},
  component: Journal,
});

function Journal() {
  const { user, ready } = useAuthState();
  const booking = Route.useSearch().next === "consultation";
  return (
    <>
      <PageIntro eyebrow="Место для твоих чувств" title="Дневник эмоций">
        Любые чувства имеют значение. Сегодня можно просто заметить их.
      </PageIntro>
      <section className="container-site pb-20">
        <ClientOnly fallback={<p>Загружаем дневник…</p>}>
          {!ready ? (
            <p role="status">Проверяем вход…</p>
          ) : user ? (
            booking ? (
              <Navigate to="/psychologists" hash="consultation" replace />
            ) : (
              <div key={user.id}>
                <MyConsultations userId={user.id} />
                <Suspense fallback={<p>Загружаем записи…</p>}>
                  <JournalEditor />
                </Suspense>
              </div>
            )
          ) : (
            <AuthPanel booking={booking} />
          )}
        </ClientOnly>
      </section>
    </>
  );
}
