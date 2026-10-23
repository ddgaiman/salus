// One test per safeguard from PRD chapter 4 (and the tone rules from chapter 9).
// Screen-level checks live in e2e/guards.spec.ts.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { answerTask } from './engine/game';
import { applyRewards, completeMission } from './engine/progress';
import { isBreakDue, clampMissionsBeforeBreak } from './engine/session';
import { createInitialState } from './engine/state';
import type { TaskPlan } from './engine/review';

const today = '2026-10-23';
const plan: TaskPlan = {
  skillId: 'addsub',
  level: 1,
  seed: 's',
  isReview: false,
  fromQueue: false,
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|css|json)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}
const sources = sourceFiles(dirname(fileURLToPath(import.meta.url))).map((p) => ({
  p,
  text: readFileSync(p, 'utf8'),
}));

describe('safeguards', () => {
  it('a break follows N missions; N is set by a parent between 1 and 5', () => {
    let s = createInitialState(today);
    for (let i = 0; i < 3; i++) s = completeMission(s, 'x', today);
    expect(isBreakDue(s, today)).toBe(true);
    expect([0, 6].map(clampMissionsBeforeBreak)).toEqual([1, 5]);
  });

  it('has no streaks: the save has no streak field and a missed day changes nothing', () => {
    const s = createInitialState(today);
    expect(JSON.stringify(s).toLowerCase()).not.toMatch(/streak|niz/);
    const later = completeMission(s, 'x', '2026-11-30');
    expect(later.dragonStage).toBe(s.dragonStage);
    expect(later.abilities).toEqual(s.abilities);
  });

  it('rewards come only from knowledge, never from chance or time played', () => {
    let s = createInitialState(today);
    // Many finished missions with wrong answers give no ability, island or growth.
    for (let i = 0; i < 30; i++) {
      const r = answerTask(s, plan, 3, i);
      s = applyRewards(r.state, r.events).state;
      s = completeMission(s, 'x', today);
    }
    expect(s.abilities).toEqual([]);
    expect(s.unlockedIslands).toEqual([]);
    expect(s.dragonStage).toBe(1);
    // The same answers always give the same rewards.
    const run = () => {
      let t = createInitialState(today);
      for (let i = 0; i < 10; i++) {
        const r = answerTask(t, plan, 0, i);
        t = applyRewards(r.state, r.events).state;
      }
      return t.abilities;
    };
    expect(run()).toEqual(['addsub-2']);
    expect(run()).toEqual(run());
  });

  it('makes no network calls, has no tracking, ads, purchases or notifications', () => {
    const forbidden =
      /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|Notification|PushManager|PaymentRequest|https?:\/\/(?!www\.w3\.org)/;
    for (const { p, text } of sources) expect(text, p).not.toMatch(forbidden);
  });

  it('never uses random rewards; randomness is only for the adult gate and task seeds', () => {
    for (const { p, text } of sources) {
      if (!text.includes('Math.random')) continue;
      expect(p).toMatch(/ParentScreen\.tsx$/);
    }
  });

  it('shows no red crosses and plays no failure sounds', () => {
    for (const { p, text } of sources) {
      expect(text, p).not.toMatch(/[✗✘❌]|fail\.mp3|error\.mp3|buzz/i);
    }
  });

  it('has no auto-continue: nothing schedules the next mission', () => {
    for (const { p, text } of sources) {
      if (!/screens|App\.tsx/.test(p)) continue;
      expect(text, p).not.toMatch(/setTimeout|setInterval/);
    }
  });
});
