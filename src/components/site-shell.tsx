import { Link } from "@tanstack/react-router";
import { BookOpen, Menu, X, Sparkles } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { navItems } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            menuButton.current?.focus();
          }
        }}
      >
        <div className="container-site flex h-18 items-center justify-between gap-3 lg:gap-5">
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
          <Button asChild variant="soft" className="ml-auto hidden h-11 lg:inline-flex">
            <Link to="/journal">
              <BookOpen aria-hidden="true" /> Дневник
            </Link>
          </Button>
          <Button
            ref={menuButton}
            className="size-11 lg:hidden"
            variant="ghost"
            size="icon"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
        <nav
          id="mobile-navigation"
          className={open ? "container-site mobile-navigation grid gap-1 pb-4 lg:hidden" : "hidden"}
          aria-label="Мобильное меню"
        >
          {[...navItems, { to: "/journal", label: "Дневник" } as const].map((item) => (
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
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="border-t border-border/70 py-9">
        <div className="container-site flex flex-col gap-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <Link to="/" className="brand text-base">
            Therapy<span className="text-accent">AI</span>
          </Link>
          <Link to="/how-it-works" className="hover:text-foreground">
            Как это работает
          </Link>
          <Link to="/support" className="hover:text-foreground">
            Поддержка и безопасность
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
