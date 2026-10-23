import { bonusIsland } from './missions';
import { countMission } from './session';
import type { EngineEvent, Level, SaveState, SkillId } from './types';
import { SKILL_IDS } from './types';

export interface Rewards {
  /** Ability ids gained, as `${skillId}-${level}`. */
  abilities: string[];
  islands: string[];
  stageFrom: SaveState['dragonStage'];
  stageTo: SaveState['dragonStage'];
}

export const abilityId = (skillId: SkillId, level: Level) => `${skillId}-${level}`;

/**
 * Dragon stage from knowledge only: the lowest level shared by all three skills,
 * plus one when every skill is mastered. It never goes down.
 */
export function stageFor(state: SaveState): SaveState['dragonStage'] {
  const shared = Math.min(...SKILL_IDS.map((id) => state.skills[id].level));
  const allMastered = SKILL_IDS.every((id) => state.skills[id].mastered);
  const next = Math.min(5, Math.max(state.dragonStage, shared + (allMastered ? 1 : 0)));
  return next as SaveState['dragonStage'];
}

/** Turns engine events into rewards. Only levelUp and skillMastered give anything. */
export function applyRewards(
  state: SaveState,
  events: readonly EngineEvent[],
): { state: SaveState; rewards: Rewards } {
  const abilities = [...state.abilities];
  const islands = [...state.unlockedIslands];
  const gained: Rewards = {
    abilities: [],
    islands: [],
    stageFrom: state.dragonStage,
    stageTo: state.dragonStage,
  };
  for (const e of events) {
    if (e.type === 'levelUp') {
      const id = abilityId(e.skillId, e.level);
      if (!abilities.includes(id)) {
        abilities.push(id);
        gained.abilities.push(id);
      }
    } else if (e.type === 'skillMastered') {
      const id = bonusIsland(e.skillId);
      if (!islands.includes(id)) {
        islands.push(id);
        gained.islands.push(id);
      }
    }
  }
  const next = { ...state, abilities, unlockedIslands: islands };
  const stageTo = stageFor(next);
  gained.stageTo = stageTo;
  return { state: { ...next, dragonStage: stageTo }, rewards: gained };
}

/** Records a finished mission: a dragon book entry and the daily mission count. */
export function completeMission(state: SaveState, bookEntry: string, today: string): SaveState {
  const exists = state.dragonBook.some((e) => e.date === today && e.text === bookEntry);
  const dragonBook =
    exists || !bookEntry
      ? state.dragonBook
      : [...state.dragonBook, { date: today, text: bookEntry }];
  return countMission({ ...state, dragonBook }, today);
}
