import { useGame } from '../app/GameContext';
import { Dragon } from '../components/Dragon';
import { abilityOf, stageOf, ui } from '../content';

/** Otrokova knjiga zmajev: what the child has learned and what Brezzobi can do. */
export function BookScreen({ onBack }: { onBack(): void }) {
  const { state } = useGame();
  const stage = stageOf(state.dragonStage);
  return (
    <main className="screen" aria-label={ui.book.title}>
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label={ui.book.back} onClick={onBack}>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="3" fill="none" />
          </svg>
        </button>
        <h1 className="title title-small">{ui.book.title}</h1>
        <span />
      </header>
      <section className="card">
        <Dragon stage={state.dragonStage} label={ui.map.toothlessHere} size={90} />
        <h2>
          {ui.map.stage} {state.dragonStage}: {stage.name}
        </h2>
        <p>{stage.description}</p>
      </section>
      <section className="card">
        <h2>{ui.book.abilities}</h2>
        <ul className="list">
          {state.abilities.map((id) => (
            <li key={id}>
              <strong>{abilityOf(id)?.name}</strong>: {abilityOf(id)?.description}
            </li>
          ))}
        </ul>
      </section>
      <section className="card">
        {state.dragonBook.length === 0 ? (
          <p>{ui.book.empty}</p>
        ) : (
          <ul className="list">
            {[...state.dragonBook].reverse().map((e, i) => (
              <li key={i}>
                <span className="muted">{e.date}</span> {e.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
