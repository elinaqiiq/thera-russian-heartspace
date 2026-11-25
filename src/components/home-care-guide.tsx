import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ClipboardList, MessageCircle, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const options = [
  {
    id: "breathing",
    to: "/practices",
    icon: Wind,
    label: "Сделать паузу",
    title: "Дыхательные практики",
    description: "Выбери ритм и следуй за таймером. Можно начать с одной минуты.",
    action: "Открыть практики",
  },
  {
    id: "chat",
    to: "/thera",
    icon: MessageCircle,
    label: "Выговориться",
    title: "Бесплатный чат с Thera",
    description: "Напиши ИИ-собеседнику о том, что тебя волнует. Можно начать с одной фразы.",
    action: "Открыть чат",
  },
  {
    id: "journal",
    to: "/journal",
    icon: BookOpen,
    label: "Записать мысли",
    title: "Дневник эмоций",
    description: "Запиши, что чувствуешь. В личном профиле можно вернуться к своим заметкам.",
    action: "Открыть дневник",
  },
  {
    id: "questionnaires",
    to: "/tests",
    icon: ClipboardList,
    label: "Оценить самочувствие",
    title: "Психологические опросники",
    description: "Ответь на несколько вопросов о настроении, тревоге или общем самочувствии.",
    action: "Открыть опросники",
  },
] as const;

export function HomeCareGuide() {
  return (
    <section
      id="care-guide"
      className="container-site home-care-guide home-scroll-reveal"
      aria-labelledby="tools-heading"
    >
      <div className="home-care-intro">
        <h2 id="tools-heading" className="section-title">
          Поддержка в своём темпе
        </h2>
        <p>Выбери, с чего хочется начать сегодня.</p>
      </div>
      <Tabs defaultValue="breathing">
        <TabsList className="home-care-options" aria-label="Выбери первый шаг">
          {options.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="home-care-option">
              <span className="home-care-option-icon">
                <Icon size={21} aria-hidden="true" />
              </span>
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {options.map(({ id, icon: Icon, title, description, action, to }) => (
          <TabsContent key={id} value={id} className="home-care-panel" data-care-option={id}>
            <div className="home-care-detail">
              <h3>{title}</h3>
              <p>{description}</p>
              <Button asChild variant="soft" size="lg">
                <Link to={to}>
                  {action} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="home-care-art" aria-hidden="true">
              <span className="home-care-orbit" />
              <span className="home-care-orbit" />
              <span className="home-care-orbit" />
              <span className="home-care-symbol">
                <Icon strokeWidth={1.45} />
              </span>
              <span className="home-care-sparkle" />
              <span className="home-care-sparkle" />
              <span className="home-care-sparkle" />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
