import { DEFAULT_MISSIONS_BEFORE_BREAK } from './config';
import type { SaveState, SkillState } from './types';

const freshSkill = (): SkillState => ({ level: 1, window: [], mastered: false });

export function createInitialState(today: string): SaveState {
  return {
    schemaVersion: 1,
    heroId: null,
    skills: { addsub: freshSkill(), compare: freshSkill(), muldiv: freshSkill() },
    reviewQueue: [],
    dragonStage: 1,
    abilities: [],
    unlockedIslands: [],
    dragonBook: [],
    session: { missionsToday: 0, date: today },
    settings: { missionsBeforeBreak: DEFAULT_MISSIONS_BEFORE_BREAK, voice: 'tts' },
    log: [],
  };
}

/** Local calendar date as YYYY-MM-DD. */
export function localDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
