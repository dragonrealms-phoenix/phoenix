import { useState } from 'react';
import type { ReactNode } from 'react';
import { GameBottomBar } from './game-bottom-bar.jsx';
import { GameGrid } from './game-grid.jsx';
import { GameSettings } from './game-settings.jsx';
import { GameTopBar } from './game-top-bar.jsx';

export interface GameContainerProps {
  // TODO
}

export const GameContainer: React.FC<GameContainerProps> = (
  props: GameContainerProps
): ReactNode => {
  const [showSettings, setShowSettings] = useState<boolean>(true);

  return (
    <>
      <GameTopBar />
      <GameGrid />
      <GameBottomBar />
      <GameSettings
        show={showSettings}
        onHide={() => {
          setShowSettings(false);
          // setTimeout(() => {
          //   setShowSettings(true);
          // }, 10_000);
        }}
      />
    </>
  );
};

GameContainer.displayName = 'GameContainer';
