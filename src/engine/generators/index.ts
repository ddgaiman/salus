import { createRng } from '../rng';
import type { Task } from '../task';
import type { Level, SkillId } from '../types';
import { generateAddSub } from './addsub';
import { generateCompare } from './compare';
import { generateMulDiv } from './muldiv';

const generators = { addsub: generateAddSub, compare: generateCompare, muldiv: generateMulDiv };

/** Deterministic: the same skill, level and seed always give the same task. */
export function generateTask(skillId: SkillId, level: Level, seed: string): Task {
  const rng = createRng(`${skillId}|${level}|${seed}`);
  const draft = generators[skillId](level, rng);
  return { id: `${skillId}-${level}-${seed}`, skillId, level, seed, ...draft };
}
