import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bookingDecisions } from "./consultations";
import { registryDatabase } from "./registry.functions";

const bookingList = z.array(
  z.object({
    request_id: z.string().uuid(),
    status: z.enum(["pending", "confirmed", "declined", "cancelled", "completed", "no_show"]),
    display_name: z.string().nullable(),
    email: z.string().nullable(),
    telegram_username: z.string().nullable(),
    requested_start: z.string().nullable(),
    created_at: z.string(),
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
    return z.enum(["saved", "slot_taken", "unavailable", "denied", "invalid"]).parse(result.data);
  });
