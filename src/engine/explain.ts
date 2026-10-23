import type { Task } from './task';

export interface Step {
  /** Key of the step template in src/content. */
  key: string;
  params: Record<string, number | string>;
}

export interface Explanation {
  /** Shown after the 2nd mistake; walks through the method without the result. */
  steps: Step[];
  /** Shown after the 3rd mistake; the full method including the result. */
  solution: Step[];
}

function splitTens(n: number) {
  return { tens: Math.floor(n / 10) * 10, ones: n % 10 };
}

export function explain(task: Task): Explanation {
  const v = task.visual;
  switch (v.kind) {
    case 'coins': {
      const changeKey = v.op === '+' ? 'coins.add' : 'coins.remove';
      return {
        steps: [
          { key: 'coins.start', params: { start: v.start } },
          { key: changeKey, params: { change: v.change } },
          { key: 'coins.count', params: {} },
        ],
        solution: [
          { key: 'coins.start', params: { start: v.start } },
          { key: changeKey, params: { change: v.change } },
          { key: 'equation', params: { a: v.start, op: v.op, b: v.change, result: task.answer } },
        ],
      };
    }
    case 'equation': {
      const { tens, ones } = splitTens(v.b);
      const sign = v.op === '+' ? 1 : -1;
      const mid = v.a + sign * tens;
      const steps: Step[] = [];
      // Split only when both parts are non-zero; otherwise the split step would give the result.
      if (tens > 0 && ones > 0) {
        steps.push({ key: 'split', params: { b: v.b, tens, ones } });
        steps.push({ key: 'equation', params: { a: v.a, op: v.op, b: tens, result: mid } });
      }
      const split = steps.length > 0;
      const a = split ? mid : v.a;
      const b = split ? ones : v.b;
      return {
        steps: [...steps, { key: 'equation.open', params: { a, op: v.op, b } }],
        solution: [...steps, { key: 'equation', params: { a, op: v.op, b, result: task.answer } }],
      };
    }
    case 'islands': {
      const ask = v.ask === 'closer' ? 'compare.solutionCloser' : 'compare.solutionFarther';
      const steps: Step[] = [{ key: 'compare.tens', params: { a: v.a, b: v.b } }];
      steps.push({ key: 'compare.ones', params: {} });
      return { steps, solution: [...steps, { key: ask, params: { result: task.answer } }] };
    }
    case 'sequence': {
      const step = Math.abs(v.step);
      const dir = v.step > 0 ? '+' : '-';
      const gap = v.terms.indexOf(null);
      const before = v.terms[gap - 1];
      const stepKey = v.step > 0 ? 'seq.stepUp' : 'seq.stepDown';
      const steps: Step[] = [
        { key: stepKey, params: { step } },
        { key: 'seq.before', params: { before: before ?? 0 } },
        { key: 'equation.open', params: { a: before ?? 0, op: dir, b: step } },
      ];
      return {
        steps,
        solution: [
          ...steps.slice(0, 2),
          { key: 'equation', params: { a: before ?? 0, op: dir, b: step, result: task.answer } },
        ],
      };
    }
    case 'groups': {
      const repeated = Array.from({ length: v.groups }, () => v.perGroup).join(' + ');
      const steps: Step[] = [
        { key: 'groups.count', params: { groups: v.groups, perGroup: v.perGroup } },
        { key: 'groups.repeat', params: { repeated } },
      ];
      return {
        steps,
        solution: [
          ...steps,
          { key: 'groups.solution', params: { a: v.groups, b: v.perGroup, result: task.answer } },
        ],
      };
    }
    case 'share': {
      const steps: Step[] = [
        { key: 'share.deal', params: { total: v.total, parts: v.groups } },
        { key: 'share.check', params: { total: v.total, parts: v.groups } },
      ];
      return {
        steps,
        solution: [
          ...steps,
          {
            key: 'share.solution',
            params: { total: v.total, parts: v.groups, result: task.answer },
          },
        ],
      };
    }
  }
}
