import type { ReactNode } from 'react';

export interface GameTopBarProps {
  // TODO
  todo?: true;
}

export const GameTopBar: React.FC<GameTopBarProps> = (
  props: GameTopBarProps
): ReactNode => {
  return <></>;
};

GameTopBar.displayName = 'GameTopBar';
