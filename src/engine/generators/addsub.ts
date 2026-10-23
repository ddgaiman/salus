import type { Rng } from '../rng';
import type { Task } from '../task';
import type { Level } from '../types';

type Draft = Pick<Task, 'promptKey' | 'params' | 'answer' | 'answerMode' | 'choices' | 'visual'>;

function build(a: number, b: number, op: '+' | '-', objects: boolean): Draft {
  const answer = op === '+' ? a + b : a - b;
  return {
    promptKey: op === '+' ? 'addsub.add' : 'addsub.sub',
    params: { a, b },
    answer,
    answerMode: 'numpad',
    choices: [],
    visual: objects ? { kind: 'coins', start: a, change: b, op } : { kind: 'equation', a, b, op },
  };
}

/** Level 1: up to 10 with objects. */
function level1(rng: Rng): Draft {
  const op = rng.pick(['+', '-'] as const);
  if (op === '+') {
    const a = rng.int(1, 9);
    return build(a, rng.int(1, 10 - a), op, true);
  }
  const a = rng.int(2, 10);
  return build(a, rng.int(1, a - 1), op, true);
}

/** Level 2: up to 20; at least one number above 10. */
function level2(rng: Rng): Draft {
  const op = rng.pick(['+', '-'] as const);
  if (op === '+') {
    const sum = rng.int(11, 20);
    const a = rng.int(1, sum - 1);
    return build(a, sum - a, op, false);
  }
  const a = rng.int(11, 20);
  return build(a, rng.int(1, a - 1), op, false);
}

/** Level 3: up to 100 without crossing a ten. */
function level3(rng: Rng): Draft {
  const op = rng.pick(['+', '-'] as const);
  if (op === '+') {
    const aT = rng.int(1, 8);
    const aO = rng.int(0, 8);
    const bT = rng.int(0, 9 - aT);
    const bO = rng.int(1, 9 - aO);
    return build(aT * 10 + aO, bT * 10 + bO, op, false);
  }
  const aT = rng.int(2, 9);
  const aO = rng.int(1, 9);
  const bT = rng.int(0, aT - 1);
  const bO = rng.int(1, aO);
  return build(aT * 10 + aO, bT * 10 + bO, op, false);
}

/** Level 4: up to 100 crossing a ten. */
function level4(rng: Rng): Draft {
  const op = rng.pick(['+', '-'] as const);
  if (op === '+') {
    const aT = rng.int(1, 7);
    const aO = rng.int(2, 9);
    const bO = rng.int(10 - aO, 9);
    const bT = rng.int(0, 8 - aT);
    return build(aT * 10 + aO, bT * 10 + bO, op, false);
  }
  const aT = rng.int(2, 9);
  const aO = rng.int(0, 8);
  const bO = rng.int(aO + 1, 9);
  const bT = rng.int(0, aT - 1);
  return build(aT * 10 + aO, bT * 10 + bO, op, false);
}

export function generateAddSub(level: Level, rng: Rng): Draft {
  return [level1, level2, level3, level4][level - 1]!(rng);
}
