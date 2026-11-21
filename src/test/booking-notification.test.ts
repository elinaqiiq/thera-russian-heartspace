import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyOwnerOfBooking } from "@/lib/booking-notification.server";

const requestId = "b51dede6-aed2-4364-844e-541f9b823aa7";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("owner booking notification", () => {
  it("stays disabled until the bot and private chat are configured", async () => {
    vi.stubEnv("THERA_TELEGRAM_BOT_TOKEN", undefined);
    vi.stubEnv("THERA_TELEGRAM_OWNER_CHAT_ID", undefined);
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    await notifyOwnerOfBooking(requestId);
    expect(send).not.toHaveBeenCalled();
  });

  it("sends only the request identifier and the owner editor link", async () => {
    vi.stubEnv("THERA_TELEGRAM_BOT_TOKEN", "12345:fake-token");
    vi.stubEnv("THERA_TELEGRAM_OWNER_CHAT_ID", "67890");
    const send = vi.fn<typeof fetch>().mockResolvedValue(new Response(null));
    vi.stubGlobal("fetch", send);
    await notifyOwnerOfBooking(requestId);
    expect(send).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(send.mock.calls[0]?.[1]?.body));
    expect(payload).toEqual({
      chat_id: "67890",
      text:
        `Новая заявка Thera\nНомер: ${requestId}\nОткрой Cloud → Database → thera_consultation_requests.\n` +
        "https://lovable.dev/projects/42a402b5-b406-5326-b9c4-f2a27161d47e",
      link_preview_options: { is_disabled: true },
    });
  });

  it("keeps a failed delivery from failing the booking or logging the token", async () => {
    vi.stubEnv("THERA_TELEGRAM_BOT_TOKEN", "12345:fake-token");
    vi.stubEnv("THERA_TELEGRAM_OWNER_CHAT_ID", "67890");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("12345:fake-token")));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(notifyOwnerOfBooking(requestId)).resolves.toBeUndefined();
    expect(warn.mock.calls).toEqual([["Thera could not deliver a booking notification."]]);
  });
});
