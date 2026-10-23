import { format, ui } from '../content';
import type { Task } from '../engine/task';

/** G2 Zmajski zemljevid: tap the right island or the stone that fills the gap. */
export function DragonMap({
  task,
  onAnswer,
  disabled,
}: {
  task: Task;
  onAnswer(n: number): void;
  disabled: boolean;
}) {
  const v = task.visual;
  if (v.kind === 'islands') {
    return (
      <div className="islands">
        {[v.a, v.b].map((n, i) => (
          <button
            key={i}
            type="button"
            className={`island-btn island-${i}`}
            aria-label={format(ui.game.island, { n })}
            disabled={disabled}
            onClick={() => onAnswer(n)}
          >
            <span className="island-shape" aria-hidden="true" />
            <span className="island-steps">{n}</span>
          </button>
        ))}
      </div>
    );
  }
  if (v.kind !== 'sequence') return null;
  return (
    <div className="sequence-game">
      <ol className="stones">
        {v.terms.map((t, i) =>
          t === null ? (
            <li key={i} className="stone stone-hole" aria-label={ui.game.hole}>
              ?
            </li>
          ) : (
            <li key={i} className="stone">
              {t}
            </li>
          ),
        )}
      </ol>
      <div className="choices">
        {task.choices.map((n) => (
          <button
            key={n}
            type="button"
            className="choice"
            aria-label={format(ui.game.choice, { n })}
            disabled={disabled}
            onClick={() => onAnswer(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
