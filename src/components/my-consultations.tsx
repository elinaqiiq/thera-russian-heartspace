import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { RescheduleForm } from "@/components/reschedule-form";
import { Button } from "@/components/ui/button";
import { consultationStatuses, consultationTimeZone, meetingFormats } from "@/lib/consultations";
import {
  cancelConsultationRequest,
  listConsultationRequests,
  requestReschedule,
} from "@/lib/registry.functions";

const almatyDateTime = new Intl.DateTimeFormat("ru-KZ", {
  timeZone: consultationTimeZone,
  dateStyle: "medium",
  timeStyle: "short",
});

export function MyConsultations({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["consultation-requests", userId];
  const list = useServerFn(listConsultationRequests);
  const cancel = useServerFn(cancelConsultationRequest);
  const propose = useServerFn(requestReschedule);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const requests = useQuery({ queryKey, queryFn: () => list() });
  const cancellation = useMutation({
    mutationFn: (id: string) => cancel({ data: { id } }),
    onSuccess: async ({ cancelled }) => {
      setNotice(cancelled ? "Заявка отменена." : "Эту заявку уже нельзя отменить.");
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => setNotice("Не удалось отменить заявку. Попробуй ещё раз."),
  });

  const reschedule = useMutation({
    mutationFn: (data: { id: string; proposedStart: string }) => propose({ data }),
    onSuccess: async (result) => {
      setNotice(
        result === "saved"
          ? "Запрос на перенос отправлен. Исходное время сохранено."
          : result === "invalid"
            ? "Выбери время в будущем."
            : "Запрос сейчас недоступен. Проверь статус встречи.",
      );
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => setNotice("Не удалось запросить перенос. Попробуй ещё раз."),
  });

  return (
    <section
      id="my-consultations"
      className="soft-card mb-8 scroll-mt-24"
      aria-labelledby="my-consultations-heading"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <h2 id="my-consultations-heading" className="text-xl font-semibold">
          Мои заявки к психологу
        </h2>
        <Link to="/psychologists" hash="consultation" className="text-sm underline">
          Записаться
        </Link>
      </div>
      {requests.isPending && (
        <p role="status" className="mt-3 text-sm">
          Загружаем заявки…
        </p>
      )}
      {requests.isError && (
        <p className="mt-3 text-sm">
          Не удалось загрузить заявки.{" "}
          <button type="button" className="underline" onClick={() => void requests.refetch()}>
            Повторить
          </button>
        </p>
      )}
      {requests.isSuccess && requests.data.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">Заявок пока нет.</p>
      )}
      {Boolean(requests.data?.length) && (
        <ul className="mt-3 divide-y divide-border">
          {requests.data?.map((request) => {
            const canCancel =
              request.status === "pending" ||
              (request.status === "confirmed" &&
                request.requested_start !== null &&
                Date.parse(request.requested_start) > Date.now());
            return (
              <li key={request.id} className="py-3">
                <p className="text-sm font-semibold">{consultationStatuses[request.status]}</p>
                <p className="text-sm text-muted-foreground">
                  {request.requested_start
                    ? `${almatyDateTime.format(new Date(request.requested_start))} · Алматы`
                    : "Время не указано"}
                </p>
                {request.status === "confirmed" && (
                  <>
                    {request.meeting_format && request.meeting_instructions ? (
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="font-medium">{meetingFormats[request.meeting_format]}</p>
                        <MeetingInstructions text={request.meeting_instructions} />
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Психолог пока не добавил детали встречи.
                      </p>
                    )}
                    {request.requested_start &&
                      Date.parse(request.requested_start) > Date.now() &&
                      (request.reschedule_status === "pending" && request.reschedule_start ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Запрошен перенос на{" "}
                          {almatyDateTime.format(new Date(request.reschedule_start))} · Алматы.
                          Исходное время действует до подтверждения.
                        </p>
                      ) : (
                        <>
                          {request.reschedule_status === "declined" && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              Перенос отклонён. Исходное время сохранено.
                            </p>
                          )}
                          {request.reschedule_status === "accepted" && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              Перенос подтверждён. Выше указано новое время.
                            </p>
                          )}
                          <RescheduleForm
                            currentStart={request.requested_start}
                            busy={reschedule.isPending || cancellation.isPending}
                            onSubmit={(proposedStart) => {
                              setNotice("");
                              reschedule.mutate({ id: request.id, proposedStart });
                            }}
                          />
                        </>
                      ))}
                  </>
                )}
                {request.status === "completed" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="soft">
                      <a href="#journal-entries">Сделать заметку в дневнике</a>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/psychologists" search={{ rebook: true }} hash="consultation">
                        Записаться повторно
                      </Link>
                    </Button>
                  </div>
                )}
                {canCancel &&
                  (selectedId === request.id ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm">Отменить эту заявку?</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={cancellation.isPending || reschedule.isPending}
                        onClick={() => cancellation.mutate(request.id)}
                      >
                        Подтвердить отмену
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={cancellation.isPending || reschedule.isPending}
                        onClick={() => setSelectedId(null)}
                      >
                        Оставить заявку
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      className="px-0"
                      disabled={cancellation.isPending || reschedule.isPending}
                      onClick={() => {
                        setNotice("");
                        setSelectedId(request.id);
                      }}
                    >
                      Отменить
                    </Button>
                  ))}
              </li>
            );
          })}
        </ul>
      )}
      {notice && (
        <p className="mt-3 text-sm" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}

function MeetingInstructions({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-muted-foreground">
      {text.split(/(https:\/\/[^\s<>()]+)/g).map((part, index) => {
        if (!part.startsWith("https://")) return part;
        let url: URL;
        try {
          url = new URL(part);
        } catch {
          return part;
        }
        if (url.username || url.password || url.protocol !== "https:") return part;
        return (
          <a
            key={index}
            href={url.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            {part}
          </a>
        );
      })}
    </p>
  );
}
