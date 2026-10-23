import { CHOICE_COUNT } from '../config';
import type { Rng } from '../rng';

/** The answer plus plausible, distinct, positive distractors, shuffled. */
export function makeChoices(answer: number, step: number, rng: Rng): number[] {
  const candidates = [answer + step, answer - step, answer + 1, answer - 1, answer + 2 * step];
  const set = new Set<number>([answer]);
  for (const c of rng.shuffle(candidates)) {
    if (set.size >= CHOICE_COUNT) break;
    if (c >= 0) set.add(c);
  }
  return rng.shuffle([...set]);
}
