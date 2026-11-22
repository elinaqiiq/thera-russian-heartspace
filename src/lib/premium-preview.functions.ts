import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { registryDatabase } from "./registry.functions";

const inputSchema = z.object({
  tool: z.enum(["plan", "reflection"]),
  focus: z.enum(["pause", "rest", "focus"]),
  minutes: z.union([z.literal(3), z.literal(5), z.literal(10)]),
});
const outputSchema = z.object({ items: z.array(z.string().trim().min(1).max(360)).length(3) });
const focusNames = {
  pause: "пауза и переключение",
  rest: "отдых и восстановление сил",
  focus: "сосредоточенность на одном простом деле",
};

export const checkPremiumPreview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { data, error } = await registryDatabase(context.supabase).rpc(
      "thera_premium_preview_access",
      { consume: false },
    );
    if (error) throw new Error("Не удалось проверить доступ.");
    return data === "allowed";
  });

export const generatePremiumPreview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(inputSchema)
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const key = process.env["LOVABLE_API_KEY"];
    const access = await registryDatabase(context.supabase).rpc("thera_premium_preview_access", {
      consume: Boolean(key),
    });
    if (access.error) return { items: [], error: "Не удалось проверить доступ." };
    if (access.data === "limit")
      return { items: [], error: "На сегодня доступно 5 пробных генераций. Попробуй завтра." };
    if (access.data !== "allowed") return { items: [], error: "Доступ к тесту закрыт." };
    if (!key) return { items: [], error: "ИИ-сервис временно недоступен." };

    try {
      const { createOpenAI } = await import("@ai-sdk/openai");
      const { generateText, Output } = await import("ai");
      const provider = createOpenAI({
        baseURL: "https://ai.gateway.lovable.dev/v1",
        apiKey: key,
        headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      });
      const { output } = await generateText({
        model: provider.responses("openai/gpt-6.1-sol"),
        system:
          "Пиши простым, тёплым русским языком. Предлагай только бытовые, добровольные действия или вопросы для дневника. Избегай диагнозов, клинических рекомендаций и предположений о человеке. Верни ровно три коротких пункта.",
        prompt:
          data.tool === "plan"
            ? `Составь три простых шага самопомощи суммарно на ${data.minutes} минут. Тема — ${focusNames[data.focus]}.`
            : `Предложи три вопроса для личного дневника на ${data.minutes} минут самонаблюдения. Тема — ${focusNames[data.focus]}.`,
        output: Output.object({ schema: outputSchema }),
        maxRetries: 0,
        maxOutputTokens: 750,
        abortSignal: AbortSignal.timeout(20_000),
        providerOptions: { openai: { store: false } },
      });
      return { items: output.items, error: null };
    } catch {
      return { items: [], error: "Не удалось получить ответ. Попробуй позже." };
    }
  });
