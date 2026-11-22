import { useState } from "react";
import { Button } from "@/components/ui/button";
import { additionalQuestionnaires } from "@/lib/additional-questionnaires";

type Questionnaire = (typeof additionalQuestionnaires)[number];

const answers = ["Ни разу", "Редко", "Иногда", "Часто"];

export function AdditionalTests() {
  const [selected, setSelected] = useState<Questionnaire["id"] | null>(null);
  const questionnaire = additionalQuestionnaires.find((item) => item.id === selected);

  return (
    <section
      id="additional-tests"
      className="mt-10 scroll-mt-24 border-t border-border pt-8"
      aria-labelledby="additional-tests-heading"
    >
      <h2 id="additional-tests-heading" className="section-title">
        Дополнительные опросники
      </h2>
      {questionnaire ? (
        <ReflectionCheck
          key={questionnaire.id}
          questionnaire={questionnaire}
          onClose={() => setSelected(null)}
        />
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {additionalQuestionnaires.map((item) => (
            <article className="soft-card p-5" key={item.id}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.questions.length} вопроса · около 1 минуты
              </p>
              <Button className="mt-4" variant="soft" onClick={() => setSelected(item.id)}>
                Пройти опросник
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ReflectionCheck({
  questionnaire,
  onClose,
}: {
  questionnaire: Questionnaire;
  onClose: () => void;
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  return (
    <article className="soft-card mt-5 max-w-3xl p-5 md:p-7">
      <Button variant="link" className="px-0" onClick={onClose}>
        К дополнительным опросникам
      </Button>
      <h3 className="mt-2 text-xl font-semibold">{questionnaire.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Вспомни, как часто это происходило за последнюю неделю.
      </p>
      {finished ? (
        <div className="mt-5" aria-live="polite">
          <h4 className="font-semibold">Твои ответы</h4>
          <dl className="mt-3 space-y-3">
            {questionnaire.questions.map((question, index) => (
              <div key={question}>
                <dt className="text-sm text-muted-foreground">{question}</dt>
                <dd className="font-medium">{answers[selectedAnswers[index] ?? 0]}</dd>
              </div>
            ))}
          </dl>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              setSelectedAnswers({});
              setFinished(false);
            }}
          >
            Пройти заново
          </Button>
        </div>
      ) : (
        <form
          className="mt-5 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (Object.keys(selectedAnswers).length === questionnaire.questions.length)
              setFinished(true);
          }}
        >
          {questionnaire.questions.map((question, index) => (
            <fieldset key={question}>
              <legend className="text-sm font-medium">{question}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {answers.map((label, value) => (
                  <label
                    key={label}
                    className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-border p-2 text-sm"
                  >
                    <input
                      type="radio"
                      name={`${questionnaire.id}-${index}`}
                      value={value}
                      checked={selectedAnswers[index] === value}
                      onChange={() =>
                        setSelectedAnswers((previous) => ({ ...previous, [index]: value }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <Button
            type="submit"
            variant="hero"
            disabled={Object.keys(selectedAnswers).length !== questionnaire.questions.length}
          >
            Посмотреть ответы
          </Button>
        </form>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Авторский опросник для самонаблюдения. Ответы хранятся только на этой странице.
      </p>
    </article>
  );
}
