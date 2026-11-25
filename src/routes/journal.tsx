import { Suspense } from "react";
import { createFileRoute, ClientOnly, Navigate } from "@tanstack/react-router";
import { PageIntro } from "@/components/site-shell";
import { findPsychologist, pageHead } from "@/lib/site";
import { useAuthState } from "@/components/auth-state";
import { AuthPanel } from "@/components/auth-panel";
import { MyConsultations } from "@/components/my-consultations";
import { AccountProfile } from "@/components/account-profile";
import { JournalEditor } from "@/components/journal-editor";

export const Route = createFileRoute("/journal")({
  head: () =>
    pageHead("Личный кабинет", "Профиль TherapyAI, личный дневник и заявки на консультацию."),
  validateSearch: (search): { next?: "consultation"; specialist?: string } => {
    if (search["next"] !== "consultation") return {};
    const specialist = findPsychologist(search["specialist"]);
    return specialist
      ? { next: "consultation", specialist: specialist.id }
      : { next: "consultation" };
  },
  component: Journal,
});

function Journal() {
  const { user, ready } = useAuthState();
  const { next, specialist } = Route.useSearch();
  const booking = next === "consultation";
  const bookingSearch = specialist ? { specialist } : { rebook: true as const };
  const bookingHash = specialist ? `booking-${specialist}` : "consultation";
  return (
    <>
      <PageIntro eyebrow="Твой аккаунт" title="Личный кабинет">
        Здесь твой профиль, личный дневник и заявки к психологу.
      </PageIntro>
      <section className="container-site pb-20">
        <ClientOnly fallback={<p>Загружаем личный кабинет…</p>}>
          {!ready ? (
            <p role="status">Проверяем вход…</p>
          ) : user ? (
            booking ? (
              <Navigate to="/psychologists" hash={bookingHash} search={bookingSearch} replace />
            ) : (
              <div key={user.id} className="space-y-10">
                <AccountProfile user={user} />
                <section
                  id="journal-entries"
                  className="scroll-mt-24"
                  aria-labelledby="journal-heading"
                >
                  <h2 id="journal-heading" className="section-title mb-6">
                    Дневник эмоций
                  </h2>
                  <Suspense fallback={<p role="status">Загружаем записи…</p>}>
                    <JournalEditor />
                  </Suspense>
                </section>
                <MyConsultations userId={user.id} />
              </div>
            )
          ) : (
            <AuthPanel booking={booking} bookingSpecialist={specialist} />
          )}
        </ClientOnly>
      </section>
    </>
  );
}
