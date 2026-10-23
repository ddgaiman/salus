import { useState } from 'react';
import { GameProvider, useGame } from './app/GameContext';
import { missionsFor } from './content';
import { TASKS_PER_MISSION } from './engine/config';
import type { MissionOffer } from './engine/missions';
import { missionIndex, offerMissions } from './engine/missions';
import { isBreakDue } from './engine/session';
import type { Mission } from './content';
import { BookScreen } from './screens/BookScreen';
import { BreakScreen } from './screens/BreakScreen';
import { HeroScreen } from './screens/HeroScreen';
import { IntroScreen } from './screens/IntroScreen';
import { MapScreen } from './screens/MapScreen';
import { MissionIntroScreen } from './screens/MissionIntroScreen';
import type { MissionResult } from './screens/MissionScreen';
import { MissionScreen } from './screens/MissionScreen';
import { OutcomeScreen } from './screens/OutcomeScreen';
import { ParentScreen } from './screens/ParentScreen';

type Screen =
  | { name: 'intro' }
  | { name: 'hero' }
  | { name: 'map' }
  | { name: 'missionIntro'; offer: MissionOffer; mission: Mission }
  | { name: 'mission'; offer: MissionOffer; mission: Mission }
  | { name: 'outcome'; result: MissionResult }
  | { name: 'break' }
  | { name: 'book' }
  | { name: 'parent'; back: Screen };

function Game() {
  const game = useGame();
  const [screen, setScreen] = useState<Screen>(() =>
    isBreakDue(game.current(), game.today()) ? { name: 'break' } : { name: 'intro' },
  );

  /** Map, unless today's missions are used up. */
  const home = (): Screen =>
    isBreakDue(game.current(), game.today()) ? { name: 'break' } : { name: 'map' };

  const storyFor = (offer: MissionOffer): Mission => {
    const bonus = offer.islandId.startsWith('bonus-');
    const list = missionsFor(offer.skillId, bonus);
    const i = missionIndex(game.current(), offer.skillId, TASKS_PER_MISSION);
    return list[i % list.length]!;
  };

  const openMission = (offer: MissionOffer) =>
    setScreen(
      isBreakDue(game.current(), game.today())
        ? { name: 'break' }
        : { name: 'missionIntro', offer, mission: storyFor(offer) },
    );

  switch (screen.name) {
    case 'intro':
      return (
        <IntroScreen onStart={() => setScreen(game.current().heroId ? home() : { name: 'hero' })} />
      );
    case 'hero':
      return (
        <HeroScreen
          onChosen={() => {
            // First run goes straight to the first, easy mission (PRD path 1).
            const first = game.current().log.length === 0 ? offerMissions(game.current())[0] : null;
            if (first) openMission(first);
            else setScreen(home());
          }}
        />
      );
    case 'map':
      return (
        <MapScreen
          onPick={openMission}
          onParent={() => setScreen({ name: 'parent', back: screen })}
          onBook={() => setScreen({ name: 'book' })}
        />
      );
    case 'missionIntro':
      return (
        <MissionIntroScreen
          offer={screen.offer}
          mission={screen.mission}
          onBack={() => setScreen(home())}
          onGo={() => setScreen({ name: 'mission', offer: screen.offer, mission: screen.mission })}
        />
      );
    case 'mission':
      return (
        <MissionScreen
          key={screen.mission.id + screen.offer.islandId}
          offer={screen.offer}
          mission={screen.mission}
          onQuit={() => setScreen(home())}
          onDone={(result) => setScreen({ name: 'outcome', result })}
        />
      );
    case 'outcome':
      return <OutcomeScreen result={screen.result} onContinue={() => setScreen(home())} />;
    case 'break':
      return <BreakScreen onParent={() => setScreen({ name: 'parent', back: screen })} />;
    case 'book':
      return <BookScreen onBack={() => setScreen(home())} />;
    case 'parent':
      return (
        <ParentScreen
          onClose={() =>
            setScreen(
              !game.current().heroId
                ? { name: 'intro' }
                : screen.back.name === 'break'
                  ? home()
                  : screen.back,
            )
          }
          onChangeHero={() => setScreen({ name: 'hero' })}
        />
      );
  }
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
