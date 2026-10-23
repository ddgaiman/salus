import { LOG_MAX } from '../engine/config';
import { clampMissionsBeforeBreak } from '../engine/session';
import { createInitialState } from '../engine/state';
import type { SaveState, SkillState } from '../engine/types';
import { HERO_IDS, SKILL_IDS } from '../engine/types';

export const STORAGE_KEY = 'zau:v1';
/** Copy of unreadable data kept after a reset, so nothing is silently lost. */
export const BACKUP_KEY = 'zau:backup';
/** Set after a reset; the parent corner shows it until dismissed. */
export const NOTICE_KEY = 'zau:notice';

export type LoadResult =
  | { status: 'new' | 'loaded' | 'migrated'; state: SaveState }
  | { status: 'reset'; state: SaveState; reason: 'corrupt' | 'unknownVersion' };

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function defaultStore(): Store | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isString = (v: unknown): v is string => typeof v === 'string';
const isLevel = (v: unknown) => v === 1 || v === 2 || v === 3 || v === 4;

function isSkill(v: unknown): v is SkillState {
  return (
    isObject(v) &&
    isLevel(v.level) &&
    Array.isArray(v.window) &&
    v.window.every(isNumber) &&
    typeof v.mastered === 'boolean'
  );
}

/** Structural check of a version 1 save. */
export function isValidState(v: unknown): v is SaveState {
  if (!isObject(v) || v.schemaVersion !== 1) return false;
  if (v.heroId !== null && !HERO_IDS.includes(v.heroId as never)) return false;
  if (!isObject(v.skills) || !SKILL_IDS.every((id) => isSkill((v.skills as never)[id])))
    return false;
  if (
    !Array.isArray(v.reviewQueue) ||
    !v.reviewQueue.every(
      (r) =>
        isObject(r) &&
        SKILL_IDS.includes(r.skillId as never) &&
        isNumber(r.level) &&
        isString(r.taskSeed),
    )
  )
    return false;
  if (![1, 2, 3, 4, 5].includes(v.dragonStage as number)) return false;
  if (!Array.isArray(v.abilities) || !v.abilities.every(isString)) return false;
  if (!Array.isArray(v.unlockedIslands) || !v.unlockedIslands.every(isString)) return false;
  if (
    !Array.isArray(v.dragonBook) ||
    !v.dragonBook.every((e) => isObject(e) && isString(e.date) && isString(e.text))
  )
    return false;
  if (!isObject(v.session) || !isNumber(v.session.missionsToday) || !isString(v.session.date))
    return false;
  if (
    !isObject(v.settings) ||
    !isNumber(v.settings.missionsBeforeBreak) ||
    (v.settings.voice !== 'recorded' && v.settings.voice !== 'tts')
  )
    return false;
  return (
    Array.isArray(v.log) &&
    v.log.every(
      (e) =>
        isObject(e) &&
        isNumber(e.ts) &&
        SKILL_IDS.includes(e.skillId as never) &&
        isNumber(e.level) &&
        isNumber(e.score),
    )
  );
}

/** Keeps values inside their allowed ranges. */
function normalize(state: SaveState): SaveState {
  return {
    ...state,
    settings: {
      ...state.settings,
      missionsBeforeBreak: clampMissionsBeforeBreak(state.settings.missionsBeforeBreak),
    },
    log: state.log.slice(-LOG_MAX),
  };
}

/**
 * Migrations from older schema versions to version 1, keyed by source version.
 * Version 0 is a save written before the schemaVersion field existed.
 */
const migrations: Record<number, (old: Record<string, unknown>, today: string) => unknown> = {
  0: (old, today) => ({ ...createInitialState(today), ...old, schemaVersion: 1 }),
};

export function migrate(raw: unknown, today: string): SaveState | null {
  if (!isObject(raw)) return null;
  const version = raw.schemaVersion === undefined ? 0 : raw.schemaVersion;
  if (version === 1) return isValidState(raw) ? raw : null;
  const step = isNumber(version) ? migrations[version] : undefined;
  if (!step) return null;
  const next = step(raw, today);
  return isValidState(next) ? next : null;
}

export function loadState(today: string, store: Store | null = defaultStore()): LoadResult {
  const fresh = createInitialState(today);
  if (!store) return { status: 'new', state: fresh };
  let text: string | null;
  try {
    text = store.getItem(STORAGE_KEY);
  } catch {
    return { status: 'new', state: fresh };
  }
  if (text === null) return { status: 'new', state: fresh };

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return reset(store, text, fresh, 'corrupt');
  }

  const version = isObject(raw) ? raw.schemaVersion : undefined;
  const migrated = migrate(raw, today);
  if (!migrated) {
    const known =
      version === undefined || version === 1 || (isNumber(version) && version in migrations);
    return reset(store, text, fresh, known ? 'corrupt' : 'unknownVersion');
  }
  const state = normalize(migrated);
  if (version !== 1) {
    saveState(state, store);
    return { status: 'migrated', state };
  }
  return { status: 'loaded', state };
}

function reset(
  store: Store,
  text: string,
  fresh: SaveState,
  reason: 'corrupt' | 'unknownVersion',
): LoadResult {
  try {
    store.setItem(BACKUP_KEY, text);
    store.setItem(NOTICE_KEY, reason);
  } catch {
    // Storage full or unavailable; the reset still happens in memory.
  }
  saveState(fresh, store);
  return { status: 'reset', state: fresh, reason };
}

export function saveState(state: SaveState, store: Store | null = defaultStore()): boolean {
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(normalize(state)));
    return true;
  } catch {
    return false;
  }
}

export function readNotice(store: Store | null = defaultStore()): string | null {
  try {
    return store?.getItem(NOTICE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function clearNotice(store: Store | null = defaultStore()): void {
  try {
    store?.removeItem(NOTICE_KEY);
  } catch {
    // Nothing to clear.
  }
}

/** Parent reset: a fresh start that keeps the parent's settings. */
export function resetProgress(state: SaveState, today: string): SaveState {
  return { ...createInitialState(today), settings: state.settings };
}
