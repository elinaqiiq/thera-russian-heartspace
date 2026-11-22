import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site-shell";
import { PremiumTests } from "@/components/premium-tests";
import { PsychologicalTests } from "@/components/psychological-tests";
import { pageHead } from "@/lib/site";
export const Route = createFileRoute("/tests")({
  head: () =>
    pageHead(
      "Психологические опросники",
      "Опросники GAD-7, WHO-5 и PHQ-2 в TherapyAI: тревога, самочувствие и настроение. Предварительная оценка без диагнозов.",
    ),
  component: Tests,
});
function Tests() {
  return (
    <>
      <PageIntro eyebrow="Прислушаться к себе" title="Тесты о самочувствии">
        Тревога, настроение и самочувствие — у каждого своё место. Ответь так, как было у тебя, а не
        как «должно быть».
      </PageIntro>
      <section className="container-site pb-16">
        <PsychologicalTests />
        <p className="mt-9 max-w-3xl text-sm leading-7 text-muted-foreground">
          Опросники не ставят диагнозы и не заменяют профессиональную помощь. Ответы не сохраняются
          и не отправляются психологу. При обновлении страницы они исчезнут.
        </p>
        <PremiumTests />
      </section>
    </>
  );
}
