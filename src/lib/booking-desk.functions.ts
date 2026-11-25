import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bookingDecisions } from "./consultations";
import { registryDatabase } from "./registry.functions";

const bookingList = z.array(
  z.object({
    request_id: z.string().uuid(),
    specialist_id: z.string(),
    status: z.enum(["pending", "confirmed", "declined", "cancelled", "completed", "no_show"]),
    display_name: z.string().nullable(),
    email: z.string().nullable(),
    telegram_username: z.string().nullable(),
    requested_start: z.string().nullable(),
    created_at: z.string(),
    meeting_format: z.enum(["online", "phone", "in_person"]).nullable(),
    meeting_instructions: z.string().nullable(),
    reschedule_start: z.string().nullable(),
    reschedule_status: z.enum(["pending", "accepted", "declined"]).nullable(),
  }),
);

export const loadBookingDesk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { data, error } = await registryDatabase(context.supabase).rpc("thera_crm_list");
    if (error) throw new Error("Не удалось загрузить заявки.");
    return bookingList.nullable().parse(data);
  });

const decisionResult = z.enum(["saved", "slot_taken", "unavailable", "denied", "invalid"]);

export const saveBookingDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      format: z.enum(["online", "phone", "in_person"]),
      instructions: z.string().trim().min(1).max(1000),
    }),
  )
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const result = await registryDatabase(context.supabase).rpc("thera_crm_confirm_details", {
      request_id: data.id,
      format: data.format,
      instructions: data.instructions,
    });
    if (result.error) throw new Error("Не удалось сохранить детали.");
    return decisionResult.parse(result.data);
  });

export const decideReschedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      expectedStart: z.string().datetime({ offset: true }),
      approve: z.boolean(),
    }),
  )
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const result = await registryDatabase(context.supabase).rpc("thera_crm_reschedule", {
      request_id: data.id,
      expected_start: data.expectedStart,
      approve: data.approve,
    });
    if (result.error) throw new Error("Не удалось обработать перенос.");
    return decisionResult.parse(result.data);
  });

export const decideBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      decision: z.enum(bookingDecisions),
    }),
  )
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const result = await registryDatabase(context.supabase).rpc("thera_crm_decide", {
      request_id: data.id,
      decision: data.decision,
    });
    if (result.error) throw new Error("Не удалось изменить статус.");
    return decisionResult.parse(result.data);
  });
