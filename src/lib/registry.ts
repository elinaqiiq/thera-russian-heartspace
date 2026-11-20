import { z } from "zod";

export const registrySchema = z.object({
  users: z.array(
    z.object({
      id: z.string(),
      email: z.string().nullable(),
      created_at: z.string(),
      confirmed_at: z.string().nullable(),
    }),
  ),
  requests: z.array(
    z.object({
      id: z.string(),
      user_id: z.string(),
      email: z.string().nullable(),
      specialist_id: z.string(),
      telegram_username: z.string().nullable(),
      created_at: z.string(),
    }),
  ),
});

export type Registry = z.infer<typeof registrySchema>;
