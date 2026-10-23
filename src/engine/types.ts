export type HeroId = 'viki' | 'smrkljasti' | 'kamikazi';
export type SkillId = 'addsub' | 'compare' | 'muldiv';
export type Level = 1 | 2 | 3 | 4;

export const HERO_IDS: readonly HeroId[] = ['viki', 'smrkljasti', 'kamikazi'];
export const SKILL_IDS: readonly SkillId[] = ['addsub', 'compare', 'muldiv'];
export const LEVELS: readonly Level[] = [1, 2, 3, 4];

export interface SkillState {
  level: Level;
  /** Scores of the most recent answers (0, 0.5, 1). */
  window: number[];
  mastered: boolean;
}

export type SkillsState = Record<SkillId, SkillState>;

export interface ReviewEntry {
  skillId: SkillId;
  level: number;
  taskSeed: string;
}

export interface LogEntry {
  ts: number;
  skillId: SkillId;
  level: number;
  score: number;
}

export interface SaveState {
  schemaVersion: 1;
  heroId: HeroId | null;
  skills: SkillsState;
  reviewQueue: ReviewEntry[];
  dragonStage: 1 | 2 | 3 | 4 | 5;
  abilities: string[];
  unlockedIslands: string[];
  dragonBook: Array<{ date: string; text: string }>;
  session: { missionsToday: number; date: string };
  settings: { missionsBeforeBreak: number; voice: 'recorded' | 'tts' };
  log: LogEntry[];
}

export type EngineEvent =
  | { type: 'levelUp'; skillId: SkillId; level: Level }
  | { type: 'levelDown'; skillId: SkillId; level: Level }
  | { type: 'skillMastered'; skillId: SkillId };
