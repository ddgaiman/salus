import { useState } from 'react';
import { useGame } from '../app/GameContext';
import { Numpad } from '../components/Numpad';
import { format, ui } from '../content';
import { successRate } from '../engine/missions';
import { clampMissionsBeforeBreak, missionsToday } from '../engine/session';
import { SKILL_IDS } from '../engine/types';
import { resetProgress } from '../storage/storage';

/** S9 Starševski kotiček, behind a multiplication gate for adults. */
export function ParentScreen({ onClose, onChangeHero }: { onClose(): void; onChangeHero(): void }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <ParentCorner onClose={onClose} onChangeHero={onChangeHero} />
  ) : (
    <ParentGate onPass={() => setOpen(true)} onClose={onClose} />
  );
}

function ParentGate({ onPass, onClose }: { onPass(): void; onClose(): void }) {
  const [{ a, b }] = useState(() => ({
    a: 6 + Math.floor(Math.random() * 4),
    b: 6 + Math.floor(Math.random() * 4),
  }));
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  return (
    <main className="screen screen-parent" aria-label={ui.parent.gateTitle}>
      <header className="topbar">
        <span />
        <h1 className="title title-small">{ui.parent.gateTitle}</h1>
        <button type="button" className="icon-btn" aria-label={ui.parent.close} onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" />
          </svg>
        </button>
      </header>
      <p className="lead">{format(ui.parent.gateQuestion, { a, b })}</p>
      {wrong && <p role="status">{ui.parent.gateWrong}</p>}
      <Numpad
        value={value}
        onChange={setValue}
        submitLabel={ui.parent.enter}
        onSubmit={() => {
          if (Number(value) === a * b) onPass();
          else {
            setWrong(true);
            setValue('');
          }
        }}
      />
    </main>
  );
}

function ParentCorner({ onClose, onChangeHero }: { onClose(): void; onChangeHero(): void }) {
  const game = useGame();
  const { state } = game;
  const [confirm, setConfirm] = useState(false);
  const n = state.settings.missionsBeforeBreak;
  const setN = (v: number) =>
    game.commit({
      ...game.current(),
      settings: { ...game.current().settings, missionsBeforeBreak: clampMissionsBeforeBreak(v) },
    });
  const setVoice = (voice: 'tts' | 'recorded') =>
    game.commit({ ...game.current(), settings: { ...game.current().settings, voice } });

  return (
    <main className="screen screen-parent" aria-label={ui.parent.title}>
      <header className="topbar">
        <span />
        <h1 className="title title-small">{ui.parent.title}</h1>
        <button type="button" className="icon-btn" aria-label={ui.parent.close} onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" />
          </svg>
        </button>
      </header>

      {game.notice && (
        <section className="card card-notice" role="alert">
          <p>
            {game.notice === 'unknownVersion'
              ? ui.parent.noticeUnknownVersion
              : ui.parent.noticeCorrupt}
          </p>
          <button
            type="button"
            className="btn"
            aria-label={ui.parent.noticeDismiss}
            onClick={game.dismissNotice}
          >
            {ui.parent.noticeDismiss}
          </button>
        </section>
      )}

      <section className="card">
        <h2>{ui.parent.skills}</h2>
        <ul className="list">
          {SKILL_IDS.map((id) => {
            const rate = successRate(state, id);
            const s = state.skills[id];
            return (
              <li key={id} data-testid={`skill-${id}`}>
                <strong>{ui.parent.skillNames[id]}</strong>
                <br />
                {format(ui.parent.level, { n: s.level })}
                {s.mastered && ` · ${ui.parent.mastered}`}
                <br />
                <span className="muted">
                  {rate === null
                    ? ui.parent.noData
                    : format(ui.parent.success, { n: Math.round(rate * 100) })}
                </span>
              </li>
            );
          })}
        </ul>
        <p>{format(ui.parent.missionsToday, { n: missionsToday(state, game.today()) })}</p>
      </section>

      <section className="card">
        <h2>{ui.parent.settings}</h2>
        <div className="row">
          <span>{ui.parent.missionsBeforeBreak}</span>
          <div className="stepper">
            <button
              type="button"
              className="key"
              aria-label={ui.parent.decrease}
              onClick={() => setN(n - 1)}
            >
              −
            </button>
            <output aria-label={ui.parent.missionsBeforeBreak} data-testid="break-setting">
              {n}
            </output>
            <button
              type="button"
              className="key"
              aria-label={ui.parent.increase}
              onClick={() => setN(n + 1)}
            >
              +
            </button>
          </div>
        </div>
        <div className="row">
          <span>{ui.parent.voice}</span>
          <div className="segmented">
            {(['tts', 'recorded'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`btn${state.settings.voice === v ? ' is-selected' : ''}`}
                aria-pressed={state.settings.voice === v}
                aria-label={v === 'tts' ? ui.parent.voiceTts : ui.parent.voiceRecorded}
                onClick={() => setVoice(v)}
              >
                {v === 'tts' ? ui.parent.voiceTts : ui.parent.voiceRecorded}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="btn"
          aria-label={ui.parent.changeHero}
          onClick={onChangeHero}
        >
          {ui.parent.changeHero}
        </button>
      </section>

      <section className="card">
        {confirm ? (
          <>
            <p>{ui.parent.resetConfirm}</p>
            <div className="row">
              <button
                type="button"
                className="btn btn-warn"
                aria-label={ui.parent.resetYes}
                onClick={() => {
                  game.commit(resetProgress(game.current(), game.today()));
                  setConfirm(false);
                  onClose();
                }}
              >
                {ui.parent.resetYes}
              </button>
              <button
                type="button"
                className="btn"
                aria-label={ui.parent.resetNo}
                onClick={() => setConfirm(false)}
              >
                {ui.parent.resetNo}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="btn"
            aria-label={ui.parent.reset}
            onClick={() => setConfirm(true)}
          >
            {ui.parent.reset}
          </button>
        )}
      </section>
    </main>
  );
}
