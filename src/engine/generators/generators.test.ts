import { describe, expect, it } from 'vitest';
import { generateTask } from './index';
import { taskSignature, type Task } from '../task';
import { LEVELS, SKILL_IDS } from '../types';

const seeds = Array.from({ length: 300 }, (_, i) => `s${i}`);
const all = (skill: (typeof SKILL_IDS)[number], level: (typeof LEVELS)[number]) =>
  seeds.map((s) => generateTask(skill, level, s));

function numbersIn(task: Task): number[] {
  const v = task.visual;
  switch (v.kind) {
    case 'coins':
      return [v.start, v.change, task.answer];
    case 'equation':
      return [v.a, v.b, task.answer];
    case 'islands':
      return [v.a, v.b];
    case 'sequence':
      return [...v.terms.filter((t): t is number => t !== null), task.answer];
    case 'groups':
      return [v.groups, v.perGroup, task.answer];
    case 'share':
      return [v.total, v.groups, task.answer];
  }
}

describe('generateTask', () => {
  it('is deterministic for a seed', () => {
    for (const skill of SKILL_IDS) {
      for (const level of LEVELS) {
        expect(generateTask(skill, level, 'abc')).toEqual(generateTask(skill, level, 'abc'));
      }
    }
  });

  it.each(SKILL_IDS.flatMap((s) => LEVELS.map((l) => [s, l] as const)))(
    '%s level %i has at least 20 distinct tasks',
    (skill, level) => {
      const distinct = new Set(all(skill, level).map(taskSignature));
      expect(distinct.size).toBeGreaterThanOrEqual(20);
    },
  );

  it('keeps every number a non-negative integer', () => {
    for (const skill of SKILL_IDS) {
      for (const level of LEVELS) {
        for (const t of all(skill, level)) {
          for (const n of numbersIn(t)) {
            expect(Number.isInteger(n) && n >= 0).toBe(true);
          }
        }
      }
    }
  });

  it('puts the answer among the choices for choice tasks', () => {
    for (const level of LEVELS) {
      for (const t of all('compare', level)) {
        expect(t.answerMode).toBe('choice');
        expect(t.choices).toContain(t.answer);
        expect(new Set(t.choices).size).toBe(t.choices.length);
      }
    }
  });
});

describe('addsub ranges', () => {
  it('level 1 stays within 10 and uses objects', () => {
    for (const t of all('addsub', 1)) {
      expect(t.visual.kind).toBe('coins');
      expect(Math.max(...numbersIn(t))).toBeLessThanOrEqual(10);
    }
  });

  it('level 2 stays within 20 and goes above 10', () => {
    for (const t of all('addsub', 2)) {
      const ns = numbersIn(t);
      expect(Math.max(...ns)).toBeLessThanOrEqual(20);
      expect(Math.max(...ns)).toBeGreaterThan(10);
    }
  });

  it('level 3 stays within 100 without crossing a ten', () => {
    for (const t of all('addsub', 3)) {
      const { a, b } = t.params as { a: number; b: number };
      expect(Math.max(...numbersIn(t))).toBeLessThanOrEqual(100);
      if (t.promptKey === 'addsub.add') expect((a % 10) + (b % 10)).toBeLessThan(10);
      else expect(a % 10).toBeGreaterThanOrEqual(b % 10);
    }
  });

  it('level 4 stays within 100 and crosses a ten', () => {
    for (const t of all('addsub', 4)) {
      const { a, b } = t.params as { a: number; b: number };
      expect(Math.max(...numbersIn(t))).toBeLessThanOrEqual(100);
      if (t.promptKey === 'addsub.add') expect((a % 10) + (b % 10)).toBeGreaterThanOrEqual(10);
      else expect(a % 10).toBeLessThan(b % 10);
    }
  });

  it('computes correct answers', () => {
    for (const level of LEVELS) {
      for (const t of all('addsub', level)) {
        const { a, b } = t.params as { a: number; b: number };
        expect(t.answer).toBe(t.promptKey === 'addsub.add' ? a + b : a - b);
      }
    }
  });
});

describe('compare ranges', () => {
  it('levels 1 and 2 compare numbers up to 20 and 100', () => {
    for (const [level, max] of [
      [1, 20],
      [2, 100],
    ] as const) {
      for (const t of all('compare', level)) {
        const { a, b } = t.params as { a: number; b: number };
        expect(a).not.toBe(b);
        expect(Math.max(a, b)).toBeLessThanOrEqual(max);
        expect(t.answer).toBe(t.promptKey === 'compare.closer' ? Math.min(a, b) : Math.max(a, b));
      }
    }
  });

  it('level 3 counts on by 2, 5 or 10', () => {
    for (const t of all('compare', 3)) {
      if (t.visual.kind !== 'sequence') throw new Error('expected sequence');
      expect([2, 5, 10]).toContain(t.visual.step);
      const last = t.visual.terms[3] as number;
      expect(t.answer).toBe(last + t.visual.step);
      expect(t.visual.terms[4]).toBeNull();
    }
  });

  it('level 4 has one missing inner term', () => {
    for (const t of all('compare', 4)) {
      if (t.visual.kind !== 'sequence') throw new Error('expected sequence');
      const gap = t.visual.terms.indexOf(null);
      expect(gap).toBeGreaterThanOrEqual(1);
      expect(gap).toBeLessThanOrEqual(3);
      expect(t.answer).toBe((t.visual.terms[gap - 1] as number) + t.visual.step);
      expect(Math.max(...numbersIn(t))).toBeLessThanOrEqual(100);
    }
  });
});

describe('muldiv ranges', () => {
  it('level 1 uses pictured equal groups', () => {
    for (const t of all('muldiv', 1)) {
      if (t.visual.kind !== 'groups') throw new Error('expected groups');
      expect(t.visual.showObjects).toBe(true);
      expect(t.answer).toBe(t.visual.groups * t.visual.perGroup);
    }
  });

  it('level 2 uses the 2, 5 and 10 tables; level 3 the 3 and 4 tables', () => {
    for (const [level, tables] of [
      [2, [2, 5, 10]],
      [3, [3, 4]],
    ] as const) {
      for (const t of all('muldiv', level)) {
        const { a, b } = t.params as { a: number; b: number };
        expect((tables as readonly number[]).some((n) => n === a || n === b)).toBe(true);
        expect(t.answer).toBe(a * b);
      }
    }
  });

  it('level 4 divides into equal parts without remainder', () => {
    for (const t of all('muldiv', 4)) {
      const { total, parts } = t.params as { total: number; parts: number };
      expect(total % parts).toBe(0);
      expect(t.answer).toBe(total / parts);
    }
  });
});
