import { useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AuthPanel({
  booking = false,
  bookingSpecialist,
  ownerArea,
}: {
  booking?: boolean;
  bookingSpecialist?: string | undefined;
  ownerArea?: "/booking-desk" | "/feedback-results";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showResend, setShowResend] = useState(false);
  const emailField = useRef<HTMLInputElement>(null);
  const bookingQuery = booking
    ? "?next=consultation" +
      (bookingSpecialist ? `&specialist=${encodeURIComponent(bookingSpecialist)}` : "")
    : "";
  const accountPath = ownerArea ?? `/journal${bookingQuery}`;
  const resetPath = `/reset-password${bookingQuery}`;

  function authError(error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? error.code : null;
    if (code === "email_not_confirmed") {
      setShowResend(true);
      return "Сначала подтверди email по ссылке в письме. Проверь папку «Спам» или запроси письмо снова.";
    }
    if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit")
      return "Слишком много запросов. Подожди немного и попробуй снова.";
    if (code === "signup_disabled" || code === "email_provider_disabled")
      return "Регистрация по email сейчас недоступна.";
    if (code === "email_address_not_authorized")
      return "Сервис регистрации пока не может отправить письмо на этот адрес.";
    if (code === "weak_password")
      return "Пароль не соответствует требованиям. Попробуй более сложный.";
    if (code === "invalid_credentials") return "Проверь email и пароль или восстанови доступ.";
    return "Не удалось выполнить запрос. Проверь данные и попробуй ещё раз.";
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}${resetPath}`,
        });
        if (error) throw error;
        setMessage("Если аккаунт есть, на этот адрес придёт ссылка для смены пароля.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}${accountPath}` },
        });
        if (error) throw error;
        if (!data.session) {
          setShowResend(true);
          setMessage(
            "Если адрес можно зарегистрировать, придёт письмо. Проверь входящие и папку «Спам».",
          );
        } else await router.invalidate();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        await router.invalidate();
      }
    } catch (error) {
      setMessage(authError(error));
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    if (busy || !emailField.current?.reportValidity()) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}${accountPath}` },
      });
      if (error) throw error;
      setMessage(
        "Если адрес ожидает подтверждения, письмо придёт снова. Проверь также папку «Спам».",
      );
    } catch (error) {
      setMessage(authError(error));
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "lovable") {
    setBusy(true);
    setMessage("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}${accountPath}`,
      });
      if (result.error) {
        setMessage("Не удалось войти. Попробуй позже.");
        return;
      }
      if (!result.redirected) await router.invalidate();
    } catch {
      setMessage("Не удалось войти. Попробуй позже.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-md py-8">
      <h2 className="text-xl font-semibold">
        {mode === "signup"
          ? "Создать аккаунт"
          : mode === "reset"
            ? "Восстановить доступ"
            : "Войти в TherapyAI"}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {ownerArea
          ? "Войди в аккаунт владельца Thera."
          : "Аккаунт нужен для личного дневника и подачи заявки на консультацию."}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">
          Электронная почта
          <input
            className="field mt-2"
            type="email"
            ref={emailField}
            autoComplete="email"
            required
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {mode !== "reset" && (
          <label className="block text-sm">
            Пароль
            <input
              className="field mt-2"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
              maxLength={mode === "signup" ? 72 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        <Button variant="hero" disabled={busy} className="w-full">
          {busy
            ? "Подожди…"
            : mode === "signup"
              ? "Создать аккаунт"
              : mode === "reset"
                ? "Отправить ссылку"
                : "Войти"}
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {ownerArea && mode === "reset" ? (
          <Button
            variant="link"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
          >
            Вернуться ко входу
          </Button>
        ) : (
          !ownerArea && (
            <Button
              variant="link"
              onClick={() => {
                setMode(mode === "signup" ? "login" : "signup");
                setMessage("");
              }}
            >
              {mode === "signup" ? "Уже есть аккаунт" : "Регистрация"}
            </Button>
          )
        )}
        <Button
          variant="link"
          onClick={() => {
            setShowResend(false);
            setMode("reset");
            setMessage("");
          }}
        >
          Забыли пароль?
        </Button>
      </div>
      {showResend && mode !== "reset" && (
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          disabled={busy}
          onClick={() => void resend()}
        >
          Повторить письмо для подтверждения
        </Button>
      )}
      <div className="mt-4 grid gap-3">
        <Button
          className="google-signin"
          variant="outline"
          disabled={busy}
          onClick={() => social("google")}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          Продолжить с Google
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => social("lovable")}>
          <LovableMark />
          Продолжить с Lovable
        </Button>
      </div>
      {message && (
        <p role="status" className="mt-5 text-sm text-accent">
          {message}
        </p>
      )}
    </div>
  );
}
