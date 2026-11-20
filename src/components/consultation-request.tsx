import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState, type FormEvent } from "react";
import { useAuthState } from "@/components/auth-state";
import { Button } from "@/components/ui/button";
import { submitConsultationRequest } from "@/lib/registry.functions";

export function ConsultationRequest({ specialistId }: { specialistId: string }) {
  const { ready, user } = useAuthState();
  if (!ready) return null;
  if (!user)
    return (
      <p className="text-sm text-muted-foreground">
        <Link to="/journal" className="underline">
          Войди или зарегистрируйся
        </Link>{" "}
        для отправки заявки с сайта.
      </p>
    );
  return <RequestForm key={user.id} specialistId={specialistId} />;
}

function RequestForm({ specialistId }: { specialistId: string }) {
  const submit = useServerFn(submitConsultationRequest);
  const id = useRef<string>(undefined);
  const [telegram, setTelegram] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const username = telegram.trim().replace(/^@/, "");
  const invalid = Boolean(username) && !/^[a-zA-Z][a-zA-Z0-9_]{3,30}[a-zA-Z0-9]$/.test(username);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || invalid || state === "busy" || state === "sent") return;
    id.current ??= crypto.randomUUID();
    setState("busy");
    try {
      await submit({
        data: { id: id.current, specialistId, telegramUsername: username, consent: true },
      });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent")
    return (
      <p role="status" className="text-sm text-accent">
        Заявка сохранена. Дату и время консультации можно уточнить в Telegram.
      </p>
    );

  return (
    <details className="border-t border-border pt-3">
      <summary className="cursor-pointer text-sm font-semibold">Оставить заявку на сайте</summary>
      <form className="mt-3 space-y-3" onSubmit={send}>
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
            onChange={(event) => setTelegram(event.target.value)}
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
        <Button type="submit" variant="outline" disabled={!consent || invalid || state === "busy"}>
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
