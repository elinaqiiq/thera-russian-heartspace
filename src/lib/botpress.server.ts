import { z } from "zod";

const Page = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      createdAt: z.string().datetime({ offset: true }),
      payload: z.object({ type: z.string(), text: z.string().optional() }),
    }),
  ),
  meta: z.object({ nextToken: z.string().nullish() }),
});

const encode = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const utf8 = new TextEncoder();

export function botpressConfigured() {
  return (
    /^[a-zA-Z0-9-]{1,128}$/.test(process.env["BOTPRESS_CHAT_WEBHOOK_ID"] ?? "") &&
    (process.env["BOTPRESS_CHAT_ENCRYPTION_KEY"]?.length ?? 0) >= 32
  );
}

export async function accountChat(accountId: string) {
  if (!botpressConfigured()) throw new Error("Личный чат пока не подключён.");
  const identity = encode(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", utf8.encode("thera-account-chat-v1:" + accountId)),
    ),
  );
  const id = "thera-" + identity;
  const key = await crypto.subtle.importKey(
    "raw",
    utf8.encode(process.env["BOTPRESS_CHAT_ENCRYPTION_KEY"]!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const issuedAt = Math.floor(Date.now() / 1000);
  const unsigned =
    encode(utf8.encode('{"alg":"HS256","typ":"JWT"}')) +
    "." +
    encode(utf8.encode(JSON.stringify({ id, iat: issuedAt, exp: issuedAt + 120 })));
  const token =
    unsigned +
    "." +
    encode(new Uint8Array(await crypto.subtle.sign("HMAC", key, utf8.encode(unsigned))));
  const origin = "https://chat.botpress.cloud/" + process.env["BOTPRESS_CHAT_WEBHOOK_ID"];

  async function request(path: string, method = "GET", body?: object, allowMissing = false) {
    const response = await fetch(origin + path, {
      method,
      headers: { "x-user-key": token, "content-type": "application/json" },
      body: body ? JSON.stringify(body) : null,
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
    });
    if (allowMissing && response.status === 404) return null;
    if (!response.ok) throw new Error("Botpress временно недоступен.");
    return response.status === 204 ? null : response.json();
  }

  const user = z
    .object({ user: z.object({ id: z.string().min(1) }) })
    .parse(await request("/users/get-or-create", "POST", {})).user;
  const conversation = z
    .object({ conversation: z.object({ id: z.string().min(1) }) })
    .parse(await request("/conversations/get-or-create", "POST", { id })).conversation;

  const path = "/conversations/" + encodeURIComponent(conversation.id);
  return {
    async messages(cursor?: string) {
      const page = Page.parse(
        await request(
          path + "/messages" + (cursor ? "?" + new URLSearchParams({ nextToken: cursor }) : ""),
        ),
      );
      return {
        items: page.messages.flatMap(({ id, userId, createdAt, payload }) =>
          payload.type === "text" && payload.text
            ? [{ id, createdAt, own: userId === user.id, text: payload.text }]
            : [],
        ),
        cursor: page.meta.nextToken || undefined,
      };
    },
    async send(text: string) {
      await request("/messages", "POST", {
        conversationId: conversation.id,
        payload: { type: "text", text },
      });
    },
    async remove() {
      await request(path, "DELETE", undefined, true);
    },
  };
}
