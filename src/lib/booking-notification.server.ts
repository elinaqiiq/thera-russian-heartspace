const lovableEditor = "https://lovable.dev/projects/42a402b5-b406-5326-b9c4-f2a27161d47e";

export async function notifyOwnerOfBooking(requestId: string): Promise<void> {
  const token = process.env["THERA_TELEGRAM_BOT_TOKEN"];
  const chatId = process.env["THERA_TELEGRAM_OWNER_CHAT_ID"];
  if (!token && !chatId) return;

  if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token) || !chatId || !/^[1-9]\d*$/.test(chatId)) {
    console.warn("Thera booking notification configuration is incomplete or invalid.");
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Новая заявка Thera\nНомер: ${requestId}\nОткрой Cloud → Database → thera_consultation_requests.\n${lovableEditor}`,
        link_preview_options: { is_disabled: true },
      }),
      redirect: "error",
      signal: AbortSignal.timeout(2500),
    });
    if (response.ok) return;
  } catch {
    // Never log the token-bearing URL or the request details.
  }

  console.warn("Thera could not deliver a booking notification.");
}
