import { describe, expect, it } from 'vitest';
import { recordAnswer, scoreForMistakes, windowSum } from './adaptive';
import { createInitialState } from './state';
import type { Level, SkillsState } from './types';

const fresh = (): SkillsState => createInitialState('2026-10-23').skills;

function feed(skills: SkillsState, scores: number[]) {
  let s = skills;
  const events = [];
  for (const score of scores) {
    const r = recordAnswer(s, 'addsub', score);
    s = r.skills;
    events.push(...r.events);
  }
  return { skills: s, events };
}

const withLevel = (level: Level, window: number[] = []): SkillsState => ({
  ...fresh(),
  addsub: { level, window, mastered: false },
});

describe('scoreForMistakes', () => {
  it('scores 1, 0.5 and 0', () => {
    expect(scoreForMistakes(0)).toBe(1);
    expect(scoreForMistakes(1)).toBe(0.5);
    expect(scoreForMistakes(2)).toBe(0);
    expect(scoreForMistakes(3)).toBe(0);
  });
});

describe('recordAnswer', () => {
  it('does not evaluate a window with fewer than 10 answers', () => {
    const { skills, events } = feed(fresh(), Array(9).fill(1));
    expect(events).toEqual([]);
    expect(skills.addsub.level).toBe(1);
    expect(skills.addsub.window).toHaveLength(9);
  });

  it('levels up at sum >= 9 and clears the window', () => {
    const { skills, events } = feed(fresh(), [...Array(9).fill(1), 0]);
    expect(windowSum([...Array(9).fill(1), 0])).toBe(9);
    expect(events).toEqual([{ type: 'levelUp', skillId: 'addsub', level: 2 }]);
    expect(skills.addsub.level).toBe(2);
    expect(skills.addsub.window).toEqual([]);
  });

  it('keeps the level for sums from 7 to 8.5', () => {
    const r1 = feed(withLevel(2), [...Array(8).fill(1), 0.5, 0]);
    expect(r1.events).toEqual([]);
    expect(r1.skills.addsub.level).toBe(2);
    const r2 = feed(withLevel(2), [...Array(7).fill(1), 0, 0, 0]);
    expect(r2.events).toEqual([]);
    expect(r2.skills.addsub.level).toBe(2);
  });

  it('levels down at sum <= 6.5 and clears the window', () => {
    const { skills, events } = feed(withLevel(3), [...Array(6).fill(1), 0.5, 0, 0, 0]);
    expect(events).toEqual([{ type: 'levelDown', skillId: 'addsub', level: 2 }]);
    expect(skills.addsub.level).toBe(2);
    expect(skills.addsub.window).toEqual([]);
  });

  it('never goes below level 1', () => {
    const { skills, events } = feed(fresh(), Array(10).fill(0));
    expect(events).toEqual([]);
    expect(skills.addsub.level).toBe(1);
  });

  it('never goes above level 4 and masters the skill instead', () => {
    const { skills, events } = feed(withLevel(4), Array(10).fill(1));
    expect(skills.addsub.level).toBe(4);
    expect(skills.addsub.mastered).toBe(true);
    expect(events).toEqual([{ type: 'skillMastered', skillId: 'addsub' }]);
  });

  it('fires skillMastered only once', () => {
    const { events } = feed(withLevel(4), Array(15).fill(1));
    expect(events.filter((e) => e.type === 'skillMastered')).toHaveLength(1);
  });

  it('keeps a sliding window of the last 10 answers', () => {
    const start = withLevel(2, [0, 0, 0, 1, 1, 1, 1, 1, 1]);
    // 10th answer: sum = 7 -> stays.
    const r1 = recordAnswer(start, 'addsub', 1);
    expect(r1.skills.addsub.window).toHaveLength(10);
    // 11th answer pushes the oldest 0 out: sum = 8 -> stays, window still 10 long.
    const r2 = recordAnswer(r1.skills, 'addsub', 1);
    expect(r2.skills.addsub.window).toHaveLength(10);
    expect(windowSum(r2.skills.addsub.window)).toBe(8);
  });

  it('does not change other skills or the input object', () => {
    const before = fresh();
    const r = recordAnswer(before, 'compare', 1);
    expect(before.compare.window).toEqual([]);
    expect(r.skills.addsub).toBe(before.addsub);
  });
});
