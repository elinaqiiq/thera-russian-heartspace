import { z } from 'zod';

export const CONTACT_PHONE = '+77770125648';
export const CONTACT_WHATSAPP = 'https://wa.me/77770125648';
export const moods = ['Очень тяжело', 'Тяжело', 'Нейтрально', 'Хорошо', 'Очень хорошо'];
export const emotions = ['Тревога', 'Грусть', 'Радость', 'Злость', 'Усталость', 'Спокойствие'];
export const entrySchema = z.object({
  mood: z.number().int().min(1).max(5),
  emotion: z.enum(['Тревога', 'Грусть', 'Радость', 'Злость', 'Усталость', 'Спокойствие']),
  note: z.string().trim().max(3000),
  audio_base64: z.string().max(2800000).regex(/^[A-Za-z0-9+/=]*$/).nullable(),
  audio_type: z.enum(['audio/webm', 'audio/mp4', 'audio/ogg']).nullable(),
}).refine(v => Boolean(v.audio_base64) === Boolean(v.audio_type), 'Некорректная аудиозапись');
export const profileSchema = z.object({
  display_name: z.string().trim().max(100),
  avatar_data: z.string().max(700000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/).nullable(),
});

export const questionnaires = {
  gad7: {
    title: 'Тревога · GAD-7',
    questions: ['Чувство нервозности, тревоги или напряжения', 'Невозможность остановить или контролировать беспокойство', 'Чрезмерное беспокойство о разных вещах', 'Трудности с расслаблением', 'Неусидчивость: трудно сидеть спокойно', 'Раздражительность', 'Страх, что произойдёт что-то ужасное'],
    answers: ['Ни разу', 'Несколько дней', 'Более половины дней', 'Почти каждый день'],
  },
  who5: {
    title: 'Самочувствие · WHO-5',
    questions: ['Я чувствовал(а) себя бодро и в хорошем настроении', 'Я чувствовал(а) себя спокойно и расслабленно', 'Я чувствовал(а) себя активным(ой) и энергичным(ой)', 'Я просыпался(ась) свежим(ей) и отдохнувшим(ей)', 'Моя повседневная жизнь была наполнена интересными делами'],
    answers: ['Ни разу', 'Иногда', 'Менее половины времени', 'Более половины времени', 'Большую часть времени', 'Всё время'],
  },
};
export type QuestionnaireId = keyof typeof questionnaires;
export function scoreQuestionnaire(id: QuestionnaireId, answers: number[]) {
  const test = questionnaires[id];
  if (answers.length !== test.questions.length || answers.some(v => !Number.isInteger(v) || v < 0 || v >= test.answers.length)) throw new Error('Ответь на все вопросы');
  const sum = answers.reduce((a, b) => a + b, 0);
  if (id === 'who5') return { score: sum * 4, max: 100, message: sum < 13 ? 'Самочувствие снижено. Стоит обсудить результат с психологом или врачом.' : 'Результат отражает относительно благоприятное самочувствие, но не исключает трудностей.' };
  return { score: sum, max: 21, message: sum >= 15 ? 'Высокая выраженность тревоги. Обсуди результат со специалистом.' : sum >= 10 ? 'Умеренная выраженность тревоги. Рекомендуется обсудить результат со специалистом.' : sum >= 5 ? 'Лёгкая выраженность тревоги.' : 'Минимальная выраженность тревоги.' };
}
export const breathingPatterns = {
  gentle: { label: 'Мягкое дыхание', phases: [{ label: 'Вдох', seconds: 4 }, { label: 'Выдох', seconds: 6 }] },
  equal: { label: 'Ровное дыхание', phases: [{ label: 'Вдох', seconds: 4 }, { label: 'Выдох', seconds: 4 }] },
};