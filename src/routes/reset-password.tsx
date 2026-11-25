import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthState } from "@/components/auth-state";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/site-shell";
import { findPsychologist, pageHead } from "@/lib/site";

export const Route = createFileRoute("/reset-password")({
  head: () => pageHead("Новый пароль", "Восстановление доступа к аккаунту TherapyAI."),
  validateSearch: (search): { next?: "consultation"; specialist?: string } => {
    if (search["next"] !== "consultation") return {};
    const specialist = findPsychologist(search["specialist"]);
    return specialist
      ? { next: "consultation", specialist: specialist.id }
      : { next: "consultation" };
  },
  component: ResetPassword,
});

function ResetPassword() {
  const { ready, user, recoveryUserId } = useAuthState();
  const { next, specialist } = Route.useSearch();
  const booking = next === "consultation";
  const bookingSearch = specialist ? { specialist } : { rebook: true as const };
  const bookingHash = specialist ? `booking-${specialist}` : "consultation";
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "error" | "saved">("idle");
  const canReset = Boolean(user && user.id === recoveryUserId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canReset || state === "busy") return;
    setState("busy");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setState("saved");
      setPassword("");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <PageIntro eyebrow="Твой аккаунт" title="Новый пароль">
        Восстановление доступа к аккаунту TherapyAI.
      </PageIntro>
      <section className="container-site pb-20">
        {state === "saved" ? (
          <>
            <p role="status" className="mb-4">
              Пароль обновлён.
            </p>
            <Button asChild variant="hero">
              {booking ? (
                <Link to="/psychologists" hash={bookingHash} search={bookingSearch}>
                  Вернуться к записи
                </Link>
              ) : (
                <Link to="/journal" search={{}}>
                  Открыть дневник
                </Link>
              )}
            </Button>
          </>
        ) : canReset ? (
          <form onSubmit={submit} className="max-w-md space-y-4">
            <label className="block">
              Новый пароль
              <input
                className="field mt-2"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <Button variant="hero" disabled={state === "busy"}>
              Сохранить пароль
            </Button>
            {state === "error" && (
              <p role="alert">
                Не удалось сохранить пароль. Попробуй другой пароль или запроси новую ссылку.
              </p>
            )}
          </form>
        ) : ready ? (
          <p>
            Открой ссылку восстановления из письма. Если она устарела, вернись{" "}
            <Link
              to="/journal"
              search={
                booking ? { next: "consultation", ...(specialist ? { specialist } : {}) } : {}
              }
              className="underline"
            >
              на страницу входа
            </Link>{" "}
            и запроси новую.
          </p>
        ) : (
          <p role="status">Проверяем ссылку…</p>
        )}
      </section>
    </>
  );
}
