import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { ui } from '../content';
import type { Task } from '../engine/task';
import { Coin } from './icons';

interface CoinState {
  id: number;
  inChest: boolean;
}

/** G1 Zakladnica: coins can be dragged or tapped between the chest and the side. */
export function Treasury({ task }: { task: Task }) {
  const v = task.visual;
  if (v.kind === 'equation') {
    return (
      <div className="treasury">
        <div className="chest chest-small" aria-hidden="true" />
        <p className="equation" aria-hidden="true">
          {v.a} {v.op === '-' ? '−' : '+'} {v.b} = ?
        </p>
      </div>
    );
  }
  if (v.kind !== 'coins') return null;
  return <CoinBoard key={task.id} start={v.start} change={v.change} op={v.op} />;
}

function CoinBoard({ start, change, op }: { start: number; change: number; op: '+' | '-' }) {
  const [coins, setCoins] = useState<CoinState[]>(() => [
    ...Array.from({ length: start }, (_, i) => ({ id: i, inChest: true })),
    ...(op === '+'
      ? Array.from({ length: change }, (_, i) => ({ id: start + i, inChest: false }))
      : []),
  ]);
  const chestRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const [offset, setOffset] = useState<{ id: number; dx: number; dy: number } | null>(null);

  const move = (id: number, inChest: boolean) =>
    setCoins((cs) => cs.map((c) => (c.id === id ? { ...c, inChest } : c)));

  const onDown = (id: number) => (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { id, x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
    if (d.moved) setOffset({ id: d.id, dx, dy });
  };
  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    setOffset(null);
    if (!d) return;
    const coin = coins.find((c) => c.id === d.id);
    if (!coin) return;
    if (!d.moved) {
      move(d.id, !coin.inChest);
      return;
    }
    const rect = chestRef.current?.getBoundingClientRect();
    const inside =
      !!rect &&
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    move(d.id, inside);
  };

  const render = (c: CoinState) => (
    <button
      key={c.id}
      type="button"
      className="coin-btn"
      aria-label={ui.game.coin}
      style={
        offset?.id === c.id
          ? { transform: `translate(${offset.dx}px, ${offset.dy}px)`, zIndex: 5 }
          : undefined
      }
      onPointerDown={onDown(c.id)}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={() => {
        drag.current = null;
        setOffset(null);
      }}
    >
      <Coin />
    </button>
  );

  return (
    <div className="treasury">
      <div className="chest" ref={chestRef} role="group" aria-label={ui.game.chest}>
        {coins.filter((c) => c.inChest).map(render)}
      </div>
      <div className="coin-side" role="group" aria-label={ui.game.coinsLeft}>
        {coins.filter((c) => !c.inChest).map(render)}
      </div>
      <p className="tip">{ui.game.dragCoins}</p>
    </div>
  );
}
