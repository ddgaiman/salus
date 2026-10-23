import {
  LEVEL_DOWN_THRESHOLD,
  LEVEL_UP_THRESHOLD,
  MAX_LEVEL,
  MIN_LEVEL,
  SCORE_AFTER_HINT,
  SCORE_FIRST_TRY,
  SCORE_OTHER,
  WINDOW_SIZE,
} from './config';
import type { EngineEvent, Level, SkillId, SkillsState } from './types';

/** Score for an answer that was finally correct after the given number of mistakes. */
export function scoreForMistakes(mistakes: number): number {
  if (mistakes <= 0) return SCORE_FIRST_TRY;
  if (mistakes === 1) return SCORE_AFTER_HINT;
  return SCORE_OTHER;
}

export function windowSum(window: readonly number[]): number {
  return window.reduce((sum, s) => sum + s, 0);
}

/**
 * Adds a score to the skill's window and applies the level rules from PRD chapter 8.
 * Returns a new skills object; the input is not changed.
 */
export function recordAnswer(
  skills: SkillsState,
  skillId: SkillId,
  score: number,
): { skills: SkillsState; events: EngineEvent[] } {
  const current = skills[skillId];
  const window = [...current.window, score].slice(-WINDOW_SIZE);
  let { level, mastered } = current;
  let nextWindow = window;
  const events: EngineEvent[] = [];

  if (window.length >= WINDOW_SIZE) {
    const sum = windowSum(window);
    if (sum >= LEVEL_UP_THRESHOLD) {
      if (level < MAX_LEVEL) {
        level = (level + 1) as Level;
        nextWindow = [];
        events.push({ type: 'levelUp', skillId, level });
      } else if (!mastered) {
        mastered = true;
        events.push({ type: 'skillMastered', skillId });
      }
    } else if (sum <= LEVEL_DOWN_THRESHOLD && level > MIN_LEVEL) {
      level = (level - 1) as Level;
      nextWindow = [];
      events.push({ type: 'levelDown', skillId, level });
    }
  }

  return {
    skills: { ...skills, [skillId]: { level, window: nextWindow, mastered } },
    events,
  };
}
