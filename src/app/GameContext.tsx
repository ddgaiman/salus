import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { localDate } from '../engine/state';
import type { SaveState } from '../engine/types';
import { speak as speakText } from '../audio/speech';
import { clearNotice, loadState, readNotice, saveState } from '../storage/storage';

interface GameApi {
  state: SaveState;
  /** Latest state, also between renders. */
  current(): SaveState;
  commit(next: SaveState): void;
  today(): string;
  notice: string | null;
  dismissNotice(): void;
  speak(text: string): void;
}

const GameContext = createContext<GameApi | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SaveState>(() => loadState(localDate()).state);
  const ref = useRef(state);
  const [notice, setNotice] = useState<string | null>(() => readNotice());

  const commit = useCallback((next: SaveState) => {
    ref.current = next;
    saveState(next);
    setState(next);
  }, []);

  const speak = useCallback((text: string) => speakText(text, ref.current.settings.voice), []);

  const api = useMemo<GameApi>(
    () => ({
      state,
      current: () => ref.current,
      commit,
      today: () => localDate(),
      notice,
      dismissNotice: () => {
        clearNotice();
        setNotice(null);
      },
      speak,
    }),
    [state, commit, notice, speak],
  );

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameApi {
  const api = useContext(GameContext);
  if (!api) throw new Error('useGame outside GameProvider');
  return api;
}
