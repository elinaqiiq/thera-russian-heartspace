import { z } from "zod";

export const feedbackAnswers = { yes: "Да", partial: "Частично", no: "Нет" } as const;
export type FeedbackAnswer = keyof typeof feedbackAnswers;

export const FEEDBACK_TEXT_LIMIT = 1000;

export const feedbackSchema = z.object({
  helped: z.enum(["yes", "partial", "no"]),
  improve: z.string().trim().max(FEEDBACK_TEXT_LIMIT),
  disliked: z.string().trim().max(FEEDBACK_TEXT_LIMIT),
});
export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const feedbackList = z.object({
  counts: z.object({ yes: z.number(), partial: z.number(), no: z.number() }),
  items: z.array(
    z.object({
      id: z.string(),
      helped: z.enum(["yes", "partial", "no"]),
      improve: z.string(),
      disliked: z.string(),
      created_at: z.string(),
    }),
  ),
});
