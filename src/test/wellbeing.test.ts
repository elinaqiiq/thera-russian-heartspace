import { describe, expect, it } from 'vitest';
import { breathingStep, scoreQuestionnaire } from '@/lib/wellbeing';

describe('Breathing rhythms', () => {
  it('gives gentle breathing four seconds in and six out', () => {
    expect(breathingStep('gentle', 0)).toMatchObject({ label: 'Вдох', remaining: 4 });
    expect(breathingStep('gentle', 4)).toMatchObject({ label: 'Выдох', remaining: 6 });
    expect(breathingStep('gentle', 9)).toMatchObject({ label: 'Выдох', remaining: 1 });
    expect(breathingStep('gentle', 10)).toMatchObject({ label: 'Вдох', remaining: 4 });
  });
  it('gives equal breathing four seconds in and four out', () => {
    expect(breathingStep('equal', 4)).toMatchObject({ label: 'Выдох', remaining: 4 });
    expect(breathingStep('equal', 8)).toMatchObject({ label: 'Вдох', remaining: 4 });
  });
});
describe('Questionnaire scores', () => {
  it('scores GAD-7 from zero to 21', () => {
    expect(scoreQuestionnaire('gad7', Array(7).fill(0)).score).toBe(0);
    expect(scoreQuestionnaire('gad7', Array(7).fill(3)).score).toBe(21);
    expect(scoreQuestionnaire('gad7', [3, 3, 3, 1, 0, 0, 0]).message).toContain('Умеренная');
  });
  it('scales WHO-5 to 100 and flags raw scores below 13', () => {
    expect(scoreQuestionnaire('who5', Array(5).fill(5)).score).toBe(100);
    expect(scoreQuestionnaire('who5', [3, 3, 2, 2, 2])).toMatchObject({ score: 48 });
    expect(scoreQuestionnaire('who5', [3, 3, 2, 2, 2]).message).toContain('снижено');
    expect(scoreQuestionnaire('who5', [3, 3, 3, 2, 2]).message).toContain('благоприятное');
  });
  it('uses PHQ-2 screening threshold of three out of six', () => {
    expect(scoreQuestionnaire('phq2', [3, 3]).score).toBe(6);
    expect(scoreQuestionnaire('phq2', [1, 1]).message).toContain('не выявил');
    expect(scoreQuestionnaire('phq2', [1, 2]).message).toContain('более подробную оценку');
  });
  it('rejects incomplete and invalid answers rather than giving a score', () => {
    expect(() => scoreQuestionnaire('gad7', [0])).toThrow();
    expect(() => scoreQuestionnaire('phq2', [0, 4])).toThrow();
    expect(() => scoreQuestionnaire('who5', [0, 0, 0, 0, -1])).toThrow();
  });
});