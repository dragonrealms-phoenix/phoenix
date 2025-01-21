import type { ReactNode } from 'react';
import type {
  GridItemBoundary,
  GridItemContent,
} from '../../types/grid.types.js';
import { Grid } from '../grid/grid.jsx';

export interface GameGridProps {
  boundary: GridItemBoundary;
  contentItems: Array<GridItemContent>;
}

export const GameGrid: React.FC<GameGridProps> = (
  props: GameGridProps
): ReactNode => {
  const { boundary, contentItems } = props;

  return <Grid boundary={boundary} contentItems={contentItems} />;
};

GameGrid.displayName = 'GameGrid';
