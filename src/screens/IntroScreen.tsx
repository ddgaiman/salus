import { useGame } from '../app/GameContext';
import { Dragon } from '../components/Dragon';
import { Speaker } from '../components/Speaker';
import { ui } from '../content';

/** S1 Uvod */
export function IntroScreen({ onStart }: { onStart(): void }) {
  const { state, speak } = useGame();
  return (
    <main className="screen screen-intro" aria-label={ui.appName}>
      <header className="topbar">
        <span />
        <Speaker text={ui.intro.greeting} />
      </header>
      <h1 className="title">{ui.appName}</h1>
      <div className="hero-dragon bob">
        <Dragon stage={state.dragonStage} label={ui.map.toothlessHere} size={180} />
      </div>
      <p className="lead">{ui.intro.greeting}</p>
      <button
        type="button"
        className="btn btn-primary btn-big"
        aria-label={ui.intro.start}
        onClick={() => {
          speak(ui.intro.greeting);
          onStart();
        }}
      >
        {ui.intro.start}
      </button>
    </main>
  );
}
