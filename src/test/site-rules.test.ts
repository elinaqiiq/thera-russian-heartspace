import { describe, expect, it } from "vitest";
import {
  bookingSubmissionsEnabled,
  formatKzt,
  psychologists,
  THERA_CHAT_URL,
  telegramChatUrl,
  telegramBookingUrl,
  servicePricing,
} from "@/lib/site";
import { formatConsultationSummary } from "@/lib/session-prep";

describe("TherapyAI rules", () => {
  it("uses the supplied agent", () =>
    expect(THERA_CHAT_URL).toBe(
      "https://vdk-viber-runtime-prod.bot.botpress.host/edge/?botId=7ad7759a-ed1b-49d9-83c6-6555daa01224",
    ));
  it("lists the supplied specialist with Telegram booking and the hourly rate", () => {
    expect(bookingSubmissionsEnabled).toBe(true);
    expect(psychologists).toHaveLength(1);
    const [specialist] = psychologists;
    expect(telegramChatUrl(specialist.telegramUsername)).toBe("https://t.me/elina_l_r");
    expect(specialist.phone.number).toBe("+77770125648");
    expect(specialist.durationMinutes).toBe(60);
    expect(specialist.priceKzt).toBe(10000);
  });
  it("puts only the generic booking draft in the Telegram link", () => {
    const url = new URL(telegramBookingUrl("elina_l_r"));
    expect(url.origin + url.pathname).toBe("https://t.me/elina_l_r");
    expect(url.searchParams.get("text")).toBe(
      "Здравствуйте! Хочу записаться на консультацию. Какие есть свободные окна?",
    );
  });
  it("adds the source conversation only when the caller opts in", () => {
    expect(formatConsultationSummary("Сводка")).toBe("Сводка");
    expect(formatConsultationSummary("Сводка", "Диалог")).toBe(
      "Сводка\n\nФрагмент разговора с Thera\nДиалог",
    );
  });
  it("keeps Thera free", () => expect(servicePricing.chatKzt).toBe(0));
  it("charges consultations separately", () =>
    expect(servicePricing.consultationIncluded).toBe(false));
  it("formats prices in tenge", () => expect(formatKzt(15000)).toBe("15 000 ₸"));
});
