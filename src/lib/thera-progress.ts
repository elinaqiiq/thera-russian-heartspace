export type ChatMessage = { id: string; createdAt: string; own: boolean; text: string };
export type ProgressNote = {
  id: string;
  user_id: string;
  clinician_id: string;
  summary: string;
  period_start: string;
  period_end: string;
  shared_at: string;
};
export type ProgressDraft = Pick<ProgressNote, "summary" | "period_start" | "period_end">;

export function progressInput(messages: ChatMessage[]) {
  const ordered = [...new Map(messages.filter((m) => m.own).map((m) => [m.id, m])).values()].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
  const chosen: ChatMessage[] = [];
  let length = 0;
  for (const message of ordered.slice(0, 60)) {
    if (length + message.text.length + 50 > 12000) break;
    length += message.text.length + 50;
    chosen.unshift(message);
  }
  const first = chosen[0];
  const last = chosen.at(-1);
  if (!first || !last) return null;
  return {
    period_start: new Date(first.createdAt).toISOString(),
    period_end: new Date(last.createdAt).toISOString(),
    text: chosen.map(({ createdAt, text }) => ({ date: createdAt, text })),
  };
}
