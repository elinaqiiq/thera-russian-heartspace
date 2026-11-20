import { describe, expect, it } from "vitest";
import {
  bookingSubmissionsEnabled,
  formatKzt,
  psychologists,
  THERA_CHAT_URL,
  telegramChatUrl,
  servicePricing,
} from "@/lib/site";
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
  it("keeps Thera free", () => expect(servicePricing.chatKzt).toBe(0));
  it("charges consultations separately", () =>
    expect(servicePricing.consultationIncluded).toBe(false));
  it("formats prices in tenge", () => expect(formatKzt(15000)).toBe("15 000 ₸"));
});
