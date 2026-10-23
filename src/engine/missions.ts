import { MAX_MISSIONS_OFFERED, WINDOW_SIZE } from './config';
import type { SaveState, SkillId } from './types';
import { SKILL_IDS } from './types';

/** Average score of the last answers of a skill, or null if it has not been played yet. */
export function successRate(state: SaveState, skillId: SkillId): number | null {
  const recent = state.log.filter((e) => e.skillId === skillId).slice(-WINDOW_SIZE);
  if (recent.length === 0) return null;
  return recent.reduce((sum, e) => sum + e.score, 0) / recent.length;
}

export const baseIsland = (skillId: SkillId) => `island-${skillId}`;
export const bonusIsland = (skillId: SkillId) => `bonus-${skillId}`;

export interface MissionOffer {
  skillId: SkillId;
  islandId: string;
}

/**
 * At most MAX_MISSIONS_OFFERED missions, one per skill. A mastered skill moves to its
 * unlocked bonus island. Skills with the lowest success rate (unplayed first) come first.
 */
export function offerMissions(state: SaveState): MissionOffer[] {
  const rank = (id: SkillId) => successRate(state, id) ?? -1;
  return [...SKILL_IDS]
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, MAX_MISSIONS_OFFERED)
    .map((skillId) => ({
      skillId,
      islandId: state.unlockedIslands.includes(bonusIsland(skillId))
        ? bonusIsland(skillId)
        : baseIsland(skillId),
    }));
}

/** Number of missions already played for a skill, used to rotate mission stories. */
export function missionIndex(state: SaveState, skillId: SkillId, tasksPerMission: number): number {
  return Math.floor(state.log.filter((e) => e.skillId === skillId).length / tasksPerMission);
}
