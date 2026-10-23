import { describe, expect, it } from 'vitest';
import { applyRewards, completeMission, stageFor } from './progress';
import { createInitialState } from './state';
import type { SaveState } from './types';

const today = '2026-10-23';
const base = (): SaveState => createInitialState(today);

describe('rewards', () => {
  it('gives an ability on levelUp, once', () => {
    const r1 = applyRewards(base(), [{ type: 'levelUp', skillId: 'addsub', level: 2 }]);
    expect(r1.rewards.abilities).toEqual(['addsub-2']);
    const r2 = applyRewards(r1.state, [{ type: 'levelUp', skillId: 'addsub', level: 2 }]);
    expect(r2.rewards.abilities).toEqual([]);
    expect(r2.state.abilities).toEqual(['addsub-2']);
  });

  it('unlocks a bonus island on skillMastered, once', () => {
    const r1 = applyRewards(base(), [{ type: 'skillMastered', skillId: 'muldiv' }]);
    expect(r1.rewards.islands).toEqual(['bonus-muldiv']);
    expect(
      applyRewards(r1.state, [{ type: 'skillMastered', skillId: 'muldiv' }]).rewards.islands,
    ).toEqual([]);
  });

  it('gives nothing for levelDown or no events', () => {
    const r = applyRewards(base(), [{ type: 'levelDown', skillId: 'addsub', level: 1 }]);
    expect(r.rewards).toEqual({ abilities: [], islands: [], stageFrom: 1, stageTo: 1 });
  });

  it('grows the dragon when all skills share a level, and never shrinks it', () => {
    const s = base();
    s.skills.addsub.level = 2;
    s.skills.compare.level = 2;
    expect(stageFor(s)).toBe(1);
    s.skills.muldiv.level = 2;
    expect(stageFor(s)).toBe(2);
    const grown = applyRewards(s, []).state;
    expect(grown.dragonStage).toBe(2);
    grown.skills.muldiv.level = 1;
    expect(stageFor(grown)).toBe(2);
  });

  it('reaches stage 5 only when every skill is mastered', () => {
    const s = base();
    for (const id of ['addsub', 'compare', 'muldiv'] as const)
      s.skills[id] = { level: 4, window: [], mastered: true };
    expect(stageFor(s)).toBe(5);
    s.skills.compare.mastered = false;
    s.dragonStage = 1;
    expect(stageFor(s)).toBe(4);
  });
});

describe('completeMission', () => {
  it('adds a book entry once per day and counts the mission', () => {
    let s = completeMission(base(), 'Znaš seštevati do 10.', today);
    s = completeMission(s, 'Znaš seštevati do 10.', today);
    expect(s.dragonBook).toEqual([{ date: today, text: 'Znaš seštevati do 10.' }]);
    expect(s.session.missionsToday).toBe(2);
    expect(completeMission(base(), '', today).dragonBook).toEqual([]);
  });
});
