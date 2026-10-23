import { describe, expect, it } from 'vitest';
import { answerTask } from './game';
import { createInitialState, localDate } from './state';
import type { TaskPlan } from './review';
import { clampMissionsBeforeBreak, countMission, isBreakDue, missionsToday } from './session';
import { missionIndex, offerMissions, successRate } from './missions';
import { createRng, hashSeed } from './rng';

const today = '2026-10-23';
const plan: TaskPlan = {
  skillId: 'addsub',
  level: 1,
  seed: 's',
  isReview: false,
  fromQueue: false,
};

describe('answerTask', () => {
  it('scores, logs and updates the window', () => {
    const { state } = answerTask(createInitialState(today), plan, 1, 42);
    expect(state.skills.addsub.window).toEqual([0.5]);
    expect(state.log).toEqual([{ ts: 42, skillId: 'addsub', level: 1, score: 0.5 }]);
  });

  it('queues after 3 mistakes and removes a solved queued task', () => {
    const queued = answerTask(createInitialState(today), plan, 3, 1).state;
    expect(queued.reviewQueue).toEqual([{ skillId: 'addsub', level: 1, taskSeed: 's' }]);
    const solved = answerTask(queued, { ...plan, isReview: true, fromQueue: true }, 0, 2).state;
    expect(solved.reviewQueue).toEqual([]);
  });

  it('does not move the window for review tasks', () => {
    const { state } = answerTask(createInitialState(today), { ...plan, isReview: true }, 0, 1);
    expect(state.skills.addsub.window).toEqual([]);
    expect(state.log).toHaveLength(1);
  });

  it('caps the log at 500 entries', () => {
    let state = createInitialState(today);
    for (let i = 0; i < 510; i++)
      state = answerTask(state, { ...plan, isReview: true }, 0, i).state;
    expect(state.log).toHaveLength(500);
    expect(state.log[0]?.ts).toBe(10);
  });

  it('emits engine events', () => {
    let state = createInitialState(today);
    const events = [];
    for (let i = 0; i < 10; i++) {
      const r = answerTask(state, plan, 0, i);
      state = r.state;
      events.push(...r.events);
    }
    expect(events).toEqual([{ type: 'levelUp', skillId: 'addsub', level: 2 }]);
  });
});

describe('session and break', () => {
  it('counts missions per day and starts fresh on a new day', () => {
    let s = createInitialState(today);
    s = countMission(countMission(s, today), today);
    expect(missionsToday(s, today)).toBe(2);
    expect(isBreakDue(s, today)).toBe(false);
    s = countMission(s, today);
    expect(isBreakDue(s, today)).toBe(true);
    expect(isBreakDue(s, '2026-10-24')).toBe(false);
    expect(countMission(s, '2026-10-24').session).toEqual({ date: '2026-10-24', missionsToday: 1 });
  });

  it('respects the parent setting', () => {
    const s = createInitialState(today);
    s.settings.missionsBeforeBreak = 1;
    expect(isBreakDue(countMission(s, today), today)).toBe(true);
  });

  it('clamps the setting to 1 to 5', () => {
    expect([0, 1, 3, 5, 9, NaN, 2.6].map(clampMissionsBeforeBreak)).toEqual([1, 1, 3, 5, 5, 1, 3]);
  });

  it('formats the local date', () => {
    expect(localDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('mission offers', () => {
  it('offers at most 3 missions, lowest success first, unplayed first', () => {
    const s = createInitialState(today);
    s.log = [
      { ts: 1, skillId: 'addsub', level: 1, score: 1 },
      { ts: 2, skillId: 'compare', level: 1, score: 0 },
    ];
    expect(successRate(s, 'muldiv')).toBeNull();
    const offers = offerMissions(s);
    expect(offers.map((o) => o.skillId)).toEqual(['muldiv', 'compare', 'addsub']);
    expect(offers[0]?.islandId).toBe('island-muldiv');
  });

  it('moves a mastered skill to its unlocked bonus island', () => {
    const s = createInitialState(today);
    s.unlockedIslands = ['bonus-addsub'];
    expect(offerMissions(s).find((o) => o.skillId === 'addsub')?.islandId).toBe('bonus-addsub');
  });

  it('rotates mission stories by tasks played', () => {
    const s = createInitialState(today);
    s.log = Array.from({ length: 12 }, (_, i) => ({
      ts: i,
      skillId: 'addsub' as const,
      level: 1,
      score: 1,
    }));
    expect(missionIndex(s, 'addsub', 5)).toBe(2);
    expect(missionIndex(s, 'compare', 5)).toBe(0);
  });
});

describe('rng', () => {
  it('is deterministic and in range', () => {
    expect(hashSeed('a')).toBe(hashSeed('a'));
    const r1 = createRng('x');
    const r2 = createRng('x');
    for (let i = 0; i < 50; i++) {
      const n = r1.int(3, 7);
      expect(n).toBe(r2.int(3, 7));
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(7);
    }
    expect(() => createRng('x').pick([])).toThrow();
    expect(createRng('y').shuffle([1, 2, 3]).sort()).toEqual([1, 2, 3]);
  });
});
