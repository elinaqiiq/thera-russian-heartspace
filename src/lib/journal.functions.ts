import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { entrySchema, profileSchema } from './wellbeing';

export const getJournal = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const entries = await context.supabase.from('emotion_entries').select('*').eq('user_id', context.userId).order('created_at', { ascending: false }).limit(50);
  if (entries.error) throw new Error('Не удалось загрузить дневник');
  return { entries: entries.data };
});

export const getProfile = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader('Cache-Control', 'private, no-store');
  const { data, error } = await context.supabase.from('profiles').select('display_name, avatar_data').eq('id', context.userId).maybeSingle();
  if (error) throw new Error('Не удалось загрузить профиль');
  return data;
});

export const saveEntry = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => entrySchema.parse(data)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('emotion_entries').insert({ ...data, user_id: context.userId });
  if (error) throw new Error('Не удалось сохранить запись');
  return { ok: true };
});
export const deleteEntry = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('emotion_entries').delete().eq('id', data.id).eq('user_id', context.userId);
  if (error) throw new Error('Не удалось удалить запись');
  return { ok: true };
});
export const saveProfile = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => profileSchema.parse(data)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('profiles').upsert({ ...data, id: context.userId });
  if (error) throw new Error('Не удалось сохранить профиль');
  return { ok: true };
});