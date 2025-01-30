import type { ReactNode } from 'react';
import { GameCommandInput } from './game-command-input.jsx';
import { GameCompass } from './game-compass.jsx';
import { GameHands } from './game-hands.jsx';
import { GameRoundTime } from './game-roundtime.jsx';

export const GameBottomBar: React.FC = (): ReactNode => {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        paddingTop: '5px',
        paddingBottom: '5px',
        paddingLeft: '5px',
        paddingRight: '5px',
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <GameRoundTime />
        <GameCompass />
        <GameHands />
      </div>
      <GameCommandInput />
    </div>
  );
};

GameBottomBar.displayName = 'GameBottomBar';
