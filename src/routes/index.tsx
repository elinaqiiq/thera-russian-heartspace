import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUpRight, Heart, MessageCircle } from "lucide-react";
import { HomeCareGuide } from "@/components/home-care-guide";
import { HomeHeroArtwork } from "@/components/home-hero-artwork";
import { Button } from "@/components/ui/button";
import { bookingSubmissionsEnabled, formatKzt, pageHead, psychologists } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Что тебя сейчас беспокоит?",
      "Бесплатный чат с Thera, практики самопомощи и консультации психолога.",
    ),
  component: Index,
});

function Index() {
  const specialist = psychologists[0];

  return (
    <>
      <section className="container-site home-hero">
        <div className="home-hero-content">
          <p className="eyebrow">Бесплатный чат для эмоциональной поддержки</p>
          <h1 className="hero-title mt-5">Что тебя сейчас беспокоит?</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            Можно начать с того, о чём проще говорить. Thera поможет выговориться и сформулировать,
            что ты чувствуешь.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild variant="hero" size="xl">
              <Link to="/thera">
                <MessageCircle aria-hidden="true" /> Мне нужна поддержка сейчас{" "}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="soft" size="xl">
              <Link to="/psychologists">
                Хочу поговорить с психологом <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <a href="#care-guide" className="home-scroll-link">
            <ArrowDown size={17} aria-hidden="true" /> Что можно попробовать
          </a>
        </div>
        <HomeHeroArtwork />
      </section>

      <HomeCareGuide />

      <section
        className="container-site home-scroll-reveal pb-14 md:pb-20"
        aria-labelledby="consultation-heading"
      >
        <div className="soft-card consultation-callout">
          <div>
            <span className="feature-icon mb-5">
              <Heart size={22} aria-hidden="true" />
            </span>
            <h2 id="consultation-heading" className="section-title">
              Консультация с психологом
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Можно обратиться к психологу напрямую. Если ты уже поговорил с Thera, возьми на
              встречу сводку того, что хочется обсудить.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            {bookingSubmissionsEnabled && specialist && (
              <p className="text-sm text-muted-foreground">
                <strong className="text-base text-foreground">
                  {formatKzt(specialist.priceKzt)}
                </strong>{" "}
                за {specialist.durationMinutes} мин.
              </p>
            )}
            <Button asChild variant="soft" size="lg">
              <Link to="/psychologists">
                О консультации <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Помог ли тебе сайт?{" "}
          <Link
            to="/feedback"
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Оставить обратную связь
          </Link>
        </p>
      </section>
    </>
  );
}
