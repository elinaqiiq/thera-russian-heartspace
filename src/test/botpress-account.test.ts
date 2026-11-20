import { afterEach, expect, it, vi } from "vitest";
import { accountChat } from "@/lib/botpress.server";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("derives the same Botpress conversation on another session and separates accounts", async () => {
  vi.stubEnv("BOTPRESS_CHAT_WEBHOOK_ID", "test-webhook");
  vi.stubEnv("BOTPRESS_CHAT_ENCRYPTION_KEY", "x".repeat(32));
  const identities: Array<{ account: string; thread: string }> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options: RequestInit) => {
      if (url.endsWith("/users/get-or-create"))
        return Response.json({ user: { id: "internal-user" } });
      const token = (options.headers as Record<string, string>)["x-user-key"];
      const payload = token?.split(".")[1];
      if (!payload) throw new Error("Missing signed Botpress identity");
      const account = JSON.parse(Buffer.from(payload, "base64url").toString()).id;
      const thread = JSON.parse(options.body as string).id;
      identities.push({ account, thread });
      return Response.json({ conversation: { id: "internal-thread" } });
    }),
  );
  await accountChat("patient-a");
  await accountChat("patient-a");
  await accountChat("patient-b");
  expect(identities[0]).toEqual(identities[1]);
  expect(identities[0]).not.toEqual(identities[2]);
  expect(identities[0]?.account).not.toContain("patient-a");
});
