import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../app/GameContext';
import { Dragon } from '../components/Dragon';
import { Numpad } from '../components/Numpad';
import { Speaker } from '../components/Speaker';
import {
  bookText,
  format,
  hintText,
  islandOf,
  praise,
  promptText,
  stepText,
  ui,
  type Mission,
} from '../content';
import { TASKS_PER_MISSION } from '../engine/config';
import { explain } from '../engine/explain';
import { answerTask } from '../engine/game';
import { generateTask } from '../engine/generators';
import type { MissionOffer } from '../engine/missions';
import type { Rewards } from '../engine/progress';
import { applyRewards, completeMission } from '../engine/progress';
import { planTask } from '../engine/review';
import { isBreakDue } from '../engine/session';
import { TaskView } from '../games/TaskView';

export interface MissionResult {
  offer: MissionOffer;
  mission: Mission;
  rewards: Rewards;
  bookEntry: string;
  breakDue: boolean;
}

type Phase = 'answer' | 'explain' | 'correct';

/** S5 Miniigra with S6 Namig in razlaga (3 levels of help, PRD chapter 9). */
export function MissionScreen({
  offer,
  mission,
  onDone,
  onQuit,
}: {
  offer: MissionOffer;
  mission: Mission;
  onDone(result: MissionResult): void;
  onQuit(): void;
}) {
  const game = useGame();
  const { speak } = game;
  const hero = game.state.heroId ?? 'viki';
  const island = islandOf(offer.islandId)!;

  const [seedBase] = useState(() => Date.now().toString(36));
  const plan = (n: number) =>
    planTask(
      game.current().skills,
      game.current().reviewQueue,
      offer.skillId,
      n,
      `${seedBase}-${n}`,
    );

  const [n, setN] = useState(1);
  const [taskPlan, setTaskPlan] = useState(() => plan(1));
  const task = useMemo(
    () => generateTask(taskPlan.skillId, taskPlan.level, taskPlan.seed),
    [taskPlan],
  );
  const explanation = useMemo(() => explain(task), [task]);

  const [mistakes, setMistakes] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState<Phase>('answer');
  const [input, setInput] = useState('');
  const [praiseText, setPraiseText] = useState('');
  const [nudge, setNudge] = useState(0);

  const startLevel = useRef(game.current().skills[offer.skillId].level);
  const rewards = useRef<Rewards>({
    abilities: [],
    islands: [],
    stageFrom: game.current().dragonStage,
    stageTo: game.current().dragonStage,
  });

  const prompt = promptText(task);
  const hint1 = hintText(task.skillId, task.level, 1, hero);
  const hint2 = hintText(task.skillId, task.level, 2, hero);
  const showSolution = mistakes >= 3;
  const stepsText = explanation.steps.map(stepText);
  const solutionText = explanation.solution.map(stepText);

  useEffect(() => speak(prompt), [prompt, speak]);

  const submit = (value: number) => {
    if (phase !== 'answer') return;
    if (value === task.answer) {
      const effective = Math.max(mistakes, hintUsed ? 1 : 0);
      const answered = answerTask(game.current(), taskPlan, effective, Date.now());
      const rewarded = applyRewards(answered.state, answered.events);
      rewards.current = {
        abilities: [...rewards.current.abilities, ...rewarded.rewards.abilities],
        islands: [...rewards.current.islands, ...rewarded.rewards.islands],
        stageFrom: rewards.current.stageFrom,
        stageTo: rewarded.rewards.stageTo,
      };
      game.commit(rewarded.state);
      const text = praise(hero, effective > 0, n);
      setPraiseText(text);
      setPhase('correct');
      speak(text);
      return;
    }
    const m = mistakes + 1;
    setMistakes(m);
    setInput('');
    setNudge((k) => k + 1);
    if (m === 1) {
      setShowHint(true);
      speak(hint1);
    } else if (m === 2) {
      setPhase('explain');
      speak([hint2, ...stepsText].join(' '));
    } else {
      speak([...solutionText, ui.game.solutionTry].join(' '));
    }
  };

  const next = () => {
    if (n >= TASKS_PER_MISSION) {
      const today = game.today();
      const done = completeMission(
        game.current(),
        bookText(offer.skillId, startLevel.current),
        today,
      );
      game.commit(done);
      onDone({
        offer,
        mission,
        rewards: rewards.current,
        bookEntry: bookText(offer.skillId, startLevel.current),
        breakDue: isBreakDue(done, today),
      });
      return;
    }
    const nextN = n + 1;
    setN(nextN);
    setTaskPlan(plan(nextN));
    setMistakes(0);
    setHintUsed(false);
    setShowHint(false);
    setInput('');
    setPhase('answer');
  };

  return (
    <main className={`screen screen-mission game-${offer.skillId}`} aria-label={island.game}>
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          aria-label={ui.missionIntro.back}
          onClick={onQuit}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="3" fill="none" />
          </svg>
        </button>
        <span className="chip" aria-live="polite">
          {format(ui.game.progress, { n, total: TASKS_PER_MISSION })}
        </span>
        <div className="topbar-right">
          <Speaker text={prompt} />
          <button
            type="button"
            className="icon-btn"
            aria-label={ui.game.hint}
            disabled={phase !== 'answer'}
            onClick={() => {
              setHintUsed(true);
              setShowHint(true);
              speak(hint1);
            }}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path
                d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3zM9.5 19h5v2h-5z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </header>

      {taskPlan.isReview && <span className="chip chip-review">{ui.game.review}</span>}
      <p className="prompt">{prompt}</p>

      <div
        className={`board${showHint || showSolution ? ' has-help' : ''}`}
        data-testid="board"
        data-answer={task.answer}
      >
        <TaskView task={task} onAnswer={submit} disabled={phase !== 'answer'} />
      </div>

      {(showHint || showSolution) && phase === 'answer' && (
        <div className="bubble" role="status" key={nudge}>
          <Dragon
            stage={game.state.dragonStage}
            mood="think"
            label={ui.map.toothlessHere}
            size={56}
          />
          {showSolution ? (
            <div>
              <ol className="steps">
                {solutionText.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
              <p>{ui.game.solutionTry}</p>
            </div>
          ) : (
            <p>{hint1}</p>
          )}
        </div>
      )}

      {phase === 'correct' ? (
        <div className="praise" role="status">
          <Dragon stage={game.state.dragonStage} label={ui.map.toothlessHere} size={80} />
          <p className="praise-text">{praiseText}</p>
          <button
            type="button"
            className="btn btn-primary btn-big"
            aria-label={n >= TASKS_PER_MISSION ? ui.game.finish : ui.game.next}
            onClick={next}
          >
            {n >= TASKS_PER_MISSION ? ui.game.finish : ui.game.next}
          </button>
        </div>
      ) : (
        task.answerMode === 'numpad' && (
          <Numpad value={input} onChange={setInput} onSubmit={() => submit(Number(input))} />
        )
      )}

      {phase === 'explain' && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label={ui.game.explainTitle}>
          <div className="sheet">
            <div className="sheet-head">
              <Dragon
                stage={game.state.dragonStage}
                mood="think"
                label={ui.map.toothlessHere}
                size={64}
              />
              <h2>{ui.game.explainTitle}</h2>
              <Speaker text={[hint2, ...stepsText].join(' ')} />
            </div>
            <p>{hint2}</p>
            <ol className="steps steps-animated">
              {stepsText.map((t, i) => (
                <li key={i} style={{ animationDelay: `${i * 0.9}s` }}>
                  {t}
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="btn btn-primary btn-big"
              aria-label={ui.game.try}
              onClick={() => setPhase('answer')}
            >
              {ui.game.try}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
