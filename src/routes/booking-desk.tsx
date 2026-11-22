import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, RefreshCw, X } from "lucide-react";
import { AuthPanel } from "@/components/auth-panel";
import { useAuthState } from "@/components/auth-state";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { loadBookingDesk, decideBooking } from "@/lib/booking-desk.functions";
import { consultationStatuses, consultationTimeZone } from "@/lib/consultations";

export const Route = createFileRoute("/booking-desk")({
  head: () => ({
    meta: [
      { title: "Заявки на консультацию — Thera" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BookingDeskPage,
});

const almatyDate = new Intl.DateTimeFormat("ru-KZ", {
  timeZone: consultationTimeZone,
  dateStyle: "medium",
  timeStyle: "short",
});

function BookingDeskPage() {
  const { user, ready } = useAuthState();
  return (
    <>
      <PageIntro eyebrow="Thera" title="Заявки на консультацию">
        Подтверждай время и принимай решения по заявкам.
      </PageIntro>
      <section className="container-site pb-20">
        <ClientOnly fallback={<p role="status">Проверяем вход…</p>}>
          {!ready ? (
            <p role="status">Проверяем вход…</p>
          ) : user ? (
            <BookingDesk key={user.id} userId={user.id} />
          ) : (
            <AuthPanel ownerArea="/booking-desk" />
          )}
        </ClientOnly>
      </section>
    </>
  );
}

function BookingDesk({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["booking-desk", userId];
  const load = useServerFn(loadBookingDesk);
  const decide = useServerFn(decideBooking);
  const [notice, setNotice] = useState("");
  const bookings = useQuery({ queryKey, queryFn: () => load() });
  const decision = useMutation({
    mutationFn: (data: { id: string; decision: "confirmed" | "declined" }) => decide({ data }),
    onSuccess: async (result, input) => {
      const messages = {
        saved: input.decision === "confirmed" ? "Заявка подтверждена." : "Заявка отклонена.",
        slot_taken: "На это время уже есть подтверждённая заявка.",
        unavailable: "Заявка уже обработана или время больше недоступно.",
        denied: "Доступ к заявкам закрыт.",
        invalid: "Не удалось изменить статус.",
      };
      setNotice(messages[result]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ["consultation-requests", userId] }),
      ]);
    },
    onError: () => setNotice("Не удалось изменить статус. Попробуй ещё раз."),
  });

  if (bookings.isPending) return <p role="status">Загружаем заявки…</p>;
  if (bookings.isError)
    return (
      <p>
        Не удалось загрузить заявки.{" "}
        <button className="underline" type="button" onClick={() => void bookings.refetch()}>
          Повторить
        </button>
      </p>
    );
  if (!bookings.data) return <p>У этого аккаунта нет доступа к заявкам.</p>;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={bookings.isFetching || decision.isPending}
          onClick={() => void bookings.refetch()}
        >
          <RefreshCw aria-hidden="true" /> Обновить
        </Button>
        {notice && (
          <p className="text-sm" role="status">
            {notice}
          </p>
        )}
      </div>
      {bookings.data.length === 0 ? (
        <p>Заявок пока нет.</p>
      ) : (
        <ul className="grid gap-4">
          {bookings.data.map((booking) => (
            <li
              key={booking.request_id}
              className="soft-card flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <div className="min-w-0 space-y-1">
                <p className="break-words font-semibold">
                  {booking.display_name || "Имя не указано"}
                </p>
                {booking.email && (
                  <p className="break-all text-sm text-muted-foreground">{booking.email}</p>
                )}
                {booking.telegram_username && (
                  <p className="break-all text-sm text-muted-foreground">
                    @{booking.telegram_username}
                  </p>
                )}
                <p className="text-sm">
                  {booking.requested_start
                    ? `${almatyDate.format(new Date(booking.requested_start))} · Алматы`
                    : "Время не указано"}
                </p>
                <p className="text-sm text-accent">{consultationStatuses[booking.status]}</p>
              </div>
              {booking.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="hero"
                    disabled={
                      decision.isPending ||
                      !booking.requested_start ||
                      Date.parse(booking.requested_start) <= Date.now()
                    }
                    onClick={() => {
                      setNotice("");
                      decision.mutate({ id: booking.request_id, decision: "confirmed" });
                    }}
                  >
                    <Check aria-hidden="true" /> Подтвердить
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={decision.isPending}
                    onClick={() => {
                      setNotice("");
                      decision.mutate({ id: booking.request_id, decision: "declined" });
                    }}
                  >
                    <X aria-hidden="true" /> Отклонить
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
