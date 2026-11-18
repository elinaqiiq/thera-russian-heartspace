import { describe, expect, it } from "vitest";
import {
  bookingSubmissionsEnabled,
  formatKzt,
  psychologists,
  THERA_CHAT_URL,
  servicePricing,
} from "@/lib/site";
describe("TherapyAI rules", () => {
  it("uses the supplied agent", () =>
    expect(THERA_CHAT_URL).toBe(
      "https://vdk-viber-runtime-prod.bot.botpress.host/edge/?botId=7ad7759a-ed1b-49d9-83c6-6555daa01224",
    ));
  it("does not invent specialists", () => expect(psychologists).toHaveLength(0));
  it("disables submissions without delivery", () => expect(bookingSubmissionsEnabled).toBe(false));
  it("keeps Thera free", () => expect(servicePricing.chatKzt).toBe(0));
  it("charges consultations separately", () =>
    expect(servicePricing.consultationIncluded).toBe(false));
  it("formats prices in tenge", () => expect(formatKzt(15000)).toBe("15 000 ₸"));
});
