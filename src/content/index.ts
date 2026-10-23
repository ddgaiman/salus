import type { Step } from '../engine/explain';
import type { Task } from '../engine/task';
import type { HeroId, Level, SkillId } from '../engine/types';
import dragon from './dragon.json';
import explanations from './explanations.json';
import heroes from './heroes.json';
import hints from './hints.json';
import missions from './missions.json';
import prompts from './prompts.json';
import ui from './ui.json';
import { format } from './format';

export { dragon, explanations, heroes, hints, missions, prompts, ui };
export { format, toSpeech, pluralIndex } from './format';

export interface Mission {
  id: string;
  intro: string;
  outro: string;
  bonus: boolean;
}

export function heroOf(id: HeroId) {
  return heroes[id];
}

export function promptText(task: Task): string {
  return format(prompts[task.promptKey], task.params);
}

export function stepText(step: Step): string {
  const template = (explanations as Record<string, string>)[step.key];
  if (template === undefined) throw new Error(`Missing explanation template: ${step.key}`);
  return format(template, step.params);
}

/** Hint for the 1st (strategy) or 2nd (explanation intro) mistake, in the hero's tone. */
export function hintText(skillId: SkillId, level: Level, mistake: 1 | 2, hero: HeroId): string {
  return hints[skillId][String(level) as '1'][String(mistake) as '1'][hero];
}

export function missionsFor(skillId: SkillId, bonus: boolean): Mission[] {
  return (missions.missions[skillId] as Mission[]).filter((m) => m.bonus === bonus);
}

export function islandOf(islandId: string) {
  return (missions.islands as Record<string, { name: string; game: string }>)[islandId];
}

export function abilityOf(id: string) {
  return (dragon.abilities as Record<string, { name: string; description: string }>)[id];
}

export function bookText(skillId: SkillId, level: Level): string {
  return (dragon.book as Record<string, string>)[`${skillId}-${level}`] ?? '';
}

export function stageOf(stage: number) {
  return dragon.stages[String(stage) as '1'];
}

/** Picks a praise line deterministically so tests and replays are stable. */
export function praise(hero: HeroId, afterHelp: boolean, n: number): string {
  const list = ui.feedback[afterHelp ? 'afterHelp' : 'firstTry'][hero];
  return list[n % list.length] ?? '';
}
