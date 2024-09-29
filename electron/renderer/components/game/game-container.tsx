import type { ReactNode } from 'react';
import { GameBottomBar } from './game-bottom-bar.jsx';
import { GameGrid } from './game-grid.jsx';
import { GameTopBar } from './game-top-bar.jsx';

export interface GameContainerProps {
  todo?: true;
}

export const GameContainer: React.FC<GameContainerProps> = (
  props: GameContainerProps
): ReactNode => {
  return (
    <>
      <GameTopBar />
      <GameGrid />
      <GameBottomBar />
    </>
  );
};

GameContainer.displayName = 'GameContainer';
