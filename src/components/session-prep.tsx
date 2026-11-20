import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { prepareSession } from "@/lib/session-prep.functions";
import {
  formatConsultationSummary,
  SESSION_NOTES_LIMIT,
  THERA_TRANSCRIPT_LIMIT,
} from "@/lib/session-prep";

export function SessionPrep() {
  const run = useServerFn(prepareSession);
  const [source, setSource] = useState<"notes" | "transcript">("notes");
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [includeTranscript, setIncludeTranscript] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const limit = source === "transcript" ? THERA_TRANSCRIPT_LIMIT : SESSION_NOTES_LIMIT;

  function clear() {
    setText("");
    setSummary("");
    setIncludeTranscript(false);
    setEditingSummary(false);
    setError("");
    setStatus("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const result = await run({ data: { source, text } });
      if (result.error) {
        setError(result.error);
        return;
      }
      setSummary(
        [
          result.summary,
          result.questions.length ? "Что обсудить" : "",
          ...result.questions.map((q) => `— ${q}`),
        ]
          .filter(Boolean)
          .join("\n"),
      );
      setEditingSummary(true);
      setIncludeTranscript(false);
      setStatus("Сводка готова. Проверь и поправь её перед отправкой.");
    } catch {
      setError("Не удалось составить сводку. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  const shareText = formatConsultationSummary(summary, includeTranscript ? text : undefined);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus("Скопировано. Теперь текст можно вставить в диалог с психологом.");
    } catch {
      setStatus("Копирование недоступно. Можно скачать текст файлом.");
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([shareText], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "thera-consultation.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section id="session-prep" className="soft-card mt-10 scroll-mt-24 p-6 md:p-8">
      <span className="feature-icon">
        <Sparkles size={22} />
      </span>
      <h2 className="section-title mt-5">Подготовься к встрече с психологом</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        Опиши, что тебя беспокоит, или вставь нужный фрагмент{" "}
        <Link to="/thera" className="underline underline-offset-4">
          разговора с Thera
        </Link>
        . По твоему запросу ИИ составит краткую сводку и предложит темы для консультации.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">
          Источник для сводки
          <select
            className="field mt-2"
            value={source}
            disabled={loading}
            onChange={(event) => {
              setSource(event.target.value === "transcript" ? "transcript" : "notes");
              setIncludeTranscript(false);
            }}
          >
            <option value="notes">Мои заметки</option>
            <option value="transcript">Переписка с Thera</option>
          </select>
        </label>
        <label className="block text-sm">
          {source === "transcript" ? "Фрагмент переписки" : "Что тебя сейчас беспокоит?"}
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setIncludeTranscript(false);
            }}
            maxLength={limit}
            disabled={loading}
            rows={5}
            className="field mt-2 min-h-32 resize-y"
          />
        </label>
        <p className="text-xs leading-6 text-muted-foreground">
          {text.length}/{limit} символов. По кнопке «Составить сводку» этот текст отправится на
          обработку ИИ через Lovable. Перед этим можно убрать личные детали.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="hero"
            type="submit"
            disabled={loading || text.trim().length < 10 || text.length > limit}
          >
            {loading ? "Составляем…" : "Составить сводку"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => setEditingSummary(true)}
          >
            Написать сводку вручную
          </Button>
        </div>
      </form>
      {error && (
        <p role="alert" className="mt-5 text-sm text-destructive">
          {error}
        </p>
      )}
      {editingSummary && (
        <div className="mt-8 space-y-4 border-t border-border pt-6">
          <label className="block text-sm font-medium">
            Сводка для психолога
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              disabled={loading}
              rows={6}
              className="field mt-2 resize-y"
            />
          </label>
          {source === "transcript" && text.trim() && (
            <label className="flex items-start gap-3 text-sm">
              <input
                className="mt-1"
                type="checkbox"
                checked={includeTranscript}
                disabled={loading}
                onChange={(event) => setIncludeTranscript(event.target.checked)}
              />
              Добавить этот фрагмент переписки к тексту, которым я могу поделиться
            </label>
          )}
          <p className="text-xs leading-6 text-muted-foreground">
            Текст остаётся на странице до закрытия или очистки. Если захочешь поделиться им, отправь
            скопированный текст или скачанный файл в личном чате с психологом.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading || !summary.trim()}
              onClick={() => void copy()}
            >
              <Copy size={16} /> Скопировать
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading || !summary.trim()}
              onClick={download}
            >
              <Download size={16} /> Скачать текст
            </Button>
            <Button asChild variant="link">
              <a href="#consultation">К записи на консультацию</a>
            </Button>
          </div>
        </div>
      )}
      {(text || editingSummary) && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="mt-4"
          disabled={loading}
          onClick={clear}
        >
          Очистить текст
        </Button>
      )}
      <p role="status" className="mt-3 text-sm text-muted-foreground">
        {status}
      </p>
    </section>
  );
}
