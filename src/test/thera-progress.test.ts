import { describe, expect, it } from "vitest";
import { progressInput } from "@/lib/thera-progress";

describe("progress summaries", () => {
  it("uses the account's own messages once, in chronological order", () => {
    const first = { id: "a", own: true, createdAt: "2026-11-18T09:00:00Z", text: "Первый день" };
    const last = { id: "b", own: true, createdAt: "2026-11-20T09:00:00Z", text: "Последний день" };
    const bot = { ...first, id: "c", own: false, text: "Ответ Thera" };
    expect(progressInput([last, first, bot, first])).toEqual({
      period_start: "2026-11-18T09:00:00.000Z",
      period_end: "2026-11-20T09:00:00.000Z",
      text: [
        { date: first.createdAt, text: first.text },
        { date: last.createdAt, text: last.text },
      ],
    });
    expect(progressInput([bot])).toBeNull();
  });
});
