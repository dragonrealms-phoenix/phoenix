import { type ReactNode, useState } from 'react';
import { GameProvider } from '../../context/game';
import { GameBottomBar } from './game-bottom-bar';
import { GameGrid } from './game-grid';
import { GameSettings } from './game-settings';
import { GameTopBar } from './game-top-bar';

export interface GameContainerProps {
  // TODO
}

export const GameContainer: React.FC<GameContainerProps> = (
  props: GameContainerProps
): ReactNode => {
  const [showSettings, setShowSettings] = useState<boolean>(true);

  return (
    <GameProvider>
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
    </GameProvider>
  );
};

GameContainer.displayName = 'GameContainer';
