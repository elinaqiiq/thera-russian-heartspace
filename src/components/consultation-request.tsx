import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState, type FormEvent } from "react";
import { useAuthState } from "@/components/auth-state";
import { Button } from "@/components/ui/button";
import { consultationStart, consultationStatuses } from "@/lib/consultations";
import { submitConsultationRequest } from "@/lib/registry.functions";

export function ConsultationRequest({
  specialistId,
  initiallyOpen = false,
}: {
  specialistId: string;
  initiallyOpen?: boolean;
}) {
  const { ready, user } = useAuthState();
  if (!ready) return null;
  if (!user)
    return (
      <p id={`booking-${specialistId}`} className="scroll-mt-24 text-sm text-muted-foreground">
        <Link
          to="/journal"
          search={{ next: "consultation", specialist: specialistId }}
          className="underline"
        >
          Войди или зарегистрируйся
        </Link>{" "}
        для отправки заявки с сайта.
      </p>
    );
  return (
    <RequestForm
      key={user.id}
      specialistId={specialistId}
      userId={user.id}
      initiallyOpen={initiallyOpen}
    />
  );
}

function RequestForm({
  specialistId,
  userId,
  initiallyOpen,
}: {
  specialistId: string;
  userId: string;
  initiallyOpen: boolean;
}) {
  const queryClient = useQueryClient();
  const submit = useServerFn(submitConsultationRequest);
  const id = useRef<string>(undefined);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [telegram, setTelegram] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const username = telegram.trim().replace(/^@/, "");
  const invalid = Boolean(username) && !/^[a-zA-Z][a-zA-Z0-9_]{3,30}[a-zA-Z0-9]$/.test(username);

  const requestedStart = consultationStart(date, time);
  const invalidDate = Boolean(
    date && time && (!requestedStart || Date.parse(requestedStart) <= Date.now()),
  );

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !consent ||
      invalid ||
      !requestedStart ||
      invalidDate ||
      state === "busy" ||
      state === "sent"
    )
      return;
    id.current ??= crypto.randomUUID();
    setState("busy");
    try {
      await submit({
        data: {
          id: id.current,
          specialistId,
          telegramUsername: username,
          requestedStart,
          consent: true,
        },
      });
      setState("sent");
      void queryClient.invalidateQueries({ queryKey: ["consultation-requests", userId] });
    } catch {
      setState("error");
    }
  }

  if (state === "sent")
    return (
      <p role="status" className="text-sm text-accent">
        Заявка сохранена. Статус — «{consultationStatuses.pending}».{" "}
        <Link to="/journal" search={{}} hash="my-consultations" className="underline">
          Проверить статус
        </Link>
      </p>
    );

  return (
    <details
      id={`booking-${specialistId}`}
      open={initiallyOpen || undefined}
      className="scroll-mt-24 border-t border-border pt-3"
    >
      <summary className="cursor-pointer text-sm font-semibold">Оставить заявку на сайте</summary>
      <form className="mt-3 space-y-3" onSubmit={send}>
        <p className="text-sm text-muted-foreground">
          Предложи удобное время по Алматы. Психолог проверит, свободно ли оно.
        </p>
        <label className="block text-sm">
          Желаемая дата
          <input
            className="field mt-1"
            type="date"
            required
            value={date}
            disabled={state === "busy"}
            onChange={(event) => {
              id.current = undefined;
              setDate(event.target.value);
            }}
          />
        </label>
        <label className="block text-sm">
          Желаемое время (Алматы)
          <select
            className="field mt-1"
            required
            value={time}
            disabled={state === "busy"}
            onChange={(event) => {
              id.current = undefined;
              setTime(event.target.value);
            }}
          >
            <option value="">Выбери время</option>
            {Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`).map(
              (hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ),
            )}
          </select>
        </label>
        {invalidDate && (
          <p role="status" className="text-xs text-destructive">
            Выбери дату и время в будущем.
          </p>
        )}
        <label className="block text-sm">
          Твой Telegram, если удобно
          <input
            className="field mt-1"
            value={telegram}
            maxLength={33}
            placeholder="@username"
            autoComplete="off"
            aria-invalid={invalid}
            disabled={state === "busy"}
            onChange={(event) => {
              id.current = undefined;
              setTelegram(event.target.value);
            }}
          />
        </label>
        {invalid && (
          <p className="text-xs text-destructive">
            Укажи имя пользователя Telegram или оставь поле пустым.
          </p>
        )}
        <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            disabled={state === "busy"}
            onChange={(event) => setConsent(event.target.checked)}
          />
          Разрешаю сохранить заявку и контакты для связи по консультации. Email берётся из аккаунта.
        </label>
        <Button
          type="submit"
          variant="outline"
          disabled={!consent || invalid || !requestedStart || invalidDate || state === "busy"}
        >
          {state === "busy" ? "Отправляем…" : "Отправить заявку"}
        </Button>
        {state === "error" && (
          <p role="alert" className="text-xs text-destructive">
            Не удалось отправить заявку. Попробуй ещё раз.
          </p>
        )}
      </form>
    </details>
  );
}
