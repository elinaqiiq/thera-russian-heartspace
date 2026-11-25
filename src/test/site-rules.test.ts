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
  it("lists both bookable psychologists in the requested order with the same hourly rate", () => {
    expect(bookingSubmissionsEnabled).toBe(true);
    expect(
      psychologists.map((specialist) => [
        specialist.id,
        telegramChatUrl(specialist.telegramUsername),
        specialist.phone.number,
        specialist.durationMinutes,
        specialist.priceKzt,
      ]),
    ).toEqual([
      ["sovunya-ju", "https://t.me/sovunya_ju", "+77051661132", 60, 10000],
      ["elina-l-r", "https://t.me/elina_l_r", "+77770125648", 60, 10000],
    ]);
  });
  it("puts only the generic booking draft in the Telegram link", () => {
    const url = new URL(telegramBookingUrl("elina_l_r"));
    expect(url.origin + url.pathname).toBe("https://t.me/elina_l_r");
    expect(decodeURIComponent(url.search.slice("?text=".length))).toBe(
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
