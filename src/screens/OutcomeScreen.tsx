import { useEffect } from 'react';
import { useGame } from '../app/GameContext';
import { Dragon } from '../components/Dragon';
import { Speaker } from '../components/Speaker';
import { abilityOf, islandOf, stageOf, ui } from '../content';
import type { MissionResult } from './MissionScreen';

/** S7 Razplet in nagrada. Always ends with one way out; the next mission never starts by itself. */
export function OutcomeScreen({
  result,
  onContinue,
}: {
  result: MissionResult;
  onContinue(): void;
}) {
  const { state, speak } = useGame();
  const { rewards } = result;
  const grew = rewards.stageTo > rewards.stageFrom;
  const lines = [
    result.mission.outro,
    ...rewards.abilities.map((id) => `${ui.outcome.newAbility}: ${abilityOf(id)?.name ?? ''}.`),
    ...rewards.islands.map((id) => `${ui.outcome.newIsland}: ${islandOf(id)?.name ?? ''}.`),
    ...(grew ? [`${ui.outcome.grew}: ${stageOf(rewards.stageTo).name}.`] : []),
    `${ui.outcome.bookEntry}: ${result.bookEntry}`,
  ];
  const label = result.breakDue ? ui.outcome.toBreak : ui.outcome.toMap;
  useEffect(() => speak(lines.join(' ')), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="screen screen-outcome" aria-label={ui.outcome.title}>
      <header className="topbar">
        <span />
        <Speaker text={lines.join(' ')} />
      </header>
      <h1 className="title">{ui.outcome.title}</h1>
      <div className={`celebrate${grew ? ' grow' : ''}`}>
        <Dragon stage={state.dragonStage} label={ui.map.toothlessHere} size={160} />
      </div>
      <p className="lead">{result.mission.outro}</p>
      <ul className="rewards">
        {rewards.abilities.map((id) => (
          <li key={id} className="reward">
            <strong>{ui.outcome.newAbility}:</strong> {abilityOf(id)?.name}.{' '}
            {abilityOf(id)?.description}
          </li>
        ))}
        {rewards.islands.map((id) => (
          <li key={id} className="reward">
            <strong>{ui.outcome.newIsland}:</strong> {islandOf(id)?.name}
          </li>
        ))}
        {grew && (
          <li className="reward">
            <strong>{ui.outcome.grew}:</strong> {stageOf(rewards.stageTo).name}
          </li>
        )}
        <li className="reward reward-book">
          <strong>{ui.outcome.bookEntry}:</strong> {result.bookEntry}
        </li>
      </ul>
      <button
        type="button"
        className="btn btn-primary btn-big"
        aria-label={label}
        onClick={onContinue}
      >
        {label}
      </button>
    </main>
  );
}
