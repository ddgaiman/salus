import type { Rng } from '../rng';
import type { Task } from '../task';
import type { Level } from '../types';
import { makeChoices } from './choices';

type Draft = Pick<Task, 'promptKey' | 'params' | 'answer' | 'answerMode' | 'choices' | 'visual'>;

function islands(rng: Rng, max: number): Draft {
  const a = rng.int(1, max);
  let b = rng.int(1, max - 1);
  if (b >= a) b += 1;
  const ask = rng.pick(['closer', 'farther'] as const);
  return {
    promptKey: ask === 'closer' ? 'compare.closer' : 'compare.farther',
    params: { a, b },
    answer: ask === 'closer' ? Math.min(a, b) : Math.max(a, b),
    answerMode: 'choice',
    choices: [a, b],
    visual: { kind: 'islands', a, b, ask },
  };
}

/** Level 3: count on by 2, 5 or 10; find the next term. */
function nextTerm(rng: Rng): Draft {
  const step = rng.pick([2, 5, 10] as const);
  const start = step === 2 ? rng.int(0, 40) : step * rng.int(0, 5);
  const terms = [0, 1, 2, 3].map((i) => start + i * step);
  const answer = start + 4 * step;
  return {
    promptKey: 'compare.next',
    params: { step },
    answer,
    answerMode: 'choice',
    choices: makeChoices(answer, step, rng),
    visual: { kind: 'sequence', terms: [...terms, null], step },
  };
}

/** Level 4: a missing term inside a sequence (ascending or descending). */
function missingTerm(rng: Rng): Draft {
  const step = rng.pick([2, 3, 4, 5, 10] as const);
  const descending = rng.next() < 0.3;
  const start = descending ? rng.int(4 * step, 100) : rng.int(0, 100 - 4 * step);
  const signed = descending ? -step : step;
  const all = [0, 1, 2, 3, 4].map((i) => start + i * signed);
  const gap = rng.int(1, 3);
  const answer = all[gap]!;
  return {
    promptKey: 'compare.missing',
    params: { step },
    answer,
    answerMode: 'choice',
    choices: makeChoices(answer, step, rng),
    visual: { kind: 'sequence', terms: all.map((t, i) => (i === gap ? null : t)), step: signed },
  };
}

export function generateCompare(level: Level, rng: Rng): Draft {
  if (level === 1) return islands(rng, 20);
  if (level === 2) return islands(rng, 100);
  if (level === 3) return nextTerm(rng);
  return missingTerm(rng);
}
