import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { useAuthState } from "@/components/auth-state";
import { Button } from "@/components/ui/button";
import {
  deletePersonalChat,
  getPersonalChat,
  getPersonalChatStatus,
  getProgressNotes,
  revokeProgressNote,
  sendPersonalMessage,
  shareProgressNote,
  summarizePersonalChat,
} from "@/lib/thera-account.functions";
import type { ChatMessage, ProgressDraft, ProgressNote } from "@/lib/thera-progress";

const date = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeZone: "Asia/Almaty" });

export function TheraAccount({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { user, ready } = useAuthState();
  if (!ready) return null;
  if (!user)
    return (
      <p className="mb-4 text-sm text-muted-foreground">
        <Link to="/journal" className="text-accent underline underline-offset-4">
          Войди в аккаунт
        </Link>{" "}
        для доступа к личному чату и сводкам.
      </p>
    );
  return <AccountChat key={user.id} userId={user.id} onOpenChange={onOpenChange} />;
}

function AccountChat({
  userId,
  onOpenChange,
}: {
  userId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const status = useServerFn(getPersonalChatStatus);
  const history = useServerFn(getPersonalChat);
  const send = useServerFn(sendPersonalMessage);
  const remove = useServerFn(deletePersonalChat);
  const summarize = useServerFn(summarizePersonalChat);
  const fetchNotes = useServerFn(getProgressNotes);
  const share = useServerFn(shareProgressNote);
  const revoke = useServerFn(revokeProgressNote);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [text, setText] = useState("");
  const [items, setItems] = useState<ChatMessage[]>([]);
  const [cursor, setCursor] = useState<string>();
  const [draft, setDraft] = useState<(ProgressDraft & { id: string }) | null>(null);
  const [consent, setConsent] = useState(false);
  const [clinician, setClinician] = useState("");
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [clinicians, setClinicians] = useState<{ id: string; label: string }[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [patient, setPatient] = useState("");
  const patients = [
    ...new Set(notes.filter(({ user_id }) => user_id !== userId).map(({ user_id }) => user_id)),
  ];
  const visibleNotes = patient ? notes.filter(({ user_id }) => user_id === patient) : notes;

  useEffect(() => {
    let mounted = true;
    status()
      .then(({ enabled }) => {
        if (mounted) setEnabled(enabled);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [status]);

  useEffect(() => {
    onOpenChange(active);
    return () => onOpenChange(false);
  }, [active, onOpenChange]);

  async function perform(action: () => Promise<void>, error: string) {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch {
      setMessage(error);
    } finally {
      setBusy(false);
    }
  }

  function merge(incoming: ChatMessage[]) {
    setItems((previous) =>
      [...new Map([...previous, ...incoming].map((item) => [item.id, item])).values()].sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
      ),
    );
  }

  async function open() {
    const page = await history({ data: {} });
    setItems([]);
    merge(page.items);
    setCursor(page.cursor);
    setActive(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await perform(async () => {
      await send({ data: { text } });
      setText("");
      const page = await history({ data: {} });
      merge(page.items);
      setMessage("Сообщение отправлено. Если ответ ещё не появился, нажми «Обновить».");
    }, "Не удалось завершить отправку. Обнови чат перед повторной попыткой.");
  }

  async function loadNotes() {
    const result = await fetchNotes();
    setNotes(result.notes);
    setClinicians(result.clinicians);
    setShowNotes(true);
  }

  return (
    <section className="soft-card mb-5 space-y-4 p-5 md:p-6" aria-labelledby="personal-chat-title">
      <h2 id="personal-chat-title" className="text-lg font-bold">
        Личный чат и сводки
      </h2>
      {enabled ? (
        <p className="text-sm leading-6 text-muted-foreground">
          История личного чата хранится в Botpress и открывается на устройствах с этим аккаунтом.
          Психологу можно предоставить доступ к отдельной сводке.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          История между устройствами появится после подключения личного чата.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {enabled && !active && (
          <Button
            type="button"
            variant="hero"
            disabled={busy}
            onClick={() => void perform(open, "Не удалось открыть личный чат.")}
          >
            Открыть личный чат
          </Button>
        )}
        <Button
          type="button"
          variant="soft"
          disabled={busy}
          onClick={() => void perform(loadNotes, "Не удалось открыть сводки.")}
        >
          Сводки и доступ
        </Button>
      </div>
      {active && (
        <div className="space-y-4 border-y border-border py-4">
          <div className="flex flex-wrap gap-2">
            {cursor && (
              <Button
                type="button"
                disabled={busy}
                variant="outline"
                onClick={() =>
                  void perform(async () => {
                    const page = await history({ data: { cursor } });
                    merge(page.items);
                    setCursor(page.cursor);
                  }, "Не удалось загрузить предыдущие сообщения.")
                }
              >
                Предыдущие сообщения
              </Button>
            )}
            <Button
              type="button"
              disabled={busy}
              variant="outline"
              onClick={() =>
                void perform(async () => {
                  merge((await history({ data: {} })).items);
                }, "Не удалось обновить чат.")
              }
            >
              Обновить
            </Button>
          </div>
          {items.length ? (
            <ol className="max-h-96 space-y-3 overflow-y-auto" aria-label="История личного чата">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.own
                      ? "ml-auto w-fit max-w-[90%] rounded-xl bg-secondary p-3"
                      : "w-fit max-w-[90%] rounded-xl bg-muted p-3"
                  }
                >
                  <p className="text-xs text-muted-foreground">
                    {item.own ? "Ты" : "Thera"} · {date.format(new Date(item.createdAt))}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm">{item.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Здесь появится твоя переписка.</p>
          )}
          <form onSubmit={submit} className="space-y-2">
            <label className="block text-sm">
              Сообщение
              <textarea
                className="field mt-1"
                rows={3}
                maxLength={3000}
                disabled={busy}
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            </label>
            <Button type="submit" variant="hero" disabled={busy || !text.trim()}>
              Отправить
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            По кнопке ниже недавние сообщения будут обработаны ИИ через Lovable.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="soft"
              disabled={busy || !items.some((item) => item.own)}
              onClick={() =>
                void perform(async () => {
                  const result = await summarize();
                  setDraft(result ? { ...result, id: crypto.randomUUID() } : null);
                  setConsent(false);
                  if (!result) setMessage("В переписке пока мало данных.");
                  else await loadNotes();
                }, "Не удалось составить сводку.")
              }
            >
              Составить сводку динамики
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                if (
                  !window.confirm(
                    "Удалить переписку из личного чата? Доступ к ранее переданным сводкам можно закрыть отдельно.",
                  )
                )
                  return;
                void perform(async () => {
                  await remove();
                  setActive(false);
                  setItems([]);
                  setDraft(null);
                  setText("");
                  setCursor(undefined);
                  setConsent(false);
                  setMessage("История удалена.");
                }, "Не удалось удалить историю.");
              }}
            >
              Удалить историю
            </Button>
          </div>
        </div>
      )}
      {draft && (
        <div className="space-y-3">
          <h3 className="font-bold">
            Черновик сводки · {date.format(new Date(draft.period_start))} –{" "}
            {date.format(new Date(draft.period_end))}
          </h3>
          <label className="block text-sm">
            Проверь и отредактируй текст
            <textarea
              className="field mt-1"
              rows={6}
              maxLength={5000}
              disabled={busy}
              value={draft.summary}
              onChange={(event) => {
                setDraft({ ...draft, summary: event.target.value });
                setConsent(false);
              }}
            />
          </label>
          {clinicians.length > 0 ? (
            <>
              <label className="block text-sm">
                Психолог
                <select
                  className="field mt-1"
                  value={clinician}
                  disabled={busy}
                  onChange={(event) => {
                    setClinician(event.target.value);
                    setConsent(false);
                  }}
                >
                  <option value="">Выбери психолога</option>
                  {clinicians
                    .filter(({ id }) => id !== userId)
                    .map(({ id, label }) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                </select>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input
                  className="mt-1"
                  type="checkbox"
                  disabled={busy}
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                Даю выбранному психологу доступ к этой сводке.
              </label>
              <Button
                type="button"
                variant="hero"
                disabled={busy || !consent || !draft.summary.trim() || !clinician}
                onClick={() =>
                  void perform(async () => {
                    await share({ data: { ...draft, clinician_id: clinician, consent: true } });
                    setDraft(null);
                    setConsent(false);
                    setMessage("Психолог получил доступ к сводке.");
                    await loadNotes();
                  }, "Не удалось завершить действие. Проверь список сводок.")
                }
              >
                Предоставить доступ
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Аккаунт психолога для просмотра сводок ещё не подключён.
            </p>
          )}
        </div>
      )}
      {showNotes && (
        <div className="space-y-3">
          <h3 className="font-bold">Доступные сводки</h3>
          {patients.length > 0 && (
            <label className="block text-sm">
              Сводки клиента
              <select
                className="field mt-1"
                value={patient}
                onChange={(event) => setPatient(event.target.value)}
              >
                <option value="">Все доступные сводки</option>
                {patients.map((id) => (
                  <option key={id} value={id}>
                    Клиент {id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {visibleNotes.length ? (
            visibleNotes.map((note) => (
              <article className="rounded-xl border border-border p-4" key={note.id}>
                <p className="mb-2 text-xs text-muted-foreground">
                  {date.format(new Date(note.period_start))} –{" "}
                  {date.format(new Date(note.period_end))}
                  {" · "}
                  {note.user_id === userId
                    ? (clinicians.find(({ id }) => id === note.clinician_id)?.label ?? "Психолог")
                    : `Клиент ${note.user_id.slice(0, 8)}`}
                </p>
                <p className="whitespace-pre-wrap break-words text-sm">{note.summary}</p>
                {note.user_id === userId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    disabled={busy}
                    onClick={() => {
                      if (!window.confirm("Закрыть психологу доступ к этой сводке?")) return;
                      void perform(async () => {
                        await revoke({ data: { id: note.id } });
                        setNotes((current) => current.filter(({ id }) => id !== note.id));
                        setMessage("Доступ закрыт.");
                      }, "Не удалось закрыть доступ.");
                    }}
                  >
                    Закрыть доступ
                  </Button>
                )}
              </article>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Сводок с предоставленным доступом пока нет.
            </p>
          )}
        </div>
      )}
      <p role="status" className="text-sm text-muted-foreground">
        {busy ? "Подожди…" : message}
      </p>
    </section>
  );
}
