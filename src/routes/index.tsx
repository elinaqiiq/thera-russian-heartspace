import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  Heart,
  MessageCircle,
  Wind,
} from "lucide-react";
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

const tools = [
  {
    to: "/practices",
    icon: Wind,
    title: "Дыхательные практики",
    description: "Сделай паузу и попробуй дыхание по таймеру.",
  },
  {
    to: "/journal",
    icon: BookOpen,
    title: "Дневник эмоций",
    description: "Запиши, что чувствуешь, и возвращайся к своим заметкам.",
  },
  {
    to: "/tests",
    icon: ClipboardList,
    title: "Опросники",
    description: "Оцени тревогу, настроение и самочувствие.",
  },
] as const;

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
                <MessageCircle aria-hidden="true" /> Поговорить с Thera{" "}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="soft" size="xl">
              <Link to="/psychologists">
                К психологу <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="home-hero-visual">
          <img src="/thera-cat.webp" width={1672} height={941} alt="" fetchPriority="high" />
        </div>
      </section>

      <section
        className="container-site pb-14 pt-12 md:pb-20 md:pt-16"
        aria-labelledby="tools-heading"
      >
        <h2 id="tools-heading" className="section-title mb-6">
          Поддержка в своём темпе
        </h2>
        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {tools.map(({ to, icon: Icon, title, description }) => (
            <Link key={to} to={to} className="home-tool">
              <span className="feature-icon">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {description}
                </span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-accent" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="container-site pb-14 md:pb-20" aria-labelledby="consultation-heading">
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
      </section>
    </>
  );
}
