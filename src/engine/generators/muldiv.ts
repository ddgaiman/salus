import type { Rng } from '../rng';
import type { Task } from '../task';
import type { Level } from '../types';

type Draft = Pick<Task, 'promptKey' | 'params' | 'answer' | 'answerMode' | 'choices' | 'visual'>;

/** Objects are drawn only while the count stays small enough to see at a glance. */
const MAX_DRAWN = 30;

function groups(promptKey: 'muldiv.groups' | 'muldiv.times', a: number, b: number): Draft {
  return {
    promptKey,
    params: { a, b },
    answer: a * b,
    answerMode: 'numpad',
    choices: [],
    visual: {
      kind: 'groups',
      groups: a,
      perGroup: b,
      showObjects: promptKey === 'muldiv.groups' || a * b <= MAX_DRAWN,
    },
  };
}

export function generateMulDiv(level: Level, rng: Rng): Draft {
  if (level === 1) return groups('muldiv.groups', rng.int(2, 5), rng.int(1, 5));
  if (level === 2 || level === 3) {
    const table = rng.pick(level === 2 ? ([2, 5, 10] as const) : ([3, 4] as const));
    const times = rng.int(1, 10);
    // Dragons (a) each get the same number of fish (b); vary which factor is the table.
    return rng.next() < 0.5
      ? groups('muldiv.times', times, table)
      : groups('muldiv.times', table, times);
  }
  const parts = rng.int(2, 5);
  const each = rng.int(1, 10);
  const total = parts * each;
  return {
    promptKey: 'muldiv.share',
    params: { total, parts },
    answer: each,
    answerMode: 'numpad',
    choices: [],
    visual: { kind: 'share', total, groups: parts, showObjects: total <= MAX_DRAWN },
  };
}
