export const SESSION_NOTES_LIMIT = 3000;
export const THERA_TRANSCRIPT_LIMIT = 12000;

export function formatConsultationSummary(summary: string, transcript?: string) {
  const text = summary.trim();
  return transcript?.trim() ? `${text}\n\nФрагмент разговора с Thera\n${transcript.trim()}` : text;
}
