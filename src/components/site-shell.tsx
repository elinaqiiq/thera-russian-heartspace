import { Link } from "@tanstack/react-router";
import { Menu, X, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { navItems } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="site-header">
        <div className="container-site flex h-18 items-center justify-between gap-6">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-icon">
              <Sparkles size={20} />
            </span>
            Therapy<span className="text-accent">AI</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Основное меню">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="nav-link"
                activeProps={{ className: "nav-link-active" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <span className="status-dot" /> Пространство для тебя
          </span>
          <Button
            className="lg:hidden"
            variant="ghost"
            size="icon"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
        {open && (
          <nav className="container-site grid gap-1 pb-5 lg:hidden" aria-label="Мобильное меню">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="mobile-link"
                activeProps={{ className: "nav-link-active" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-border/70 py-9">
        <div className="container-site flex flex-col gap-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <Link to="/" className="brand text-base">
            Therapy<span className="text-accent">AI</span>
          </Link>
          <p>Бережная поддержка. В твоём темпе.</p>
          <Link to="/support" className="hover:text-foreground">
            Поддержка и безопасность ↗
          </Link>
        </div>
      </footer>
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="container-site pb-10 pt-14 md:pb-14 md:pt-20">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title mt-4">{title}</h1>
      <div className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{children}</div>
    </section>
  );
}
