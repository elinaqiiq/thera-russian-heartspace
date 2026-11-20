import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  Heart,
  MoonStar,
  NotebookPen,
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
    to: "/thera",
    icon: MessageCircle,
    tone: "lavender",
    title: "Чат с Thera",
    description: "Поговорить с ИИ",
  },
  {
    to: "/psychologists",
    icon: Heart,
    tone: "peach",
    title: "Психолог",
    description: "Запись на консультацию",
  },
  {
    to: "/tests",
    icon: ClipboardList,
    tone: "mint",
    title: "Тесты",
    description: "Тревога и настроение",
  },
  {
    to: "/practices",
    icon: Wind,
    tone: "mint",
    title: "Практики",
    description: "Дыхание по таймеру",
  },
  {
    to: "/journal",
    icon: BookOpen,
    tone: "lavender",
    title: "Дневник",
    description: "Записи об эмоциях",
  },
  {
    to: "/psychologists",
    hash: "session-prep",
    icon: NotebookPen,
    tone: "peach",
    title: "Сводка",
    description: "Подготовка к встрече",
  },
] as const;

function Index() {
  const specialist = psychologists[0];

  return (
    <>
      <nav className="container-site pt-5 sm:pt-7" aria-label="Возможности Thera">
        <p className="mb-3 text-sm font-bold">Возможности Thera</p>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {tools.map(({ to, icon: Icon, title, description, tone, ...target }) => (
            <li key={title} className="min-w-0">
              <Link to={to} {...target} className="home-tool" data-tone={tone}>
                <Icon size={19} className="shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <section className="container-site home-hero" aria-labelledby="hero-heading">
        <div className="home-hero-content">
          <p className="eyebrow">Бесплатный чат для эмоциональной поддержки</p>
          <h1 id="hero-heading" className="hero-title mt-5">
            Что тебя сейчас <span>беспокоит?</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            Можно начать с того, о чём проще говорить. Thera выслушает и поможет подобрать слова для
            того, что ты чувствуешь.
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
          <div className="home-cat-frame">
            <img
              src="/thera-cat.webp"
              width={1672}
              height={941}
              alt="Кот Thera"
              fetchPriority="high"
            />
          </div>
          <span className="home-cat-moon" aria-hidden="true">
            <MoonStar size={24} />
          </span>
          <span className="home-cat-cloud" aria-hidden="true" />
        </div>
      </section>

      <section className="container-site py-12 md:py-16" aria-labelledby="consultation-heading">
        <div className="soft-card consultation-callout home-consultation">
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
