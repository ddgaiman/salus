import type { Level, SkillId } from './types';

export type Visual =
  /** Coins in a treasure chest; objects are shown and can be dragged. */
  | { kind: 'coins'; start: number; change: number; op: '+' | '-' }
  | { kind: 'equation'; a: number; b: number; op: '+' | '-' }
  | { kind: 'islands'; a: number; b: number; ask: 'closer' | 'farther' }
  | { kind: 'sequence'; terms: Array<number | null>; step: number }
  | { kind: 'groups'; groups: number; perGroup: number; showObjects: boolean }
  | { kind: 'share'; total: number; groups: number; showObjects: boolean };

export type PromptKey =
  | 'addsub.add'
  | 'addsub.sub'
  | 'compare.closer'
  | 'compare.farther'
  | 'compare.next'
  | 'compare.missing'
  | 'muldiv.groups'
  | 'muldiv.times'
  | 'muldiv.share';

export interface Task {
  id: string;
  skillId: SkillId;
  level: Level;
  seed: string;
  /** Key of the child-facing prompt template in src/content. */
  promptKey: PromptKey;
  params: Record<string, number>;
  answer: number;
  answerMode: 'numpad' | 'choice';
  /** Tap targets for answerMode 'choice'; empty for 'numpad'. */
  choices: number[];
  visual: Visual;
}

/** Stable signature of what the child sees; used to count distinct tasks. */
export function taskSignature(task: Task): string {
  return `${task.promptKey}:${JSON.stringify(task.params)}:${JSON.stringify(task.visual)}`;
}
