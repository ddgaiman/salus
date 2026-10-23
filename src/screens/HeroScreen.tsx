import { useState } from 'react';
import { useGame } from '../app/GameContext';
import { heroes, ui } from '../content';
import type { HeroId } from '../engine/types';
import { HERO_IDS } from '../engine/types';

const COLORS: Record<HeroId, string> = {
  viki: '#e8a33d',
  smrkljasti: '#d9604c',
  kamikazi: '#8b6fd6',
};

/** S2 Izbira junaka: tap a card to hear it, tap Izberi to choose (2 taps). */
export function HeroScreen({ onChosen }: { onChosen(): void }) {
  const game = useGame();
  const [selected, setSelected] = useState<HeroId | null>(game.state.heroId);

  const choose = () => {
    if (!selected) return;
    game.commit({ ...game.current(), heroId: selected });
    game.speak(heroes[selected].greeting);
    onChosen();
  };

  return (
    <main className="screen" aria-label={ui.heroSelect.title}>
      <h1 className="title">{ui.heroSelect.title}</h1>
      <div className="hero-cards">
        {HERO_IDS.map((id) => {
          const h = heroes[id];
          return (
            <button
              key={id}
              type="button"
              className={`hero-card${selected === id ? ' is-selected' : ''}`}
              aria-pressed={selected === id}
              aria-label={`${h.name}. ${h.description}`}
              onClick={() => {
                setSelected(id);
                game.speak(`${h.name}. ${h.description}`);
              }}
            >
              <span className="hero-avatar" style={{ background: COLORS[id] }} aria-hidden="true">
                {h.name[0]}
              </span>
              <span className="hero-name">{h.name}</span>
              <span className="hero-desc">{h.description}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="btn btn-primary btn-big"
        aria-label={ui.heroSelect.choose}
        disabled={!selected}
        onClick={choose}
      >
        {ui.heroSelect.choose}
      </button>
    </main>
  );
}
