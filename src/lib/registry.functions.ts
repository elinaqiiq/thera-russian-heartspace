import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { psychologists } from "./site";
import type { ConsultationStatus } from "./consultations";
import { notifyOwnerOfBooking } from "./booking-notification.server";

type ConsultationRequest = {
  id: string;
  user_id: string;
  specialist_id: string;
  telegram_username: string | null;
  created_at: string;
  requested_start: string | null;
  status: ConsultationStatus;
};

type ConsultationVisit = Pick<
  ConsultationRequest,
  "id" | "user_id" | "specialist_id" | "created_at"
>;

type RegistryDatabase = {
  public: {
    Tables: {
      thera_psychologist_visits: {
        Row: ConsultationVisit;
        Insert: Omit<ConsultationVisit, "created_at">;
        Update: Partial<ConsultationVisit>;
        Relationships: [];
      };
      thera_consultation_requests: {
        Row: ConsultationRequest;
        Insert: Omit<ConsultationRequest, "created_at" | "status">;
        Update: Partial<ConsultationRequest>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      thera_registry_export: { Args: Record<never, never>; Returns: unknown };
      thera_cancel_consultation: { Args: { request_id: string }; Returns: boolean };
    };
  };
};

export function registryDatabase(client: object) {
  return client as SupabaseClient<RegistryDatabase>;
}

function privateResponse() {
  setResponseHeader("Cache-Control", "private, no-store");
}

export const submitConsultationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      specialistId: z
        .string()
        .max(80)
        .refine((id) => psychologists.some((p) => p.id === id)),
      telegramUsername: z.union([
        z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{3,30}[a-zA-Z0-9]$/),
        z.literal(""),
      ]),
      requestedStart: z
        .string()
        .datetime()
        .refine((date) => Date.parse(date) % 3_600_000 === 0),
      consent: z.literal(true),
    }),
  )
  .handler(async ({ data, context }) => {
    privateResponse();
    const target = registryDatabase(context.supabase).from("thera_consultation_requests");
    if (Date.parse(data.requestedStart) <= Date.now()) {
      throw new Error("Выбери дату и время в будущем.");
    }
    const { error } = await target.insert({
      id: data.id,
      user_id: context.userId,
      specialist_id: data.specialistId,
      telegram_username: data.telegramUsername || null,
      requested_start: data.requestedStart,
    });
    if (error?.code === "23505") {
      const existing = await target
        .select("id")
        .eq("id", data.id)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (existing.data) return { id: data.id };
    }
    if (error) throw new Error("Не удалось сохранить заявку.");
    await notifyOwnerOfBooking(data.id);
    return { id: data.id };
  });

export const listConsultationRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    privateResponse();
    const { data, error } = await registryDatabase(context.supabase)
      .from("thera_consultation_requests")
      .select("id, created_at, requested_start, status")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Не удалось загрузить заявки.");
    return data;
  });

export const cancelConsultationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    privateResponse();
    const result = await registryDatabase(context.supabase).rpc("thera_cancel_consultation", {
      request_id: data.id,
    });
    if (result.error) throw new Error("Не удалось отменить заявку.");
    return { cancelled: result.data === true };
  });

export const recordPsychologistVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      specialistId: z
        .string()
        .max(80)
        .refine((id) => psychologists.some((p) => p.id === id)),
    }),
  )
  .handler(async ({ context, data }) => {
    privateResponse();
    const { error } = await registryDatabase(context.supabase)
      .from("thera_psychologist_visits")
      .insert({
        id: crypto.randomUUID(),
        user_id: context.userId,
        specialist_id: data.specialistId,
      });
    return { recorded: !error };
  });
