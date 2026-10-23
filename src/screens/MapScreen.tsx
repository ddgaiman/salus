import { useGame } from '../app/GameContext';
import { Dragon } from '../components/Dragon';
import { Speaker } from '../components/Speaker';
import { islandOf, missions, ui } from '../content';
import type { MissionOffer } from '../engine/missions';
import { offerMissions } from '../engine/missions';

const POSITIONS: Record<string, { x: number; y: number }> = {
  'island-addsub': { x: 22, y: 26 },
  'island-compare': { x: 70, y: 40 },
  'island-muldiv': { x: 30, y: 66 },
  'bonus-addsub': { x: 74, y: 12 },
  'bonus-compare': { x: 76, y: 76 },
  'bonus-muldiv': { x: 20, y: 87 },
};

/** S3 Zemljevid otokov */
export function MapScreen({
  onPick,
  onParent,
  onBook,
}: {
  onPick(offer: MissionOffer): void;
  onParent(): void;
  onBook(): void;
}) {
  const { state } = useGame();
  const offers = offerMissions(state);
  const offered = new Map(offers.map((o) => [o.islandId, o]));
  const here = offers[0]?.islandId;

  return (
    <main className="screen screen-map" aria-label={ui.map.title}>
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label={ui.map.dragonBook} onClick={onBook}>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path
              d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-5a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h6z"
              fill="currentColor"
            />
          </svg>
        </button>
        <h1 className="title title-small">{ui.map.title}</h1>
        <div className="topbar-right">
          <Speaker text={ui.map.speech} />
          <button
            type="button"
            className="icon-btn"
            aria-label={ui.map.parentKey}
            onClick={onParent}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <circle cx="8" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <path d="M12 12h9M18 12v3M21 12v3" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
      </header>
      <div className="sea">
        {Object.keys(missions.islands).map((islandId) => {
          const pos = POSITIONS[islandId] ?? { x: 50, y: 50 };
          const island = islandOf(islandId)!;
          const offer = offered.get(islandId);
          const locked = islandId.startsWith('bonus-') && !state.unlockedIslands.includes(islandId);
          const style = { left: `${pos.x}%`, top: `${pos.y}%` };
          if (offer) {
            return (
              <button
                key={islandId}
                type="button"
                className="map-island is-open"
                style={style}
                aria-label={`${island.name}: ${island.game}`}
                onClick={() => onPick(offer)}
              >
                <span className="island-shape" aria-hidden="true" />
                <span className="map-label">{island.name}</span>
                {here === islandId && (
                  <span className="map-dragon">
                    <Dragon stage={state.dragonStage} label={ui.map.toothlessHere} size={56} />
                  </span>
                )}
              </button>
            );
          }
          return (
            <div
              key={islandId}
              className={`map-island ${locked ? 'is-locked' : 'is-rest'}`}
              style={style}
              role="img"
              aria-label={locked ? `${island.name}. ${ui.map.locked}` : island.name}
            >
              <span className="island-shape" aria-hidden="true" />
              {locked ? (
                <svg className="lock" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
                  <path
                    d="M8 11V8a4 4 0 0 1 8 0v3"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                  />
                </svg>
              ) : (
                <span className="map-label">{island.name}</span>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
