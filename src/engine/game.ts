import { scoreForMistakes, recordAnswer } from './adaptive';
import { LOG_MAX } from './config';
import type { TaskPlan } from './review';
import { addToReview, removeFromReview, shouldQueueForReview } from './review';
import type { EngineEvent, SaveState } from './types';

/**
 * Applies a finished task (answered correctly after `mistakes` wrong attempts).
 * Review tasks are logged but do not move the level window.
 */
export function answerTask(
  state: SaveState,
  plan: TaskPlan,
  mistakes: number,
  now: number,
): { state: SaveState; events: EngineEvent[] } {
  const score = scoreForMistakes(mistakes);
  let skills = state.skills;
  let events: EngineEvent[] = [];
  if (!plan.isReview) {
    const result = recordAnswer(state.skills, plan.skillId, score);
    skills = result.skills;
    events = result.events;
  }

  let reviewQueue = state.reviewQueue;
  if (shouldQueueForReview(mistakes)) {
    reviewQueue = addToReview(reviewQueue, {
      skillId: plan.skillId,
      level: plan.level,
      taskSeed: plan.seed,
    });
  } else if (plan.fromQueue) {
    reviewQueue = removeFromReview(reviewQueue, plan);
  }

  const log = [...state.log, { ts: now, skillId: plan.skillId, level: plan.level, score }].slice(
    -LOG_MAX,
  );

  return { state: { ...state, skills, reviewQueue, log }, events };
}
