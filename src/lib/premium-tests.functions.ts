import { createServerFn } from "@tanstack/react-start";
import { getCookie, getSession, setResponseHeader, useSession } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { registryDatabase } from "./registry.functions";
import { premiumQuestionnaires } from "./premium-tests.server";

type PreviewPass = { userId: string; expiresAt: number };
const periodSeconds = 30 * 24 * 60 * 60;
const cookieName = "thera-test-preview";

async function getPreviewConfig(client: object) {
  setResponseHeader("Cache-Control", "private, no-store");
  const { data, error } = await registryDatabase(client).rpc("thera_premium_preview_access", {
    consume: false,
  });
  if (error) throw new Error("Не удалось проверить доступ.");
  if (data !== "allowed") return null;

  const root =
    process.env["THERA_PREVIEW_COOKIE_SECRET"] ??
    process.env["LOVABLE_CRON_SECRET"] ??
    process.env["LOVABLE_API_KEY"];
  if (!root) throw new Error("Тестовый доступ временно недоступен.");

  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`thera-test-preview/v1\0${root}`),
  );
  const password = Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return {
    name: cookieName,
    password,
    maxAge: periodSeconds,
    sessionHeader: false as const,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] !== "development",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function validPass(pass: Partial<PreviewPass>, userId: string) {
  return (
    pass.userId === userId && typeof pass.expiresAt === "number" && pass.expiresAt > Date.now()
  );
}

export const loadPremiumTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const config = await getPreviewConfig(context.supabase);
    if (!config) return null;
    if (getCookie(cookieName)) {
      const { data } = await getSession<PreviewPass>(config);
      if (validPass(data, context.userId))
        return { active: true as const, questionnaires: premiumQuestionnaires };
    }
    return { active: false as const };
  });

export const activatePremiumTestsPreview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const config = await getPreviewConfig(context.supabase);
    if (!config) throw new Error("Тестовый доступ закрыт.");
    const session = await useSession<PreviewPass>(config);
    if (!validPass(session.data, context.userId)) {
      await session.update({
        userId: context.userId,
        expiresAt: Date.now() + periodSeconds * 1000,
      });
    }
    return { ok: true };
  });
