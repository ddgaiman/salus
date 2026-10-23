import { describe, expect, it } from 'vitest';
import {
  addToReview,
  isReviewSlot,
  pickReview,
  planTask,
  removeFromReview,
  shouldQueueForReview,
} from './review';
import { createInitialState } from './state';
import type { ReviewEntry, SkillsState } from './types';

const skills = (): SkillsState => createInitialState('2026-10-23').skills;
const entry: ReviewEntry = { skillId: 'addsub', level: 2, taskSeed: 'x' };

describe('review queue', () => {
  it('queues a task only after the 3rd mistake', () => {
    expect(shouldQueueForReview(2)).toBe(false);
    expect(shouldQueueForReview(3)).toBe(true);
  });

  it('does not add duplicates and caps the queue', () => {
    expect(addToReview([entry], entry)).toHaveLength(1);
    let q: ReviewEntry[] = [];
    for (let i = 0; i < 30; i++) q = addToReview(q, { ...entry, taskSeed: `s${i}` });
    expect(q).toHaveLength(20);
    expect(q[19]?.taskSeed).toBe('s29');
  });

  it('marks every 5th task as a review slot', () => {
    expect([1, 2, 3, 4, 5, 10].map(isReviewSlot)).toEqual([false, false, false, false, true, true]);
    expect(isReviewSlot(0)).toBe(false);
  });

  it('prefers the queue, same skill first', () => {
    const q: ReviewEntry[] = [{ skillId: 'compare', level: 1, taskSeed: 'c' }, entry];
    expect(pickReview(skills(), q, 'addsub', 'new')).toMatchObject({
      skillId: 'addsub',
      level: 2,
      seed: 'x',
      fromQueue: true,
    });
    expect(pickReview(skills(), q, 'muldiv', 'new')).toMatchObject({ skillId: 'compare' });
  });

  it('falls back to a lower level, then a mastered skill, then nothing', () => {
    const s = skills();
    s.addsub = { level: 3, window: [], mastered: false };
    expect(pickReview(s, [], 'addsub', 'n')).toMatchObject({ level: 2, isReview: true });
    s.compare = { level: 4, window: [], mastered: true };
    expect(pickReview(s, [], 'muldiv', 'n')).toMatchObject({ skillId: 'compare', level: 4 });
    expect(pickReview(skills(), [], 'muldiv', 'n')).toBeNull();
  });

  it('plans a normal task outside review slots and when nothing can be reviewed', () => {
    expect(planTask(skills(), [entry], 'addsub', 1, 's')).toMatchObject({ isReview: false });
    expect(planTask(skills(), [], 'addsub', 5, 's')).toMatchObject({ isReview: false, level: 1 });
    expect(planTask(skills(), [entry], 'addsub', 5, 's')).toMatchObject({ isReview: true });
  });

  it('removes a solved queued task', () => {
    const plan = { skillId: 'addsub' as const, level: 2 as const, seed: 'x', isReview: true };
    expect(removeFromReview([entry], { ...plan, fromQueue: true })).toEqual([]);
    expect(removeFromReview([entry], { ...plan, fromQueue: false })).toEqual([entry]);
    expect(removeFromReview([entry], { ...plan, seed: 'y', fromQueue: true })).toEqual([entry]);
  });
});
