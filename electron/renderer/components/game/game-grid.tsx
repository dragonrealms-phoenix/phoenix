import type { ReactNode } from 'react';
import GridPage from '../../pages/grid';

export interface GameGridProps {
  // TODO
}

export const GameGrid: React.FC<GameGridProps> = (
  props: GameGridProps
): ReactNode => {
  return <GridPage />;
};

GameGrid.displayName = 'GameGrid';
