import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
const themeKey = "thera-theme";
const systemTheme = "(prefers-color-scheme: dark)";

export const initTheme = `(() => {
  let theme;
  try { theme = localStorage.getItem("${themeKey}"); } catch {}
  document.documentElement.classList.toggle("dark",
    theme === "dark" || (theme !== "light" && matchMedia("${systemTheme}").matches));
})()`;

function savedTheme() {
  try {
    const theme = localStorage.getItem(themeKey);
    return theme === "light" || theme === "dark" ? theme : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const media = window.matchMedia(systemTheme);
    function sync() {
      const next = savedTheme() ?? (media.matches ? "dark" : "light");
      applyTheme(next);
      setTheme(next);
    }
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = nextTheme === "dark" ? "Включить тёмную тему" : "Включить светлую тему";

  return (
    <Button
      type="button"
      variant="soft"
      size="icon"
      className="theme-toggle size-11 shrink-0"
      aria-label={label}
      title={label}
      onClick={() => {
        try {
          localStorage.setItem(themeKey, nextTheme);
        } catch {
          // The theme still applies when browser storage is unavailable.
        }
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
    >
      <Sun className="theme-sun" aria-hidden="true" />
      <Moon className="theme-moon" aria-hidden="true" />
    </Button>
  );
}
