import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ text: z.string().trim().min(10).max(3000) });

export type SessionPrep = { summary: string; questions: string[]; error?: string };

const INSTRUCTIONS = `Ты бережный помощник, который помогает человеку подготовиться к встрече с психологом.
Не ставь диагнозов, не давай терапевтических советов, пиши на «ты», тепло и просто, на русском.
Ответ строго в формате:
РЕЗЮМЕ:
<2–4 предложения о том, что беспокоит человека>
ВОПРОСЫ:
- <вопрос или тема для обсуждения с психологом>
(4–6 пунктов)
Если в тексте есть признаки угрозы жизни, в начале резюме мягко посоветуй срочно обратиться в экстренные службы (112).`;

function parse(text: string): SessionPrep {
  const [, rest = text] = text.split(/РЕЗЮМЕ:/i);
  const [summary = "", q = ""] = rest.split(/ВОПРОСЫ:/i);
  const questions = q
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*\d.)]+\s*/, "").trim())
    .filter(Boolean);
  return { summary: summary.trim(), questions };
}

export const prepareSession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<SessionPrep> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { summary: "", questions: [], error: "Сервис временно недоступен." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6.1-sol"),
        system: INSTRUCTIONS,
        messages: [{ role: "user", content: data.text }],
        maxRetries: 0,
        providerOptions: {
          openai: {
            store: false,
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const text = await result.text;
      const out = parse(text);
      if (!out.summary) return { summary: "", questions: [], error: "Не удалось составить резюме. Попробуй ещё раз позже." };
      return out;
    } catch (e: unknown) {
      console.error("prepareSession failed", e);
      const status = (e as { statusCode?: number })?.statusCode;
      const msg =
        status === 429
          ? "Слишком много запросов. Попробуй через минуту."
          : status === 402 || status === 403
            ? "Функция временно недоступна."
            : "Не удалось составить резюме. Попробуй ещё раз позже.";
      return { summary: "", questions: [], error: msg };
    }
  });
