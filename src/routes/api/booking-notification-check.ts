import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "node:crypto";

const keyHash = Buffer.from(
  "ed31a651a7940698ed6d6b1b01c072b52cbabe95da0ab451b9f0ea6646c70d01",
  "hex",
);

export const Route = createFileRoute("/api/booking-notification-check")({
  server: { handlers: { POST: ({ request }) => checkNotification(request) } },
});

async function checkNotification(request: Request): Promise<Response> {
  const headers = { "Cache-Control": "private, no-store" };
  const auth = request.headers.get("authorization") ?? "";
  if (!timingSafeEqual(createHash("sha256").update(auth).digest(), keyHash)) {
    return new Response(null, { headers, status: 404 });
  }
  const rawToken = process.env["THERA_TELEGRAM_BOT_TOKEN"];
  const rawChatId = process.env["THERA_TELEGRAM_OWNER_CHAT_ID"];
  const token = rawToken?.trim();
  const chatId = rawChatId?.trim();
  if (!token || !chatId)
    return Response.json({ tokenSet: Boolean(token), chatSet: Boolean(chatId) }, { headers });
  if (!/^\d+:[A-Za-z0-9_-]+$/.test(token) || !/^[1-9]\d*$/.test(chatId)) {
    return Response.json(
      { tokenFormat: /^\d+:[A-Za-z0-9_-]+$/.test(token), chatIdFormat: /^[1-9]\d*$/.test(chatId) },
      { headers },
    );
  }
  if (token.split(":")[0] === chatId) return Response.json({ chatIdIsBotId: true }, { headers });

  try {
    const check = async (endpoint: string, body?: object) =>
      fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      });
    const bot = await check("getMe");
    if (!bot.ok) return Response.json({ botStatus: bot.status }, { headers });
    const chat = await check("getChat", { chat_id: chatId });
    return Response.json(
      {
        botStatus: bot.status,
        chatStatus: chat.status,
        whitespace: rawToken !== token || rawChatId !== chatId,
      },
      { headers },
    );
  } catch {
    return Response.json({ telegramCallFailed: true }, { headers });
  }
}
