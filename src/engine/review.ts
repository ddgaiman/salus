import { REVIEW_AFTER_MISTAKES, REVIEW_EVERY, REVIEW_QUEUE_MAX } from './config';
import type { Level, ReviewEntry, SkillId, SkillsState } from './types';
import { SKILL_IDS } from './types';

export function shouldQueueForReview(mistakes: number): boolean {
  return mistakes >= REVIEW_AFTER_MISTAKES;
}

export function addToReview(queue: readonly ReviewEntry[], entry: ReviewEntry): ReviewEntry[] {
  const exists = queue.some(
    (q) => q.skillId === entry.skillId && q.level === entry.level && q.taskSeed === entry.taskSeed,
  );
  if (exists) return [...queue];
  return [...queue, entry].slice(-REVIEW_QUEUE_MAX);
}

/** Task numbers start at 1; every REVIEW_EVERY-th task is a review task. */
export function isReviewSlot(taskNumber: number): boolean {
  return taskNumber > 0 && taskNumber % REVIEW_EVERY === 0;
}

export interface TaskPlan {
  skillId: SkillId;
  level: Level;
  seed: string;
  isReview: boolean;
  /** Set when the task came from the review queue, so it can be removed once solved. */
  fromQueue: boolean;
}

/**
 * Picks the source of a review task, in order of preference:
 * 1. the review queue, same skill first;
 * 2. a lower, already passed level of the current skill;
 * 3. another skill that is already mastered.
 * Returns null when nothing is available for review.
 */
export function pickReview(
  skills: SkillsState,
  queue: readonly ReviewEntry[],
  skillId: SkillId,
  seed: string,
): TaskPlan | null {
  const queued = queue.find((q) => q.skillId === skillId) ?? queue[0];
  if (queued) {
    return {
      skillId: queued.skillId,
      level: clampLevel(queued.level),
      seed: queued.taskSeed,
      isReview: true,
      fromQueue: true,
    };
  }
  const own = skills[skillId];
  if (own.level > 1) {
    return {
      skillId,
      level: (own.level - 1) as Level,
      seed,
      isReview: true,
      fromQueue: false,
    };
  }
  const other = SKILL_IDS.find((id) => id !== skillId && skills[id].mastered);
  if (other) {
    return { skillId: other, level: 4, seed, isReview: true, fromQueue: false };
  }
  return null;
}

export function removeFromReview(queue: readonly ReviewEntry[], plan: TaskPlan): ReviewEntry[] {
  if (!plan.fromQueue) return [...queue];
  const index = queue.findIndex(
    (q) => q.skillId === plan.skillId && q.level === plan.level && q.taskSeed === plan.seed,
  );
  return index < 0 ? [...queue] : [...queue.slice(0, index), ...queue.slice(index + 1)];
}

/** Plans the task with the given 1-based number inside a mission. */
export function planTask(
  skills: SkillsState,
  queue: readonly ReviewEntry[],
  skillId: SkillId,
  taskNumber: number,
  seed: string,
): TaskPlan {
  if (isReviewSlot(taskNumber)) {
    const review = pickReview(skills, queue, skillId, seed);
    if (review) return review;
  }
  return { skillId, level: skills[skillId].level, seed, isReview: false, fromQueue: false };
}

function clampLevel(level: number): Level {
  return Math.min(4, Math.max(1, Math.round(level))) as Level;
}
