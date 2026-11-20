import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { accountChat, botpressConfigured } from "./botpress.server";
import { generateProgressSummary } from "./thera-progress.server";
import type { ProgressNote } from "./thera-progress";

type Clinician = { id: string; label: string };
type NotesDatabase = {
  public: {
    Tables: {
      thera_clinicians: {
        Row: Clinician;
        Insert: Clinician;
        Update: Partial<Clinician>;
        Relationships: [];
      };
      thera_progress_notes: {
        Row: ProgressNote;
        Insert: ProgressNote;
        Update: Partial<ProgressNote>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
  };
};

const authenticated = [requireSupabaseAuth] as const;

function noCache() {
  setResponseHeader("Cache-Control", "private, no-store");
}

function db(supabase: object) {
  return supabase as SupabaseClient<NotesDatabase>;
}

export const getPersonalChatStatus = createServerFn({ method: "GET" })
  .middleware([...authenticated])
  .handler(async () => {
    noCache();
    return { enabled: botpressConfigured() };
  });

export const getPersonalChat = createServerFn({ method: "POST" })
  .middleware([...authenticated])
  .inputValidator(z.object({ cursor: z.string().max(2048).optional() }))
  .handler(async ({ data, context }) => {
    noCache();
    try {
      return await (await accountChat(context.userId)).messages(data.cursor);
    } catch {
      throw new Error("Не удалось загрузить историю личного чата.");
    }
  });

export const sendPersonalMessage = createServerFn({ method: "POST" })
  .middleware([...authenticated])
  .inputValidator(z.object({ text: z.string().trim().min(1).max(3000) }))
  .handler(async ({ data, context }) => {
    noCache();
    try {
      await (await accountChat(context.userId)).send(data.text);
    } catch {
      throw new Error("Не удалось отправить сообщение.");
    }
    return { sent: true as const };
  });

export const deletePersonalChat = createServerFn({ method: "POST" })
  .middleware([...authenticated])
  .handler(async ({ context }) => {
    noCache();
    try {
      await (await accountChat(context.userId)).remove();
    } catch {
      throw new Error("Не удалось удалить историю.");
    }
    return { removed: true as const };
  });

export const summarizePersonalChat = createServerFn({ method: "POST" })
  .middleware([...authenticated])
  .handler(async ({ context }) => {
    noCache();
    try {
      const chat = await accountChat(context.userId);
      let page = await chat.messages();
      const items = [...page.items];
      for (let i = 0; i < 3 && page.cursor && items.length < 80; i++) {
        page = await chat.messages(page.cursor);
        items.push(...page.items);
      }
      return await generateProgressSummary(items);
    } catch {
      throw new Error("Не удалось составить сводку.");
    }
  });

export const getProgressNotes = createServerFn({ method: "GET" })
  .middleware([...authenticated])
  .handler(async ({ context }) => {
    noCache();
    const client = db(context.supabase);
    const [notes, clinicians] = await Promise.all([
      client
        .from("thera_progress_notes")
        .select("*")
        .order("shared_at", { ascending: false })
        .limit(100),
      client.from("thera_clinicians").select("id,label").order("label"),
    ]);
    if (notes.error || clinicians.error) throw new Error("Не удалось загрузить сводки.");
    return { notes: notes.data, clinicians: clinicians.data };
  });

export const shareProgressNote = createServerFn({ method: "POST" })
  .middleware([...authenticated])
  .inputValidator(
    z
      .object({
        id: z.string().uuid(),
        clinician_id: z.string().uuid(),
        summary: z.string().trim().min(1).max(5000),
        period_start: z.string().datetime(),
        period_end: z.string().datetime(),
        consent: z.literal(true),
      })
      .refine((data) => data.period_start <= data.period_end),
  )
  .handler(async ({ context, data: { consent: _consent, ...note } }) => {
    noCache();
    const { error } = await db(context.supabase)
      .from("thera_progress_notes")
      .upsert(
        {
          ...note,
          user_id: context.userId,
          shared_at: new Date().toISOString(),
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (error) throw new Error("Не удалось предоставить доступ.");
    return { shared: true as const };
  });

export const revokeProgressNote = createServerFn({ method: "POST" })
  .middleware([...authenticated])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    noCache();
    const { error } = await db(context.supabase)
      .from("thera_progress_notes")
      .delete()
      .eq("user_id", context.userId)
      .eq("id", data.id);
    if (error) throw new Error("Не удалось закрыть доступ.");
    return { revoked: true as const };
  });
