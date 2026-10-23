import { useEffect } from 'react';
import { useGame } from '../app/GameContext';
import { Dragon } from '../components/Dragon';
import { Speaker } from '../components/Speaker';
import { islandOf, ui, type Mission } from '../content';
import type { MissionOffer } from '../engine/missions';

/** S4 Uvod v misijo */
export function MissionIntroScreen({
  offer,
  mission,
  onGo,
  onBack,
}: {
  offer: MissionOffer;
  mission: Mission;
  onGo(): void;
  onBack(): void;
}) {
  const { state, speak } = useGame();
  const island = islandOf(offer.islandId)!;
  useEffect(() => speak(mission.intro), [mission.intro, speak]);
  return (
    <main className="screen" aria-label={island.name}>
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          aria-label={ui.missionIntro.back}
          onClick={onBack}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="3" fill="none" />
          </svg>
        </button>
        <span className="chip">{island.game}</span>
        <Speaker text={mission.intro} />
      </header>
      <h1 className="title">{island.name}</h1>
      <div className={`scene scene-${offer.skillId}`}>
        <Dragon stage={state.dragonStage} label={ui.map.toothlessHere} size={150} />
      </div>
      <p className="lead">{mission.intro}</p>
      <button
        type="button"
        className="btn btn-primary btn-big"
        aria-label={ui.missionIntro.go}
        onClick={onGo}
      >
        {ui.missionIntro.go}
      </button>
    </main>
  );
}
