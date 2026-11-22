import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { LogOut, Trash2, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, saveProfile } from "@/lib/journal.functions";
import { profileSchema } from "@/lib/wellbeing";

export function AccountProfile({ user }: { user: User }) {
  const loadProfile = useServerFn(getProfile);
  const profile = useQuery({ queryKey: ["profile", user.id], queryFn: () => loadProfile() });
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  async function signOut() {
    setSigningOut(true);
    setSignOutError(false);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <section className="soft-card p-5 md:p-7" aria-labelledby="profile-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="profile-heading" className="text-xl font-semibold">
            Мой профиль
          </h2>
          {user.email && (
            <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={signingOut}
          onClick={() => void signOut()}
        >
          <LogOut aria-hidden="true" /> {signingOut ? "Выходим…" : "Выйти"}
        </Button>
      </div>
      {signOutError && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          Не удалось выйти из аккаунта. Попробуй ещё раз.
        </p>
      )}
      {profile.isPending && (
        <p role="status" className="mt-4 text-sm">
          Загружаем профиль…
        </p>
      )}
      {profile.isError && (
        <p className="mt-4 text-sm">
          Не удалось загрузить профиль.{" "}
          <button type="button" className="underline" onClick={() => void profile.refetch()}>
            Повторить
          </button>
        </p>
      )}
      {profile.isSuccess && (
        <ProfileForm
          userId={user.id}
          initialName={profile.data?.display_name ?? ""}
          initialPhoto={profile.data?.avatar_data ?? null}
        />
      )}
      <nav className="mt-5 flex flex-wrap gap-3" aria-label="Разделы личного кабинета">
        <Button asChild variant="soft">
          <a href="#journal-entries">Дневник эмоций</a>
        </Button>
        <Button asChild variant="outline">
          <a href="#my-consultations">Мои заявки</a>
        </Button>
      </nav>
    </section>
  );
}

function ProfileForm({
  userId,
  initialName,
  initialPhoto,
}: {
  userId: string;
  initialName: string;
  initialPhoto: string | null;
}) {
  const queryClient = useQueryClient();
  const updateProfile = useServerFn(saveProfile);
  const [name, setName] = useState(initialName);
  const [photo, setPhoto] = useState(initialPhoto);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await updateProfile({
        data: profileSchema.parse({ display_name: name.trim(), avatar_data: photo }),
      });
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      setNotice("Профиль сохранён.");
    } catch {
      setNotice("Не удалось сохранить профиль. Попробуй ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 500000) {
      setNotice("Выбери JPG, PNG или WebP до 500 КБ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhoto(reader.result);
    };
    reader.onerror = () => setNotice("Не удалось открыть фото.");
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={save} className="mt-5 border-y border-border py-5">
      <div className="flex flex-wrap items-end gap-4">
        {photo ? (
          <img alt="Фото профиля" src={photo} className="size-14 rounded-full object-cover" />
        ) : (
          <span className="feature-icon" aria-hidden="true">
            <UserRound />
          </span>
        )}
        <label className="min-w-40 flex-1 text-sm">
          Твоё имя
          <input
            className="field mt-2"
            value={name}
            maxLength={100}
            autoComplete="name"
            disabled={busy}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-accent focus-within:ring-2 focus-within:ring-ring">
          <Upload size={16} aria-hidden="true" /> Загрузить фото
          <input
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => upload(event.target.files?.[0])}
          />
        </label>
        {photo && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Убрать фото"
            disabled={busy}
            onClick={() => setPhoto(null)}
          >
            <Trash2 />
          </Button>
        )}
        <Button type="submit" variant="outline" disabled={busy}>
          {busy ? "Сохраняем…" : "Сохранить профиль"}
        </Button>
      </div>
      {notice && (
        <p role="status" className="mt-3 text-sm">
          {notice}
        </p>
      )}
    </form>
  );
}
