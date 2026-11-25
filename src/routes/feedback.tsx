import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { PageIntro } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/site";
import { FEEDBACK_TEXT_LIMIT, feedbackAnswers, type FeedbackAnswer } from "@/lib/feedback";
import { submitFeedback } from "@/lib/feedback.functions";

export const Route = createFileRoute("/feedback")({
  head: () =>
    pageHead("Обратная связь", "Расскажи, помог ли тебе сайт TherapyAI и что можно улучшить."),
  component: FeedbackPage,
});

function FeedbackPage() {
  const send = useServerFn(submitFeedback);
  const [helped, setHelped] = useState<FeedbackAnswer | "">("");
  const [improve, setImprove] = useState("");
  const [disliked, setDisliked] = useState("");
  const [missing, setMissing] = useState(false);
  const mutation = useMutation({
    mutationFn: (answer: FeedbackAnswer) => send({ data: { helped: answer, improve, disliked } }),
  });

  if (mutation.isSuccess) {
    return (
      <>
        <PageIntro eyebrow="Спасибо" title="Ответ сохранён">
          Спасибо, что помогаешь сделать TherapyAI лучше.
        </PageIntro>
        <section className="container-site pb-20">
          <p role="status" className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={18} aria-hidden="true" /> Твой ответ получен.
          </p>
          <Button
            className="mt-6"
            variant="soft"
            onClick={() => {
              mutation.reset();
              setHelped("");
              setImprove("");
              setDisliked("");
            }}
          >
            Отправить ещё один ответ
          </Button>
        </section>
      </>
    );
  }

  return (
    <>
      <PageIntro eyebrow="Анонимно" title="Обратная связь">
        Регистрация не нужна. Пожалуйста, не пиши в форму имя, контакты и другие личные данные.
      </PageIntro>
      <section className="container-site pb-20">
        <form
          className="soft-card grid max-w-2xl gap-6"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!helped) return setMissing(true);
            mutation.mutate(helped);
          }}
        >
          <fieldset aria-describedby={missing && !helped ? "helped-error" : undefined}>
            <legend className="font-semibold">
              Помог ли вам сайт? <span className="text-accent">*</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {(Object.keys(feedbackAnswers) as FeedbackAnswer[]).map((key) => (
                <label
                  key={key}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-4 has-[:checked]:border-accent has-[:checked]:bg-accent/15"
                >
                  <input
                    type="radio"
                    name="helped"
                    value={key}
                    checked={helped === key}
                    onChange={() => {
                      setHelped(key);
                      setMissing(false);
                    }}
                  />
                  {feedbackAnswers[key]}
                </label>
              ))}
            </div>
            {missing && !helped && (
              <p id="helped-error" role="alert" className="mt-2 text-sm text-destructive">
                Выбери один из вариантов.
              </p>
            )}
          </fieldset>
          <FeedbackText id="improve" label="Что можно улучшить?" value={improve} onChange={setImprove} />
          <FeedbackText id="disliked" label="Что вам не понравилось?" value={disliked} onChange={setDisliked} />
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              Не удалось отправить ответ. Проверь подключение и попробуй ещё раз.
            </p>
          )}
          <div>
            <Button type="submit" variant="hero" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? (
                "Отправляем…"
              ) : mutation.isError ? (
                <>
                  <RotateCcw aria-hidden="true" /> Повторить отправку
                </>
              ) : (
                "Отправить"
              )}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}

function FeedbackText(props: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={props.id} className="font-semibold">
        {props.label} <span className="text-sm font-normal text-muted-foreground">необязательно</span>
      </label>
      <textarea
        id={props.id}
        className="field min-h-28"
        maxLength={FEEDBACK_TEXT_LIMIT}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  );
}
