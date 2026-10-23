import { beforeEach, describe, expect, it } from 'vitest';
import { answerTask } from '../engine/game';
import { createInitialState } from '../engine/state';
import {
  BACKUP_KEY,
  NOTICE_KEY,
  STORAGE_KEY,
  clearNotice,
  isValidState,
  loadState,
  migrate,
  readNotice,
  resetProgress,
  saveState,
} from './storage';

const today = '2026-10-23';

class MemoryStore {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

let store: MemoryStore;
beforeEach(() => {
  store = new MemoryStore();
});

describe('storage', () => {
  it('starts fresh when nothing is saved', () => {
    const r = loadState(today, store);
    expect(r.status).toBe('new');
    expect(r.state).toEqual(createInitialState(today));
  });

  it('saves and loads under zau:v1', () => {
    const s = { ...createInitialState(today), heroId: 'kamikazi' as const, abilities: ['a'] };
    expect(saveState(s, store)).toBe(true);
    expect(store.data.has(STORAGE_KEY)).toBe(true);
    const r = loadState(today, store);
    expect(r).toEqual({ status: 'loaded', state: s });
  });

  it('resets safely on broken JSON and keeps a backup and a parent notice', () => {
    store.setItem(STORAGE_KEY, '{not json');
    const r = loadState(today, store);
    expect(r.status).toBe('reset');
    expect(r.status === 'reset' && r.reason).toBe('corrupt');
    expect(r.state).toEqual(createInitialState(today));
    expect(store.getItem(BACKUP_KEY)).toBe('{not json');
    expect(readNotice(store)).toBe('corrupt');
    clearNotice(store);
    expect(store.getItem(NOTICE_KEY)).toBeNull();
  });

  it('resets on valid JSON with a broken shape', () => {
    store.setItem(STORAGE_KEY, JSON.stringify({ ...createInitialState(today), skills: null }));
    expect(loadState(today, store)).toMatchObject({ status: 'reset', reason: 'corrupt' });
  });

  it('resets on an unknown schema version', () => {
    store.setItem(STORAGE_KEY, JSON.stringify({ ...createInitialState(today), schemaVersion: 7 }));
    expect(loadState(today, store)).toMatchObject({ status: 'reset', reason: 'unknownVersion' });
  });

  it('migrates a save without a schema version', () => {
    store.setItem(STORAGE_KEY, JSON.stringify({ heroId: 'viki', abilities: ['x'] }));
    const r = loadState(today, store);
    expect(r.status).toBe('migrated');
    expect(r.state.heroId).toBe('viki');
    expect(r.state.schemaVersion).toBe(1);
    expect(JSON.parse(store.getItem(STORAGE_KEY)!).schemaVersion).toBe(1);
  });

  it('returns null from migrate for non-objects', () => {
    expect(migrate('x', today)).toBeNull();
    expect(migrate({ schemaVersion: 'one' }, today)).toBeNull();
  });

  it('caps the log at 500 entries and clamps the break setting', () => {
    let s = createInitialState(today);
    const plan = { skillId: 'addsub' as const, level: 1 as const, seed: 's', isReview: true };
    for (let i = 0; i < 20; i++) s = answerTask(s, { ...plan, fromQueue: false }, 0, i).state;
    const big = { ...s, log: Array.from({ length: 600 }, (_, i) => ({ ...s.log[0]!, ts: i })) };
    big.settings = { ...big.settings, missionsBeforeBreak: 99 };
    saveState(big, store);
    const r = loadState(today, store);
    expect(r.state.log).toHaveLength(500);
    expect(r.state.log[0]?.ts).toBe(100);
    expect(r.state.settings.missionsBeforeBreak).toBe(5);
  });

  it('survives an unavailable or failing store', () => {
    expect(loadState(today, null).status).toBe('new');
    expect(saveState(createInitialState(today), null)).toBe(false);
    const failing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadState(today, failing).status).toBe('new');
    expect(saveState(createInitialState(today), failing)).toBe(false);
    expect(readNotice(failing)).toBeNull();
    expect(() => clearNotice(failing)).not.toThrow();
  });

  it('keeps settings on a parent reset', () => {
    const s = createInitialState(today);
    s.settings.missionsBeforeBreak = 2;
    s.heroId = 'viki';
    const r = resetProgress(s, today);
    expect(r.heroId).toBeNull();
    expect(r.settings.missionsBeforeBreak).toBe(2);
  });

  it('validates every field', () => {
    const good = createInitialState(today);
    expect(isValidState(good)).toBe(true);
    const bad: Array<Record<string, unknown>> = [
      { heroId: 'stoick' },
      { reviewQueue: [{ skillId: 'x', level: 1, taskSeed: 's' }] },
      { dragonStage: 6 },
      { abilities: [1] },
      { unlockedIslands: 'x' },
      { dragonBook: [{ date: 1, text: 'x' }] },
      { session: { missionsToday: '1', date: today } },
      { settings: { missionsBeforeBreak: 3, voice: 'loud' } },
      { log: [{ ts: 1, skillId: 'addsub', level: 1 }] },
    ];
    for (const patch of bad) expect(isValidState({ ...good, ...patch })).toBe(false);
  });
});
