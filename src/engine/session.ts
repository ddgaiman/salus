import { MAX_MISSIONS_BEFORE_BREAK, MIN_MISSIONS_BEFORE_BREAK } from './config';
import type { SaveState } from './types';

/** Missions completed today; a new day starts from zero without any penalty. */
export function missionsToday(state: SaveState, today: string): number {
  return state.session.date === today ? state.session.missionsToday : 0;
}

export function isBreakDue(state: SaveState, today: string): boolean {
  return missionsToday(state, today) >= state.settings.missionsBeforeBreak;
}

export function countMission(state: SaveState, today: string): SaveState {
  return { ...state, session: { date: today, missionsToday: missionsToday(state, today) + 1 } };
}

export function clampMissionsBeforeBreak(n: number): number {
  if (!Number.isFinite(n)) return MIN_MISSIONS_BEFORE_BREAK;
  return Math.min(MAX_MISSIONS_BEFORE_BREAK, Math.max(MIN_MISSIONS_BEFORE_BREAK, Math.round(n)));
}
