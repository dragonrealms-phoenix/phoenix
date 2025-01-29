import type { ReactNode } from 'react';
import { GameCommandInput } from './game-command-input.jsx';
import { GameCompass } from './game-compass.jsx';
import { GameRoundTime } from './game-roundtime.jsx';

export const GameBottomBar: React.FC = (): ReactNode => {
  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        paddingTop: '5px',
        paddingBottom: '5px',
        paddingLeft: '5px',
        paddingRight: '10px',
      }}
    >
      <GameRoundTime />
      <GameCommandInput />
      <GameCompass />
    </div>
  );
};

GameBottomBar.displayName = 'GameBottomBar';
