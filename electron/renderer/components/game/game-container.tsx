import { useState } from 'react';
import type { ReactNode } from 'react';
import { GameBottomBar } from './game-bottom-bar.js';
import { GameGrid } from './game-grid.js';
import { GameSettings } from './game-settings.js';
import { GameTopBar } from './game-top-bar.js';

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
