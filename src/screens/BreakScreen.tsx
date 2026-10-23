import { useEffect } from 'react';
import { useGame } from '../app/GameContext';
import { Dragon } from '../components/Dragon';
import { ui } from '../content';

/**
 * S8 Premor. Deliberately has no way to continue playing; only the parent key is offered,
 * behind the adult gate, so a parent can change settings.
 */
export function BreakScreen({ onParent }: { onParent(): void }) {
  const { state, speak } = useGame();
  useEffect(() => speak(`${ui.break.title}. ${ui.break.text}`), [speak]);
  return (
    <main className="screen screen-break" aria-label={ui.break.title}>
      <header className="topbar">
        <span />
        <button
          type="button"
          className="icon-btn icon-quiet"
          aria-label={ui.map.parentKey}
          onClick={onParent}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <circle cx="8" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M12 12h9M18 12v3M21 12v3" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </button>
      </header>
      <div className="night">
        <Dragon stage={state.dragonStage} mood="sleep" label={ui.break.sleeping} size={200} />
      </div>
      <h1 className="title">{ui.break.title}</h1>
      <p className="lead">{ui.break.text}</p>
    </main>
  );
}
