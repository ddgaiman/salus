import { describe, expect, it } from 'vitest';
import { explain } from './explain';
import { generateTask } from './generators';
import { LEVELS, SKILL_IDS } from './types';

describe('explain', () => {
  it.each(SKILL_IDS.flatMap((s) => LEVELS.map((l) => [s, l] as const)))(
    '%s level %i: steps hide the answer, the solution shows it',
    (skill, level) => {
      for (let i = 0; i < 50; i++) {
        const task = generateTask(skill, level, `e${i}`);
        const { steps, solution } = explain(task);
        expect(steps.length).toBeGreaterThan(0);
        expect(steps.some((s) => s.params.result === task.answer)).toBe(false);
        expect(solution.at(-1)?.params.result).toBe(task.answer);
      }
    },
  );

  it('splits tens and ones for written sums', () => {
    const task = generateTask('addsub', 4, 'split');
    const { steps } = explain(task);
    const b = task.params.b as number;
    expect(steps.some((s) => s.key === 'split') || b < 10).toBe(true);
  });
});
