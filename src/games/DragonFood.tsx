import { useState } from 'react';
import { format, ui } from '../content';
import type { Task } from '../engine/task';
import { Dragon } from '../components/Dragon';
import { Fish } from './icons';

/** G3 Zmajska hrana: equal groups of fish, or sharing fish by tapping dragons. */
export function DragonFood({ task }: { task: Task }) {
  const v = task.visual;
  if (v.kind === 'groups') {
    return (
      <div className="dragons">
        {Array.from({ length: v.groups }, (_, i) => (
          <div key={i} className="dragon-plate">
            <Dragon label={format(ui.game.dragon, { n: i + 1 })} size={v.groups > 5 ? 44 : 60} />
            {v.showObjects ? (
              <div className="plate">
                {Array.from({ length: v.perGroup }, (_, j) => (
                  <Fish key={j} />
                ))}
              </div>
            ) : (
              <span className="plate-count">{format(ui.game.fishCount, { n: v.perGroup })}</span>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (v.kind !== 'share') return null;
  return <Share key={task.id} total={v.total} groups={v.groups} showObjects={v.showObjects} />;
}

function Share({
  total,
  groups,
  showObjects,
}: {
  total: number;
  groups: number;
  showObjects: boolean;
}) {
  const [given, setGiven] = useState<number[]>(() => Array(groups).fill(0));
  const left = total - given.reduce((a, b) => a + b, 0);
  const give = (i: number) => {
    if (left <= 0) return;
    setGiven((g) => g.map((n, j) => (j === i ? n + 1 : n)));
  };
  return (
    <div className="share">
      <div className="fish-pile" role="group" aria-label={ui.game.fishPile}>
        {showObjects
          ? Array.from({ length: left }, (_, i) => <Fish key={i} />)
          : format(ui.game.fishCount, { n: left })}
      </div>
      <div className="dragons">
        {given.map((n, i) => (
          <button
            key={i}
            type="button"
            className="dragon-plate dragon-btn"
            aria-label={format(ui.game.giveFish, { n: i + 1 })}
            onClick={() => give(i)}
          >
            <Dragon label="" size={52} />
            <span className="plate">
              {showObjects ? Array.from({ length: n }, (_, j) => <Fish key={j} />) : n}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
