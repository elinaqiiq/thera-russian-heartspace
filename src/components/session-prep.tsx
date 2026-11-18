import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareSession, type SessionPrep as Result } from "@/lib/session-prep.functions";

export function SessionPrep() {
  const run = useServerFn(prepareSession);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setRes(null);
    try {
      setRes(await run({ data: { text } }));
    } catch {
      setRes({ summary: "", questions: [], error: "Не удалось составить резюме. Попробуй ещё раз." });
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!res) return;
    await navigator.clipboard.writeText(
      `Что меня беспокоит:\n${res.summary}\n\nЧто обсудить:\n${res.questions.map((q) => `— ${q}`).join("\n")}`,
    );
    setCopied(true);
  }

  return (
    <section className="soft-card mb-12 p-6 md:p-8">
      <span className="feature-icon"><Sparkles size={22} /></span>
      <h2 className="section-title mt-5">Подготовься к встрече с психологом</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        Опиши своими словами, что тебя беспокоит. Мы составим краткое резюме и вопросы, с которых
        можно начать разговор. Текст не сохраняется и не добавляется в заявку.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">
          Что тебя сейчас беспокоит?
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={3000}
            rows={5}
            placeholder="Например: последнее время плохо сплю, тревожусь из-за работы…"
            className="field mt-2 min-h-32 resize-y"
          />
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="hero" type="submit" disabled={loading || text.trim().length < 10}>
            {loading ? "Составляем…" : "Составить резюме"}
          </Button>
          <span className="text-xs text-muted-foreground">{text.length}/3000</span>
        </div>
      </form>
      {res?.error && <p role="alert" className="mt-5 text-sm text-destructive">{res.error}</p>}
      {res && !res.error && (
        <div className="mt-8 space-y-5 border-t border-border pt-6">
          <div>
            <h3 className="font-semibold">Краткое резюме</h3>
            <p className="mt-2 text-sm leading-7">{res.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold">Что обсудить с психологом</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7">
              {res.questions.map((q) => <li key={q}>{q}</li>)}
            </ul>
          </div>
          <Button variant="outline" onClick={copy}>
            <Copy size={16} /> {copied ? "Скопировано" : "Скопировать"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Это подсказка для разговора, а не диагноз. В экстренной ситуации звони 112.
          </p>
        </div>
      )}
    </section>
  );
}
